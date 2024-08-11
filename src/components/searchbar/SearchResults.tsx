import { Event } from '@prisma/client';

import { useEffect, useState } from 'react';

import { searchEvents } from '@/lib/apiRoutes';
import { useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate } from '@/types';

import EventSearchResults from './EventSearchResults';
import FoodSearchResults from './FoodSearchResults';
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
  const [eventSearchResults, setEventSearchResults] = useState<Event[]>([]);

  useEffect(() => {
    if (buildings) {
      setTimeout(() => {
        if (['rooms', 'restrooms', 'study'].includes(searchMode)) {
          setRoomSearchResults(
            searchRoom(
              buildings,
              query,
              searchMap,
              searchMode as 'rooms' | 'food' | 'restrooms' | 'study',
            ),
          );
        } else if (searchMode === 'food') {
          setRoomSearchResults(
            searchFood(buildings, query, searchMap, searchMode),
          );
        } else if (searchMode === 'events') {
          if (query.length > 0) {
            searchEvents(query).then(setEventSearchResults);
          }
        }
      }, 500);
    }
  }, [buildings, query, searchMap, searchMode]);

  if (['rooms', 'restrooms', 'study'].includes(searchMode)) {
    return <RoomSearchResults map={map} searchResult={roomSearchResults} />;
  } else if (searchMode == 'food') {
    return <FoodSearchResults map={map} searchResult={roomSearchResults} />;
  } else if (searchMode == 'events') {
    return <EventSearchResults map={map} searchResult={eventSearchResults} />;
  }
};

export default SearchResults;
