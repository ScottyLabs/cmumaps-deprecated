import { ChevronRightIcon } from '@heroicons/react/20/solid';

import React from 'react';

import { claimBuilding, claimRoom } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import { distance } from '@/util/geometry';
import titleCase from '@/util/titleCase';

import RoomPin from '../buildings/RoomPin';
import Roundel from '../shared/Roundel';
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

/**
 * Displays the search results.
 */
export default function SearchResults({
  query,
  userPosition,
}: SearchResultsProps) {
  const dispatch = useAppDispatch();

  let floorMap = useAppSelector((state) => state.data.floorMap);
  floorMap = floorMap ? { ...floorMap } : {};
  let buildings = useAppSelector((state) => state.data.buildings);
  buildings = buildings ? [...buildings] : [];

  if (userPosition) {
    buildings.sort(
      (b, a) =>
        distance(
          [b.labelPosition.longitude, b.labelPosition.latitude],
          userPosition,
        ) -
        distance(
          [a.labelPosition.longitude, a.labelPosition.latitude],
          userPosition,
        ),
    );
  }

  const searchResult = buildings
    .map((building: Building) => ({
      Building: building,
      Rooms: findRooms(query, building, floorMap, userPosition),
    }))
    .filter((buildingResult) => buildingResult['Rooms'].length > 0);

  if (searchResult.length == 0) {
    return (
      <div className="text-l gap-4px px-20px py-40px flex h-32 items-center justify-center text-center font-light">
        No Result Found
      </div>
    );
  }

  const renderBuildingResults = (building: Building) => {
    return (
      <button
        type="button"
        className="flex h-14 w-full justify-between gap-2 p-1"
        onClick={() => {
          dispatch(claimBuilding(building));
          // dispatch(setFloorOrdinal(null));
        }}
      >
        <div className="flex items-center gap-3">
          <Roundel code={building.code} />
          <p className="">{building.name}</p>
        </div>
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    );
  };

  const renderRoomResults = (rooms: Room[], building: Building) => {
    const renderText = (room: Room) => (
      <div className="flex flex-col text-left">
        <div>
          <span>
            {building.code} {room.name}
          </span>
          {room.type !== 'default' && (
            <span>{` • ${titleCase(roomType(room))}`}</span>
          )}
        </div>
        {room.alias && <div className="truncate">{room.alias}</div>}
      </div>
    );

    return rooms.map((room: Room) => (
      <button
        type="button"
        className="flex h-14 w-full justify-between gap-2 p-1 pl-6"
        // replace with id when possible !!!
        key={room.name + room.floor}
        onClick={() => {
          // dispatch(claimBuilding(building));
          dispatch(claimRoom(room));
        }}
      >
        <div className="flex items-center space-x-3">
          <RoomPin room={room} />
          {renderText(room)}
        </div>
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    ));
  };

  return (
    <div id="searchResults">
      {searchResult.map((buildingResult) => {
        const building = buildingResult['Building'];
        return (
          <div key={building.code}>
            {renderBuildingResults(building)}
            {renderRoomResults(buildingResult['Rooms'], building)}
          </div>
        );
      })}
    </div>
  );
}
