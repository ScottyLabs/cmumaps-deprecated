import React from 'react';
import { toast } from 'react-toastify';

import {
  setChoosingRoomMode,
  setEndRoom,
  setStartRoom,
} from '@/lib/features/navSlice';
import { selectBuilding, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, SearchRoom } from '@/types';

import { zoomOnObject, zoomOnRoom } from '../../buildings/mapUtils';
import RoomPin from '../../shared/RoomPin';
import Roundel from '../../shared/Roundel';
import KeepTypingDisplay from '../display_helpers/KeepTypingDisplay';
import NoResultDisplay from '../display_helpers/NoResultDisplay';
import { RoomSearchResult } from '../searchUtils';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  query: string;
  searchResult: RoomSearchResult[];
  searchMode: 'rooms' | 'restrooms' | 'study';
}

/**
 * Displays the search results.
 */
const RoomSearchResults = ({ map, query, searchResult, searchMode }: Props) => {
  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
  );

  if (query.length < 2 && searchMode != 'restrooms') {
    return <KeepTypingDisplay />;
  }

  if (searchResult.length == 0) {
    return <NoResultDisplay />;
  }

  const renderBuildingResults = (building: Building) => {
    const handleClick = () => {
      if (choosingRoomMode) {
        toast.error("Can't choose a building for navigation for now!");
      } else {
        if (map) {
          zoomOnObject(map, building.shapes.flat());
        }
        dispatch(selectBuilding(building));
        dispatch(setIsSearchOpen(false));
      }
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
      <div className="flex flex-col">
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

    const handleClick = (searchRoom: SearchRoom) => () => {
      if (choosingRoomMode) {
        if (choosingRoomMode == 'start') {
          dispatch(setStartRoom(searchRoom));
        } else if (choosingRoomMode == 'end') {
          dispatch(setEndRoom(searchRoom));
        }
        dispatch(setIsSearchOpen(false));
        dispatch(setChoosingRoomMode(null));
      } else {
        zoomOnRoom(
          map,
          searchRoom.id,
          searchRoom.floor,
          buildings,
          floorPlanMap,
          dispatch,
        );
      }
    };

    return rooms.map((searchRoom: SearchRoom) => (
      <SearchResultWrapper
        key={searchRoom.id}
        handleClick={handleClick(searchRoom)}
      >
        <div className="flex h-12 items-center space-x-3">
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
