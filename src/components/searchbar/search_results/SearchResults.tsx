import { useEffect, useState } from 'react';

import { useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate } from '@/types';

import { RoomSearchResult, searchFood, searchRoom } from '../searchUtils';
import CourseSearchResults from './CourseSearchResults';
import EventSearchResults from './EventSearchResults';
import FoodSearchResults from './FoodSearchResults';
import RoomSearchResults from './RoomSearchResults';

interface SearchResultsProps {
  map: mapkit.Map | null;
  query: string;
  userPosition: AbsoluteCoordinate;
}

/**
 * Displays the search results.
 */
const SearchResults = ({ map, query, userPosition }: SearchResultsProps) => {
  const buildings = useAppSelector((state) => state.data.buildings);
  const searchMap = useAppSelector((state) => state.data.searchMap);

  const searchMode = useAppSelector((state) => state.ui.searchMode);

  const [roomSearchResults, setRoomSearchResults] = useState<
    RoomSearchResult[]
  >([]);

  useEffect(() => {
    if (buildings) {
      setTimeout(() => {
        if (['rooms', 'restrooms', 'study', 'food'].includes(searchMode)) {
          setRoomSearchResults(
            searchRoom(
              buildings,
              query,
              searchMap,
              searchMode as 'rooms' | 'food' | 'restrooms' | 'study',
            ),
          );
        }
      }, 500);
    }
  }, [buildings, query, searchMap, searchMode]);
  if (['rooms', 'restrooms', 'study'].includes(searchMode)) {
    return (
      <RoomSearchResults
        map={map}
        query={query}
        searchResult={roomSearchResults}
      />
    );
  } else if (searchMode == 'food') {
    return <FoodSearchResults map={map} searchResult={roomSearchResults} />;
  } else if (searchMode == 'events') {
    return <EventSearchResults map={map} query={query} />;
  } else if (searchMode == 'courses') {
    return (
      <CourseSearchResults
        map={map}
        query={query}
        userPosition={userPosition}
      />
    );
  }
};

export default SearchResults;
