import { distance as levenDist } from 'fastest-levenshtein';
import { Coordinate } from 'mapkit-react';

import { Building, RoomType, SearchMap, SearchRoom } from '@/types';

import { SearchMode } from './searchMode';

export type RoomSearchResult = {
  building: Building;
  searchRoom: SearchRoom[];
};

const nonAsciiRe = /[^a-zA-Z0-9']/; //Includes ' for scotty's market

const modeToType: Partial<Record<SearchMode, RoomType>> = {
  food: 'Food',
  restrooms: 'Restroom',
  study: 'Classroom',
};

// sort building by distance
// if (userPosition) {
//   buildings.sort(
//     (b, a) =>
//       distance(
//         [b.labelPosition.longitude, b.labelPosition.latitude],
//         userPosition,
//       ) -
//       distance(
//         [a.labelPosition.longitude, a.labelPosition.latitude],
//         userPosition,
//       ),
//   );
// }

function getRoomTokens(room: SearchRoom, building: Building): string[] {
  let tokens = [room.name, building.code, ...building.name.split(nonAsciiRe)];
  if (room.aliases) {
    tokens = tokens.concat(
      room.aliases.flatMap((alias) => alias.split(nonAsciiRe)),
    );
  }
  return tokens
    .filter((token) => token.length > 0)
    .map((token) => token.toLowerCase());
}

export const searchRoom = (
  buildings: Record<string, Building>,
  query: string,
  userPosition: Coordinate | null,
  searchMap: SearchMap,
  mode: 'rooms' | 'food' | 'restrooms' | 'study',
): RoomSearchResult[] => {
  userPosition;

  if (query.length == 0 && mode == 'rooms') {
    return [];
  }

  return Object.values(buildings)
    .map((building: Building) => ({
      Building: building,
      Rooms: findRooms(query, building, searchMap[building.code], mode),
    }))
    .filter(
      (buildingResult) =>
        buildingResult['Rooms'][0].length > 0 ||
        (mode == 'rooms' && possiblyBuilding(query, buildingResult.Building)),
    )
    .sort((a, b) => a['Rooms'][1] - b['Rooms'][1])
    .map(({ Building: building, Rooms: rooms }) => {
      return { building, searchRoom: rooms[0] };
    });
};

const possiblyBuilding = (query: string, building: Building): boolean => {
  const queryTokens = query
    .toLowerCase()
    .split(nonAsciiRe)
    .filter((token) => token.length > 0);
  const buildingTokens = [
    building.code,
    ...building.name.split(nonAsciiRe),
  ].map((token) => token.toLowerCase());
  return queryTokens.some((queryToken) =>
    buildingTokens.some((buildingToken) =>
      buildingToken.startsWith(queryToken),
    ),
  );
};

/*
For search, we assume each user's word (query tokens taken by whitespace tokenization) is a part of 
either a building name, a room name, or a room alias (call these target tokens). Then, for each target,
we get it's tokens and compute a score for the compatibility of each target token for each query token.
Since we assume that each query word does not correspond to more than one type of target token, we can
estimate the distance between query and target by taking the maximum of the scores for each query token.
Effectively, this computes the distance between the query token and it's most likely meaning. We then
sum those distances to get a total distance for the query and target.
*/
const findRooms = (
  query: string,
  building: Building,
  floorMap: Record<string, SearchRoom[]>,
  mode: 'rooms' | 'food' | 'restrooms' | 'study',
): [SearchRoom[], number] => {
  if (!floorMap || (query.length < 2 && mode == 'rooms')) {
    return [[], -1];
  }
  const lDistCache = new Map();
  // Query for another building
  const roomsList = building.floors
    .flatMap((floorLevel) => {
      if (!floorMap?.[floorLevel]) {
        return [];
      }
      const roomsObj = Object.values(floorMap[floorLevel]);
      const queryTokens = query
        .toLowerCase()
        .split(nonAsciiRe)
        .filter((token) => token.length > 0);

      return (
        Object.values(roomsObj)
          .filter((room: SearchRoom) => {
            if (mode != 'rooms' && room.type != modeToType[mode]) {
              return false;
            }
            if (queryTokens.length == 0) {
              return true;
            }
            const roomTokens = getRoomTokens(room, building);
            let score = 0;
            for (const queryToken of queryTokens) {
              let bestScore = 999;
              for (const roomToken of roomTokens) {
                bestScore = Math.min(
                  bestScore,
                  levenDist(
                    queryToken,
                    roomToken.substring(0, queryToken.length),
                  ),
                );
              }
              if (bestScore > queryToken.length / 2) {
                // If there is a query token that doesn't have a reasonable match
                score = 999;
                break;
              }
              score += bestScore;
            }
            lDistCache.set(room.id, score);
            return score < queryTokens.length;
          })
          // .map(([roomId, room]) => ({ // new
          .map((room) => ({
            ...room,
            floor: {
              buildingCode: building.code,
              level: floorLevel,
            },
          })) ?? []
      );
    })
    .sort(
      (a, b) => (lDistCache.get(b.id) || 1000) - (lDistCache.get(a.id) || 1000),
    );

  // if (userPosition) {
  //   roomsList.sort(
  //     (a, b) =>
  //       distance(a.labelPosition, userPosition) -
  //       distance(b.labelPosition, userPosition),
  //   );
  // }

  if (!roomsList || roomsList.length == 0) {
    return [[], -1];
  }
  return [roomsList, lDistCache.get(roomsList[0].id)];
};
