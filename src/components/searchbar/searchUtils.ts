import { distance as levenDist } from 'fastest-levenshtein';

import { Building, SearchMap, SearchRoom } from '@/types';

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

// const [eventsResults, setEventsResults] = useState<Event[]>([]);
// searchEvents(searchQuery).then(setEventsResults);

function getRoomTokens(room: SearchRoom, building: Building): string[] {
  let tokens = [room.name, building.code, building.name];
  if (room.aliases) {
    tokens = tokens.concat(room.aliases.flatMap((alias) => alias.split(' ')));
  }
  return tokens
    .filter((token) => token.length > 0)
    .map((token) => token.toLowerCase());
}

export const searchRoomsAll = (
  buildings: Record<string, Building>,
  query: string,
  searchMap: SearchMap,
) => {
  return Object.values(buildings)
    .map((building: Building) => ({
      Building: building,
      Rooms: findRooms(query, building, searchMap[building.code]),
    }))
    .filter((buildingResult) => buildingResult['Rooms'][0].length > 0)
    .sort((a, b) => a['Rooms'][1] - b['Rooms'][1])
    .map(({ Building: building, Rooms: rooms }) => {
      return { building, searchRoom: rooms[0] };
    });
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
): [SearchRoom[], number] => {
  if (!floorMap || query.length < 3) {
    return [[], -1];
  }
  // No query: only show building names
  const lDistCache = new Map();
  // Query for another building
  const roomsList = building.floors.flatMap((floorLevel) => {
    if (!floorMap?.[floorLevel]) {
      return [];
    }
    const roomsObj = Object.values(floorMap[floorLevel]);
    const queryTokens = query
      .toLowerCase()
      .split(' ')
      .filter((token) => token.length > 0);
    return (
      Object.values(roomsObj)
        // .filter((roomId: string, room: Room) => { // for new floors layout
        .filter((room: SearchRoom) => {
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
              // If there is a query token that dosen't have a reasonable match
              score = 999;
              break;
            }
            score += bestScore;
          }
          if (score < queryTokens.length * 0.5) {
            lDistCache.set(room.id, score);
          }
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
  });

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
