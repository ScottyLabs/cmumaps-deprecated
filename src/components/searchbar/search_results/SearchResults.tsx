import { useEffect, useState } from 'react';

import { useAppSelector } from '@/lib/hooks';

import { RoomSearchResult, searchRoom } from '../searchUtils';
import CourseSearchResults from './CourseSearchResults';
import EventSearchResults from './EventSearchResults';
import FoodSearchResults from './FoodSearchResults';
import RoomSearchResults from './RoomSearchResults';
import ShuttleSearchResults from './ShuttleSearchResults';

interface SearchResultsProps {
  map: mapkit.Map | null;
  query: string;
}

/**
 * Displays the search results.
 */
const SearchResults = ({ map, query }: SearchResultsProps) => {
  const buildings = useAppSelector((state) => state.data.buildings);
  const searchMap = useAppSelector((state) => state.data.searchMap);

  const searchMode = useAppSelector((state) => state.ui.searchMode);
  const userPosition = useAppSelector((state) => state.nav.userPosition);

  const [roomSearchResults, setRoomSearchResults] = useState<
    RoomSearchResult[]
  >([]);

  useEffect(() => {
    if (buildings) {
      setTimeout(() => {
        if (['rooms', 'restrooms', 'study'].includes(searchMode)) {
          setRoomSearchResults(
            searchRoom(
              buildings,
              query,
              userPosition,
              searchMap,
              searchMode as 'rooms' | 'restrooms' | 'study',
            ),
          );
        }
      }, 500);
    }
  }, [buildings, query, searchMap, searchMode, userPosition]);

  if (['rooms', 'restrooms', 'study'].includes(searchMode)) {
    return (
      <RoomSearchResults
        map={map}
        query={query}
        searchResult={roomSearchResults}
        searchMode={searchMode as 'rooms' | 'restrooms' | 'study'}
      />
    );
  } else if (searchMode == 'food') {
    return <FoodSearchResults map={map} query={query} />;
  } else if (searchMode == 'events') {
    return <EventSearchResults map={map} query={query} />;
  } else if (searchMode == 'courses') {
    return <CourseSearchResults map={map} query={query} />;
  } else if (searchMode == 'shuttle') {
    return <ShuttleSearchResults query={query} />;
  }
};

export default SearchResults;
