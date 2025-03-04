import React from 'react';

import {
  setChoosingRoomMode,
  setEndLocation,
  setStartLocation,
} from '@/lib/features/navSlice';
import { setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { pushLog } from '@/lib/idb/logStore';
import { Document } from '@/types';

import { zoomOnRoomById } from '../../buildings/mapUtils';
import RoomPin from '../../shared/RoomPin';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  room: Document;
  query: string;
}

/**
 * Displays the search results.
 */
const RoomSearchResults = ({ map, room, query }: Props) => {
  const dispatch = useAppDispatch();

  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const buildings = useAppSelector((state) => state.data.buildings);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
  );

  const renderText = (room: Document) => (
    <p className="flex-col space-x-2 truncate">
      <span>{room.nameWithSpace}</span>
      {room.type !== 'Default' && (
        <span className="text-gray-400">{room.type}</span>
      )}
      {room.alias && (
        <span className="truncate">{room.alias.split('   ')[0]}</span>
      )}
    </p>
  );

  const handleClick = (Document: Document) => () => {
    if (choosingRoomMode) {
      if (choosingRoomMode == 'start') {
        pushLog(query, Document, { nav: 'start' });
        dispatch(setStartLocation(Document));
      } else if (choosingRoomMode == 'end') {
        pushLog(query, Document, { nav: 'end' });
        dispatch(setEndLocation(Document));
      }
      dispatch(setIsSearchOpen(false));
      dispatch(setChoosingRoomMode(null));
    } else {
      pushLog(query, Document);
      zoomOnRoomById(
        map,
        Document.id,
        Document.floor,
        buildings,
        floorPlanMap,
        dispatch,
      );
    }
  };

  return (
    <SearchResultWrapper
      key={room.id}
      handleClick={handleClick(room)}
      isSelected={room.id == selectedRoom?.id}
    >
      <div className="flex h-12 items-center gap-3 overflow-x-hidden">
        <div className="flex-1">
          <RoomPin room={room} />
        </div>
        {renderText(room)}
      </div>
    </SearchResultWrapper>
  );
};

export default RoomSearchResults;
