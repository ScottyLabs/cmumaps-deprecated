import React, { ReactElement, useEffect, useState } from 'react';

import { selectBuilding, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate, Building, SearchRoom } from '@/types';

import { zoomOnObject, zoomOnSearchRoom } from '../buildings/mapUtils';
import RoomPin from '../shared/RoomPin';
import Roundel from '../shared/Roundel';
import { searchRoomsAll } from './searchUtils';

interface WrapperProps {
  children: ReactElement;
  handleClick: () => void;
}

const SearchResultWrapper = ({ children, handleClick }: WrapperProps) => {
  return (
    <button
      type="button"
      className={
        'flex h-12 w-full items-center justify-between gap-2 bg-gray-50 px-6 transition duration-150 ease-out hover:bg-[#efefef]'
      }
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

interface SearchResultsProps {
  mapRef: mapkit.Map | null;
  query: string;
  userPosition: AbsoluteCoordinate;
}

/**
 * Displays the search results.
 */
export default function SearchResults({ mapRef, query }: SearchResultsProps) {
  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const searchMap = useAppSelector((state) => state.data.searchMap);

  const [searchResult, setSearchResults] = useState<
    {
      building: Building;
      searchRoom: SearchRoom[];
    }[]
  >([]);

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

  useEffect(() => {
    if (buildings) {
      setTimeout(() => {
        const newSearchResult = searchRoomsAll(buildings, query, searchMap);
        setSearchResults(newSearchResult);
      }, 500);
    }
  }, [buildings, query, searchMap]);

  if (searchResult.length == 0) {
    return (
      <div className="text-l gap-4px px-20px py-40px flex h-32 items-center justify-center text-center font-light">
        No Result Found
      </div>
    );
  }

  const renderBuildingResults = (building: Building) => {
    const handleClick = () => {
      if (mapRef) {
        zoomOnObject(mapRef, building.shapes.flat());
      }
      dispatch(selectBuilding(building));
      dispatch(setIsSearchOpen(false));
    };

    return (
      <SearchResultWrapper handleClick={handleClick}>
        <div className="flex items-center gap-3">
          <div className="mx-[-10px] scale-[0.6]">
            <Roundel code={building.code} />
          </div>
          <p className="pl-[-1] font-bold">{building.name}</p>
        </div>
      </SearchResultWrapper>
    );
  };

  const renderRoomResults = (rooms: SearchRoom[], building: Building) => {
    const renderText = (room: SearchRoom) => (
      <div className="flex flex-col text-left">
        <p>
          <span>
            {building.code} {room.name}
          </span>
          {room.type !== 'default' && (
            <span className="px-[8px] text-gray-400">{room.type}</span>
          )}
          {room.alias && <span className="truncate">{room.alias}</span>}
        </p>
      </div>
    );

    return rooms.map((searchRoom: SearchRoom) => (
      <SearchResultWrapper
        key={searchRoom.id}
        handleClick={() => {
          zoomOnSearchRoom(
            mapRef,
            searchRoom,
            buildings,
            floorPlanMap,
            dispatch,
          );
        }}
      >
        <div className="flex items-center space-x-3">
          <RoomPin room={searchRoom} />
          {renderText(searchRoom)}
        </div>
      </SearchResultWrapper>
    ));
  };

  return (
    <div id="searchResults">
      {searchResult.map((buildingResult) => {
        const building = buildingResult['building'];
        return (
          <div key={building.code}>
            {renderBuildingResults(building)}
            {renderRoomResults(
              buildingResult['searchRoom'].slice(0, 100),
              building,
            )}
          </div>
        );
      })}
    </div>
  );
}
