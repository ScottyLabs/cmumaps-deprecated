import React, { useMemo } from 'react';
import { AbsoluteCoordinate, Building, Floor, FloorMap, Room } from '@/types';
import styles from '@/styles/SearchResults.module.css';
import simplify from '@/util/simplify';
import BuildingSearchResults from './BuildingSearchResults';
import { distance } from '@/geometry';

export interface SearchResultsProps {
  query: string;
  buildings: Building[];
  floorMap: FloorMap;
  onSelectBuilding: (selectedBuilding: Building) => void;
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  userPosition: AbsoluteCoordinate;
}

/**
 * Displays the search results.
 */
export default function SearchResults({
  query,
  buildings,
  floorMap,
  onSelectBuilding,
  onSelectRoom,
  userPosition,
}: SearchResultsProps) {
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

  return (
    <div
      className={
        "empty:before:text-l empty:before:gap-4px empty:before:px-20px empty:before:py-40px h-auto empty:before:flex empty:before:h-32 empty:before:items-center empty:before:justify-center empty:before:text-center empty:before:font-light empty:before:content-['No_results_found.']"
        //styles['search-results']
      }
    >
      {buildings.map((building: Building) => (
        <BuildingSearchResults
          query={query || ''}
          building={building}
          floorMap={floorMap}
          onSelectBuilding={onSelectBuilding}
          onSelectRoom={onSelectRoom}
          key={building.code}
          userPosition={userPosition}
        />
      ))}
    </div>
  );
}
