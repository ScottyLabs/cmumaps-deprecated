import { distance as levenDist } from 'fastest-levenshtein';

import { AbsoluteCoordinate, Building, Floor, FloorMap, Room } from '@/types';
import { distance } from '@/util/geometry';

function fullRoomName(room: Room, building: Building, abbrev = false): string {
  const buildingName = abbrev ? building.code : building.name;
  return room.alias ? buildingName + room.alias : buildingName + room.name;
}

export const findRooms = (
  query: string,
  building: Building,
  floorMap: FloorMap,
  userPosition: AbsoluteCoordinate,
): Room[] => {
  // No query: only show building names
  const lDistCache = new Map();
  // Query for another building
  const roomsList = building.floors.flatMap((floor: Floor) => {
    if (!floorMap[`${building.code}-${floor.level}`]?.rooms) {
      return [];
    }
    // let roomsObj = Object.entries(floorMap[`${building.code}-${floor.name}`]?.rooms) // for new floors layout
    const roomsObj = floorMap[`${building.code}-${floor.level}`]?.rooms; // for legacy floors layout
    return (
      Object.values(roomsObj)
        // .filter((roomId: string, room: Room) => { // for new floors layout
        .filter((room: Room) => {
          return (
            fullRoomName(room, building).includes(query) ||
            (room.alias && room.alias.includes(query))
          );

          // legacy floors layout
          const fullName = fullRoomName(room, building);
          const fullCodeName = fullRoomName(room, building, true);
          const a = levenDist(query.toLowerCase(), fullName.toLowerCase());
          const b = levenDist(query.toLowerCase(), fullCodeName.toLowerCase());
          const c =
            !!room.alias &&
            levenDist(query.toLowerCase(), room.alias.toLowerCase());
          const d =
            !!room.type &&
            levenDist(query.toLowerCase(), room.type.toLowerCase());
          // lDistCache.set(roomId, (a + b + c + d) / 4); // new
          lDistCache.set(room.id, (a + b + c + d) / 4); // legacy

          return (
            a < fullName.length / 3 ||
            b < fullCodeName.length / 3 ||
            (room.alias && c < room.alias.length / 3) ||
            (room.type && d < room.type.length / 3)
          );
        })
    );
  });

  if (userPosition) {
    roomsList.sort(
      (a, b) =>
        distance(a.labelPosition, userPosition) -
        distance(b.labelPosition, userPosition),
    );
  }

  roomsList.sort((a, b) => lDistCache.get(a.id) - lDistCache.get(b.id));

  if (!roomsList) {
    return [];
  }

  return roomsList;

  // if (
  //   filteredRooms.length == 0 &&
  //   levenDist(
  //     building.name.substring(0, query.length).toLowerCase(),
  //     query.toLowerCase(),
  //   ) > 2 &&
  //   levenDist(
  //     building.code.substring(0, query.length).toLowerCase(),
  //     query.toLowerCase(),
  //   ) > 2
  // ) {
  //   return null;
  // }
};
