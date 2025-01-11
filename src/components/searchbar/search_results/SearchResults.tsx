import { useEffect, useState } from 'react';

import { useAppSelector } from '@/lib/hooks';

import CourseSearchResults from './CourseSearchResults';
import EventSearchResults from './EventSearchResults';
import { searchQuery } from '@/lib/apiRoutes';
import { Document } from '@/types';
import RoomResult from './RoomResult';
import FoodResult from './FoodResult';
import BuildingResult from './BuildingResult';

interface SearchResultsProps {
  map: mapkit.Map | null;
  query: string;
}

/**
 * Displays the search results.
 */
const SearchResults = ({ map, query }: SearchResultsProps) => {
  const searchMode = useAppSelector((state) => state.ui.searchMode);

  const [roomSearchResults, setRoomSearchResults] = useState<
  Document[]
  >([]);

  useEffect(() => {
      setTimeout(() => {
        if (['rooms', 'restrooms', 'study'].includes(searchMode)) {
          searchQuery(query).then((res) => setRoomSearchResults(res));
        }
      }, 200);
  }, [query, searchMode]);

  if (['rooms', 'restrooms', 'study'].includes(searchMode)) {
    return (
      roomSearchResults.map((document) => {
        switch (document.type) {
          case 'Food':
            return <FoodResult
              key={document.id}
              map={map}
              eatery={document}
            />;
          case 'Building':
            return <BuildingResult
              key={document.id}
              map={map}
              building={document}
            />
          default:
            return <RoomResult
              key={document.id}
              map={map}
              room={document}
            />;
          }
      })
    );
  } else if (searchMode == 'events') {
    return <EventSearchResults map={map} query={query} />;
  } else if (searchMode == 'courses') {
    return <CourseSearchResults map={map} query={query} />;
  }
};

export default SearchResults;
