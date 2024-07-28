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
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { claimBuilding, claimRoom } from '@/lib/features/uiSlice';

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
  userPosition,
}: BuildingSearchResultsProps) {
  let floorMap = useAppSelector((state) => state.data.legacyFloorMap); // for legacy floors layout (use state.data.floorMap for new floors layout)
  floorMap = floorMap ? { ...floorMap } : {};
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

  const dispatch = useAppDispatch();
  const filteredRooms: RoomWithOrdinal[] = useMemo(() => {
    // No query: only show building names
    const lDistCache = new Map();
    // Query for another building
    const roomsList = building.floors.flatMap((floor: Floor) => {
      if (!floorMap[`${building.code}-${floor.name}`]?.rooms) {
        return [];
      }
      // let roomsObj = Object.entries(floorMap[`${building.code}-${floor.name}`]?.rooms) // for new floors layout
      const roomsObj = floorMap[`${building.code}-${floor.name}`]?.rooms; // for legacy floors layout
      return (
        roomsObj
          // .filter((roomId: string, room: Room) => { // for new floors layout
          .filter((room: Room) => {
            // legacy floors layout
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
            // lDistCache.set(roomId, (a + b + c + d) / 4); // new
            lDistCache.set(room.id, (a + b + c + d) / 4); // legacy

            return (
              a < fullName.length / 3 ||
              b < fullCodeName.length / 3 ||
              (room.alias && c < room.alias.length / 3) ||
              (room.type && d < room.type.length / 3)
            );
          })
          // .map(([roomId, room]) => ({ // new
          .map((room) => ({
            // legacy
            // id: roomId, // new
            ...room,
            floor,
          })) ?? []
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

  function setFloorOrdinal(arg0: null): any {
    throw new Error('Function not implemented.');
  }

  return (
    <div name="searchResults">
      <button
        type="button"
        className={
          // clsx(
          //  styles['search-list-element']
          //   styles['search-list-element-building'],
          //   filteredRooms?.length > 0 && styles['search-list-element-sticky'],
          // )
          'font-normal tracking-[-0.01em]' + //search-list-element-building
          'border-b' +
          'border-slate-500' +
          'active:bg-slate-300 active:outline-none' +
          `${filteredRooms?.length > 0 ? 'sticky left-0 top-0 w-full bg-[var(--search-background)] backdrop-blur' : ''}` +
          //search-list-element-sticky
          'b-0 m-0 flex h-14 w-full items-center gap-2 p-[var(--main-ui-padding)]' //search-list-element
        }
        onClick={() => {
          dispatch(claimBuilding(building));
          dispatch(setFloorOrdinal(null));
        }}
      >
        <Roundel code={building.code} />
        <span
          className={
            /*tyles['search-list-element-title']+*/ 'flex grow overflow-hidden leading-[1.3]'
          }
        >
          {building.name}
        </span>
        <ChevronRightIcon
          className={
            /*styles['search-list-arrow']+*/ 'h-5 w-5 fill-[#0000004d]'
          }
        />
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
            onClick={() => {
              dispatch(claimBuilding(building));
              dispatch(claimRoom(room));
            }}
          >
            <div
              className={
                /*styles['search-list-element-pin']+*/ 'w-40px flex justify-end'
              }
            >
              <RoomPin room={room} />
            </div>
            <div
              className={
                //   clsx(
                //   styles['search-list-element-title'],
                //   styles['search-list-element-room'],
                // )
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
            <ChevronRightIcon
              className={
                /*styles['search-list-arrow']+*/ 'h-5 w-5 fill-[#0000004d]'
              }
            />
          </button>
        );
      })}
    </div>
  );
}
