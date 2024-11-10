import React from 'react';
import { FaLocationCrosshairs } from 'react-icons/fa6';

import {
  setChoosingRoomMode,
  setEndLocation,
  setStartLocation,
} from '@/lib/features/navSlice';
import { selectBuilding, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, SearchRoom } from '@/types';

import { zoomOnObject, zoomOnRoomById } from '../../buildings/mapUtils';
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
  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const selectedBuilding = useAppSelector((state) => state.ui.selectedBuilding);

  if (query.length < 2 && searchMode == 'rooms') {
    if (choosingRoomMode == null) {
      return <KeepTypingDisplay />;
    } else {
      return (
        <button className="flex h-16 w-full items-center gap-3 pl-3 hover:bg-blue-200">
          <div className="text-lg text-blue-600">
            <FaLocationCrosshairs />
          </div>
          <p> User Position</p>
        </button>
      );
    }
  }

  if (searchResult.length == 0) {
    return <NoResultDisplay />;
  }

  const renderBuildingResults = (building: Building) => {
    const handleClick = () => {
      if (choosingRoomMode) {
        if (choosingRoomMode == 'start') {
          dispatch(setStartLocation(building));
        } else if (choosingRoomMode == 'end') {
          dispatch(setEndLocation(building));
        }
        dispatch(setIsSearchOpen(false));
        dispatch(setChoosingRoomMode(null));
      } else {
        if (map) {
          zoomOnObject(map, building.shapes.flat());
        }
        dispatch(selectBuilding(building));
        dispatch(setIsSearchOpen(false));
      }
    };

    return (
      <SearchResultWrapper
        handleClick={handleClick}
        isSelected={building.code == selectedBuilding?.code}
      >
        <div className="flex items-center gap-3">
          <div className="-mx-2.5 scale-[0.6]">
            <Roundel code={building.code} />
          </div>
          <p className="font-bold">{building.name}</p>
        </div>
      </SearchResultWrapper>
    );
  };

  const renderRoomResults = (rooms: SearchRoom[], building: Building) => {
    const renderText = (room: SearchRoom) => (
      <p className="flex-col space-x-2 truncate">
        <span>
          {building.code} {room.name}
        </span>
        {room.type !== 'Default' && (
          <span className="text-gray-400">{room.type}</span>
        )}
        {room.alias && <span className="truncate">{room.alias}</span>}
      </p>
    );

    const handleClick = (searchRoom: SearchRoom) => () => {
      if (choosingRoomMode) {
        if (choosingRoomMode == 'start') {
          dispatch(setStartLocation(searchRoom));
        } else if (choosingRoomMode == 'end') {
          dispatch(setEndLocation(searchRoom));
        }
        dispatch(setIsSearchOpen(false));
        dispatch(setChoosingRoomMode(null));
      } else {
        zoomOnRoomById(
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
        isSelected={searchRoom.id == selectedRoom?.id}
      >
        <div className="flex h-12 items-center gap-3 overflow-x-hidden">
          <div className="flex-1">
            <RoomPin room={searchRoom} />
          </div>
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
