import React, { ReactElement } from 'react';

import { claimRoom, selectBuilding } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import titleCase from '@/util/titleCase';

import RoomPin from '../buildings/RoomPin';
import Roundel from '../shared/Roundel';
import { findRooms } from './searchUtil';

interface WrapperProps {
  children: ReactElement;
  handleClick: () => void;
}

const SearchResultWrapper = ({ children, handleClick }: WrapperProps) => {
  return (
    <button
      type="button"
      className={
        'flex h-14 w-full justify-between items-center gap-2 p-1 hover:bg-[#efefef] bg-gray-50 transition duration-150 ease-out'
      }
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

interface SearchResultsProps {
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

  const searchMap = useAppSelector((state) => state.data.searchMap);
  const buildings = useAppSelector((state) => state.data.buildings);

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

  const searchResult = Object.values(buildings)
    .map((building: Building) => ({
      Building: building,
      Rooms: findRooms(query, building, searchMap[building.code], userPosition),
    }))
    .filter((buildingResult) => buildingResult['Rooms'][0].length > 0)
    .sort((a, b) => a['Rooms'][1] - b['Rooms'][1])
    .map(({ Building: building, Rooms: rooms }) => {
      return { Building: building, Rooms: rooms[0] };
    });

  if (searchResult.length == 0) {
    return (
      <div className="text-l gap-4px px-20px py-40px flex h-32 items-center justify-center text-center font-light">
        No Result Found
      </div>
    );
  }

  const renderBuildingResults = (building: Building) => {
    const handleClick = () => {
      dispatch(selectBuilding(building));
    };

    return (
      <SearchResultWrapper handleClick={handleClick}>
        <div className="flex items-center gap-3">
          <Roundel code={building.code} />
          <h4 className="">{building.name}</h4>
        </div>
      </SearchResultWrapper>
    );
  };

  const renderRoomResults = (rooms: Room[], building: Building) => {
    const renderText = (room: Room) => (
      <div className="flex flex-col text-left">
        <p>
          <span>
            {building.code} {room.name}
          </span>
          {room.type !== 'default' && (
            <span>{` • ${titleCase(roomType(room))}`}</span>
          )}
          {room.alias && <span className="truncate">{room.alias}</span>}
        </p>
      </div>
    );

    const handleClick = (room: Room) => () => {
      // dispatch(claimBuilding(building));
      dispatch(claimRoom(room));
    };

    return rooms.map((room: Room) => (
      <SearchResultWrapper
        key={room.name + room.floor.level}
        handleClick={handleClick(room)}
      >
        <div className="flex items-center space-x-3 pl-8">
          <RoomPin room={room} />
          {renderText(room)}
        </div>
      </SearchResultWrapper>
    ));
  };

  return (
    <div id="searchResults">
      {searchResult.map((buildingResult) => {
        const building = buildingResult['Building'];
        return (
          <div key={building.code}>
            {renderBuildingResults(building)}
            {renderRoomResults(buildingResult['Rooms'].slice(0, 100), building)}
          </div>
        );
      })}
    </div>
  );
}
