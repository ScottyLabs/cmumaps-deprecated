import { useEffect, useState } from 'react';

import { useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate } from '@/types';

import RoomSearchResults from './RoomSearchResults';
import { RoomSearchResult, searchRoom } from './searchUtils';

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
        if (['rooms', 'food', 'restrooms'].includes(searchMode)) {
          setRoomSearchResults(
            searchRoom(buildings, query, searchMap, searchMode),
          );
        }
      }, 500);
    }
  }, [buildings, query, searchMap, searchMode]);

  if (['rooms', 'food', 'restrooms'].includes(searchMode)) {
    return <RoomSearchResults map={map} searchResult={roomSearchResults} />;
  }
};

export default SearchResults;
