import React, { useEffect, useMemo, useState } from 'react';

import { SHUTTLE_CAMERA_BOUNDARY } from '@/components/buildings/MapDisplay';
import { findShuttlePath } from '@/lib/apiRoutes';
import { setShuttlePath } from '@/lib/features/navSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import { toMapKitCoordinateRegion } from '../../buildings/mapUtils';
import LoadingDisplay from '../display_helpers/LoadingDisplay';
import NoResultDisplay from '../display_helpers/NoResultDisplay';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  query: string;
}

/**
 * Displays the shuttle search results.
 */
const ShuttleSearchResults = ({ query }: Props) => {
  const dispatch = useAppDispatch();

  const userPosition = useAppSelector((state) => state.nav.userPosition);

  const [searchResults, setSearchResults] = useState<
    mapkit.SearchAutocompleteResult[]
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // create an Apple Mapkit search object
  const search = useMemo(
    () =>
      new mapkit.Search({
        region: toMapKitCoordinateRegion(SHUTTLE_CAMERA_BOUNDARY),
      }),
    [],
  );

  useEffect(() => {
    // empty query = empty results
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
      setIsLoading(false);

      search.autocomplete(query, (error, data) => {
        if (error) {
          console.error('Error fetching autocomplete suggestions:', error);
          return;
        }

        setSearchResults(data.results.filter((result) => result.coordinate));
      });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query, search]);

  if (query.length == 0) {
    return <></>;
  }

  if (isLoading) {
    return <LoadingDisplay />;
  }

  if (searchResults.length == 0) {
    return <NoResultDisplay />;
  }

  const renderLocationResults = (result: mapkit.SearchAutocompleteResult) => {
    return (
      <SearchResultWrapper
        handleClick={() => {
          if (userPosition) {
            findShuttlePath(userPosition, result.coordinate).then((res) =>
              dispatch(setShuttlePath(res)),
            );
          } else {
            alert('Please Allow User Position!');
          }
        }}
      >
        <div className="w-full cursor-pointer rounded border p-1">
          {result.displayLines.map((displayLine, index) => (
            <p key={index}>{displayLine}</p>
          ))}
        </div>
      </SearchResultWrapper>
    );
  };

  return searchResults.map((result, index) => {
    return <div key={index}>{renderLocationResults(result)}</div>;
  });
};

export default ShuttleSearchResults;
