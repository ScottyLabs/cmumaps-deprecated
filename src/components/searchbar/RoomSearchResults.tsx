import React from 'react';

import { selectBuilding, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, SearchRoom } from '@/types';

import { zoomOnObject, zoomOnSearchRoom } from '../buildings/mapUtils';
import RoomPin from '../shared/RoomPin';
import Roundel from '../shared/Roundel';
import NoResultDisplay from './NoResultDisplay';
import SearchResultWrapper from './SearchResultWrapper';
import { RoomSearchResult } from './searchUtils';

interface Props {
  map: mapkit.Map | null;
  searchResult: RoomSearchResult[];
}

/**
 * Displays the search results.
 */
const RoomSearchResults = ({ map, searchResult }: Props) => {
  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);

  if (searchResult.length == 0) {
    return <NoResultDisplay />;
  }

  const renderBuildingResults = (building: Building) => {
    const handleClick = () => {
      if (map) {
        zoomOnObject(map, building.shapes.flat());
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
          zoomOnSearchRoom(map, searchRoom, buildings, floorPlanMap, dispatch);
        }}
      >
        <div className="flex items-center space-x-3">
          <RoomPin room={searchRoom} />
          {renderText(searchRoom)}
        </div>
      </SearchResultWrapper>
    ));
  };

  return searchResult.map((buildingResult) => {
    const building = buildingResult.building;
    return (
      <div key={building.code}>
        {renderBuildingResults(building)}
        {renderRoomResults(buildingResult.searchRoom.slice(0, 100), building)}
      </div>
    );
  });
};

export default RoomSearchResults;
