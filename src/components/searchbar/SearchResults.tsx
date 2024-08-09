import { useEffect, useState } from 'react';

import { useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate } from '@/types';

import RoomSearchResults from './RoomSearchResults';
import { RoomSearchResult, searchFood, searchRoom } from './searchUtils';

interface SearchResultsProps {
  map: mapkit.Map | null;
  query: string;
  userPosition: AbsoluteCoordinate;
}

/**
 * Displays the search results.
 */
const SearchResults = ({ map, query }: SearchResultsProps) => {
  const buildings = useAppSelector((state) => state.data.buildings);
  const searchMap = useAppSelector((state) => state.data.searchMap);

  const searchMode = useAppSelector((state) => state.ui.searchMode);

  const [roomSearchResults, setRoomSearchResults] = useState<
    RoomSearchResult[]
  >([]);

  useEffect(() => {
    if (buildings) {
      setTimeout(() => {
        switch (searchMode) {
          case 'rooms':
            setRoomSearchResults(searchRoom(buildings, query, searchMap));
            break;
          case 'food':
            // setRoomSearchResults(searchFood(buildings, query, searchMap));
            break;
        }
      }, 500);
    }
  }, [buildings, query, searchMap, searchMode]);

  switch (searchMode) {
    case 'rooms':
      return <RoomSearchResults map={map} searchResult={roomSearchResults} />;
  }
};

export default SearchResults;
