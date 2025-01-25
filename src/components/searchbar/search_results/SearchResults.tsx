import { useEffect, useState } from 'react';
import { FaLocationCrosshairs } from 'react-icons/fa6';

import { searchQuery } from '@/lib/apiRoutes';
import {
  setChoosingRoomMode,
  setEndLocation,
  setStartLocation,
} from '@/lib/features/navSlice';
import { setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Document } from '@/types';

import KeepTypingDisplay from '../display_helpers/KeepTypingDisplay';
import BuildingResult from './BuildingResult';
import FoodResult from './FoodResult';
import RoomResult from './RoomResult';

interface SearchResultsProps {
  map: mapkit.Map | null;
  query: string;
}

/**
 * Displays the search results.
 */
const SearchResults = ({ map, query }: SearchResultsProps) => {
  const searchMode = useAppSelector((state) => state.ui.searchMode);
  const userPosition = useAppSelector((state) => state.nav.userPosition);
  const [roomSearchResults, setRoomSearchResults] = useState<Document[]>([]);

  const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
  );
  const dispatch = useAppDispatch();

  const handlePositionClick = () => {
    if (choosingRoomMode) {
      if (choosingRoomMode == 'start') {
        dispatch(setStartLocation({ userPosition }));
      } else if (choosingRoomMode == 'end') {
        dispatch(setEndLocation({ userPosition }));
      }
      dispatch(setIsSearchOpen(false));
      dispatch(setChoosingRoomMode(null));
    }
  };

  useEffect(() => {
    setTimeout(() => {
      searchQuery(query, userPosition).then((res) => {
        setRoomSearchResults(res);
      });
    }, 200);
  }, [query, searchMode, userPosition]);

  if (query.length < 2 && searchMode == 'rooms') {
    if (choosingRoomMode == null) {
      return <KeepTypingDisplay />;
    } else {
      return (
        <button
          className="flex h-16 w-full items-center gap-3 pl-3 hover:bg-blue-200"
          onClick={handlePositionClick}
        >
          <div className="text-lg text-blue-600">
            <FaLocationCrosshairs />
          </div>
          <p> User Position</p>
        </button>
      );
    }
  }

  if (['rooms', 'restrooms', 'study'].includes(searchMode)) {
    return roomSearchResults.map((document) => {
      switch (document.type) {
        case 'Food':
          return <FoodResult key={document.id} map={map} eatery={document} />;
        case 'Building':
          return (
            <BuildingResult key={document.id} map={map} building={document} />
          );
        default:
          return <RoomResult key={document.id} map={map} room={document} />;
      }
    });
  }
};

export default SearchResults;
