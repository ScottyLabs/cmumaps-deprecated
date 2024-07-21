import React, { useMemo } from 'react';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import styles from '@/styles/SearchResults.module.css';
import simplify from '@/util/simplify';
import BuildingSearchResults from './BuildingSearchResults';
import { distance } from '@/geometry';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import Roundel from '../shared/Roundel';
import { claimBuilding, claimRoom } from '@/lib/redux/uiSlice';
import RoomPin from '../building-display/RoomPin';
import { findRooms } from './searchUtil';

export interface SearchResultsProps {
  query: string;
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  userPosition: AbsoluteCoordinate;
}

function roomType(room: Room): string {
  switch (room.type) {
    case 'study':
      return 'Study Room';
    default:
      return room.type;
  }
}

type RoomWithOrdinal = Room & { floor: Floor };

/**
 * Displays the search results.
 */
export default function SearchResults({
  query,
  onSelectRoom,
  userPosition,
}: SearchResultsProps) {
  let floorMap = useAppSelector((state) => state.data.legacyFloorMap); // for legacy floors layout (use state.data.floorMap for new floors layout)
  floorMap = floorMap ? { ...floorMap } : {};
  let buildings = useAppSelector((state) => state.data.buildings);
  buildings = buildings ? [...buildings] : [];

  if (userPosition) {
    buildings.sort(
      (b, a) =>
        -distance(
          { x: a.labelPosition.longitude, y: a.labelPosition.latitude },
          userPosition,
        ) +
        distance(
          { x: b.labelPosition.longitude, y: b.labelPosition.latitude },
          userPosition,
        ),
    );
  }

  const helper = (building: Building) => {
    const roomsFound = findRooms(query, building, floorMap, userPosition);
    for (const room of roomsFound) {
      console.log(room.alias);
    }

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
    // function setFloorOrdinal(arg0: null): any {
    //   throw new Error('Function not implemented.');
    // }
    // return (
    //   <div id="searchResults">
    //     <button
    //       type="button"
    //       className={
    //         // clsx(
    //         //  styles['search-list-element']
    //         //   styles['search-list-element-building'],
    //         //   filteredRooms?.length > 0 && styles['search-list-element-sticky'],
    //         // )
    //         'font-normal tracking-[-0.01em]' + //search-list-element-building
    //         'border-b' +
    //         'border-slate-500' +
    //         'active:bg-slate-300 active:outline-none' +
    //         `${filteredRooms?.length > 0 ? 'sticky left-0 top-0 w-full bg-[var(--search-background)] backdrop-blur' : ''}` +
    //         //search-list-element-sticky
    //         'b-0 m-0 flex h-14 w-full items-center gap-2 p-[var(--main-ui-padding)]' //search-list-element
    //       }
    //       onClick={() => {
    //         dispatch(claimBuilding(building));
    //         dispatch(setFloorOrdinal(null));
    //       }}
    //     >
    //       <Roundel code={building.code} />
    //       <span
    //         className={
    //           /*tyles['search-list-element-title']+*/ 'flex grow overflow-hidden leading-[1.3]'
    //         }
    //       >
    //         {building.name}
    //       </span>
    //       <ChevronRightIcon
    //         className={
    //           /*styles['search-list-arrow']+*/ 'h-5 w-5 fill-[#0000004d]'
    //         }
    //       />
    //     </button>
    //     {filteredRooms.map((room: RoomWithOrdinal) => {
    //       return (
    //         <button
    //           type="button"
    //           className={
    //             //styles['search-list-element']
    //             'b-0 m-0 flex h-14 w-full items-center gap-2 p-[var(--main-ui-padding)]' //search-list-element
    //           }
    //           key={room.id}
    //           onClick={() => {
    //             dispatch(claimBuilding(building));
    //             dispatch(claimRoom(room));
    //           }}
    //         >
    //           <div
    //             className={
    //               /*styles['search-list-element-pin']+*/ 'w-40px flex justify-end'
    //             }
    //           >
    //             <RoomPin room={room} />
    //           </div>
    //           <div
    //             className={
    //               //   clsx(
    //               //   styles['search-list-element-title'],
    //               //   styles['search-list-element-room'],
    //               // )
    //               'flex grow overflow-hidden leading-[1.3]' + //search-list-element-title
    //               'flex flex-col leading-[1.2]' //search-list-element-room
    //             }
    //           >
    //             <div>
    //               <span className={'font-medium' + styles['search-room-code']}>
    //                 {building.code} {room.name}
    //               </span>
    //               {room.type !== 'default' && (
    //                 <span>{` • ${titleCase(roomType(room))}`}</span>
    //               )}
    //             </div>
    //             {room.alias && (
    //               <div className={'truncate'}>
    //                 {/*styles['search-room-name']*/}
    //                 {room.alias}
    //               </div>
    //             )}
    //           </div>
    //           <ChevronRightIcon
    //             className={
    //               /*styles['search-list-arrow']+*/ 'h-5 w-5 fill-[#0000004d]'
    //             }
    //           />
    //         </button>
    //       );
    //     })}
    //   </div>
  };

  // const isEmpty = document.getElementsByName('searchResults').length <=0;
  return (
    <div
      className="empty:before:text-l empty:before:gap-4px empty:before:px-20px empty:before:py-40px h-auto empty:before:flex empty:before:h-32 empty:before:items-center empty:before:justify-center empty:before:text-center empty:before:font-light empty:before:content-['No_results_found.']"
      //styles['search-results']
    >
      {buildings.map((building: Building) => helper(building))}
    </div>
  );
}
