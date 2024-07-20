import React, { useMemo } from 'react';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import styles from '@/styles/SearchResults.module.css';
import simplify from '@/util/simplify';
import BuildingSearchResults from './BuildingSearchResults';
import { distance } from '@/geometry';
import { useAppSelector } from '@/lib/hooks';

export interface SearchResultsProps {
  query: string;
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  userPosition: AbsoluteCoordinate;
}

/**
 * Displays the search results.
 */
export default function SearchResults({
  query,
  onSelectRoom,
  userPosition,
}: SearchResultsProps) {
  let buildings = useAppSelector((state) => state.data.buildings);
  buildings = buildings ? [...buildings] : [];
  if (userPosition) {
    buildings.sort(
      (b, a) =>
        -distance(
          { x: a.labelPosition.longitude, y: a.labelPosition.latitude },
          userPosition,
        ) +
        distance(
          { x: b.labelPosition.longitude, y: b.labelPosition.latitude },
          userPosition,
        ),
    );
  }
  // const isEmpty = document.getElementsByName('searchResults').length <=0;
  return (
    <div
      className="empty:before:text-l empty:before:gap-4px empty:before:px-20px empty:before:py-40px h-auto empty:before:flex empty:before:h-32 empty:before:items-center empty:before:justify-center empty:before:text-center empty:before:font-light empty:before:content-['No_results_found.']"
      //styles['search-results']
    >
      {buildings.map((building: Building) => (
        <BuildingSearchResults
          query={query || ''}
          building={building}
          onSelectRoom={onSelectRoom}
          key={building.code}
          userPosition={userPosition}
        />
      ))}
    </div>
  );
}
