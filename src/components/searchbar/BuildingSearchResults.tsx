import React, { useMemo } from 'react';
import { AbsoluteCoordinate, Building, Floor, FloorMap, Room } from '@/types';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import styles from '../../styles/BuildingSearchResults.module.css';
import clsx from 'clsx';
import simplify from '@/util/simplify';
import titleCase from '@/util/titleCase';
import Roundel from '../shared/Roundel';
import RoomPin from '../building-display/RoomPin';
import { distance } from '@/geometry';

import { distance as levenDist } from 'fastest-levenshtein';

function roomType(room: Room): string {
  switch (room.type) {
    case 'study':
      return 'Study Room';
    default:
      return room.type;
  }
}

export interface BuildingSearchResultsProps {
  query: string;
  building: Building;
  floorMap: FloorMap;
  onSelectBuilding: (selectedBuilding: Building) => void;
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  userPosition: AbsoluteCoordinate;
}

type RoomWithOrdinal = Room & { floor: Floor };

function fullRoomName(room: Room, building: Building, abbrev = false): string {
  const buildingName = abbrev ? building.code : building.name;
  return room.alias ? buildingName + room.alias : buildingName + room.name;
}

/**
 * Displays the search results for a specific building.
 */
export default function BuildingSearchResults({
  query,
  building,
  floorMap,
  onSelectBuilding,
  onSelectRoom,
  userPosition,
}: BuildingSearchResultsProps) {
  // const roomNames: string[] = useMemo(
  //   () =>
  //     building.floors.flatMap(
  //       (floor: Floor) =>
  //         floorMap[`${building.code}-${floor.name}`]?.rooms
  //           .filter((room: Room) => room.alias)
  //           .map((room: Room) => simplify(room.alias!)) ?? [],
  //     ),
  //   [building, floorMap],
  // );

  const filteredRooms: RoomWithOrdinal[] = useMemo(() => {
    // No query: only show building names
    const lDistCache = new Map();
    // Query for another building
    const roomsList = building.floors.flatMap(
      (floor: Floor) =>
        floorMap[`${building.code}-${floor.name}`]?.rooms
          .filter((room: Room) => {
            const fullName = fullRoomName(room, building);
            const fullCodeName = fullRoomName(room, building, true);
            const a = levenDist(query.toLowerCase(), fullName.toLowerCase());
            const b = levenDist(
              query.toLowerCase(),
              fullCodeName.toLowerCase(),
            );
            const c =
              !!room.alias &&
              levenDist(query.toLowerCase(), room.alias.toLowerCase());
            const d =
              !!room.type &&
              levenDist(query.toLowerCase(), room.type.toLowerCase());
            lDistCache.set(room.id, (a + b + c + d) / 4);
            return (
              a < fullName.length / 3 ||
              b < fullCodeName.length / 3 ||
              (room.alias && c < room.alias.length / 3) ||
              (room.type && d < room.type.length / 3)
            );
          })
          .map((room: Room) => ({
            ...room,
            floor,
          })) ?? [],
    );

    if (userPosition) {
      roomsList.sort(
        (a, b) =>
          distance(a.labelPosition, userPosition) -
          distance(b.labelPosition, userPosition),
      );
    }

    roomsList.sort((a, b) => lDistCache.get(a.id) - lDistCache.get(b.id));

    return roomsList;
  }, [query, building, userPosition, floorMap]);

  if (
    filteredRooms.length == 0 &&
    levenDist(
      building.name.substring(0, query.length).toLowerCase(),
      query.toLowerCase(),
    ) > 2 &&
    levenDist(
      building.code.substring(0, query.length).toLowerCase(),
      query.toLowerCase(),
    ) > 2
  ) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        className={
          /*
          clsx(
            //styles['search-list-element'],
            //styles['search-list-element-building'],
            filteredRooms?.length > 0 //&& //styles['search-list-element-sticky'],
          ) 
          +*/
          'b-0 m-0 flex h-14 w-full items-center gap-2 p-[var(--main-ui-padding)]' + //search-list-element
          'text-[105%] font-medium tracking-[-0.01em]' + //search-list-element-building
          `${filteredRooms?.length > 0 ? 'sticky left-0 top-0 w-full bg-[var(--search-background)] backdrop-blur' : ''}`
          //search-list-element-sticky
        }
        onClick={() => onSelectBuilding(building)}
      >
        <Roundel code={building.code} />
        <span className={'flex grow overflow-hidden leading-[1.3]'}>
          {/*styles['search-list-element-title']*/}
          {building.name}
        </span>
        <ChevronRightIcon className={'h-5 w-5 fill-[#0000004d]'} />
        {/*styles['search-list-arrow']*/}
      </button>

      {filteredRooms.map((room: RoomWithOrdinal) => {
        return (
          <button
            type="button"
            className={
              //styles['search-list-element']
              'b-0 m-0 flex h-14 w-full items-center gap-2 p-[var(--main-ui-padding)]' //search-list-element
            }
            key={room.id}
            onClick={() => onSelectRoom(room, building, room.floor)}
          >
            <div className={'w-40px flex justify-end'}>
              {/*styles['search-list-element-pin']*/}
              <RoomPin room={room} />
            </div>
            <div
              className={
                /*clsx(
                //styles['search-list-element-title'],
                //styles['search-list-element-room'],
              )*/
                'flex grow overflow-hidden leading-[1.3]' + //search-list-element-title
                'flex flex-col leading-[1.2]' //search-list-element-room
              }
            >
              <div>
                <span className={'font-medium' + styles['search-room-code']}>
                  {building.code} {room.name}
                </span>
                {room.type !== 'default' && (
                  <span>{` • ${titleCase(roomType(room))}`}</span>
                )}
              </div>
              {room.alias && (
                <div className={'truncate'}>
                  {/*styles['search-room-name']*/}
                  {room.alias}
                </div>
              )}
            </div>
            <ChevronRightIcon className={'h-5 w-5 fill-[#0000004d]'} />
            {/*styles['search-list-arrow']*/}
          </button>
        );
      })}
    </div>
  );
}
