import React, { useEffect, useState } from 'react';

import { selectBuilding, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, SearchRoom } from '@/types';
import { getEateryId, sortEateries } from '@/util/eateryUtils';

import { zoomOnObject, zoomOnRoomById } from '../../buildings/mapUtils';
import EateryInfoDisplay from '../../infocard/EateryInfoDisplay';
import Roundel from '../../shared/Roundel';
import LoadingDisplay from '../display_helpers/LoadingDisplay';
import NoResultDisplay from '../display_helpers/NoResultDisplay';
import { RoomSearchResult, searchRoom } from '../searchUtils';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  query: string;
}

/**
 * Displays the food search results.
 */
const FoodSearchResults = ({ map, query }: Props) => {
  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const eateryData = useAppSelector((state) => state.data.eateryData);
  const searchMap = useAppSelector((state) => state.data.searchMap);
  const userPostion = useAppSelector((state) => state.nav.userPosition);

  const [searchResults, setSearchResults] = useState<RoomSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (buildings) {
      setIsLoading(true);
      const handler = setTimeout(() => {
        setSearchResults(
          searchRoom(buildings, query, userPostion, searchMap, 'food'),
        );
        setIsLoading(false);
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [buildings, query, searchMap, userPostion]);

  if (isLoading) {
    return <LoadingDisplay />;
  }

  if (searchResults.length == 0) {
    return <NoResultDisplay />;
  }

  const renderBuildingResults = (building: Building) => {
    const handleClick = () => {
      if (map) {
        zoomOnObject(map, building.shapes.flat());
      }
      dispatch(selectBuilding(building));
      dispatch(setIsSearchOpen(false));
    };

    return (
      <SearchResultWrapper handleClick={handleClick}>
        <div className="flex items-center gap-3">
          <div className="-mx-2.5 scale-[0.6]">
            <Roundel code={building.code} />
          </div>
          <p className="font-bold">{building.name}</p>
        </div>
      </SearchResultWrapper>
    );
  };

  const renderFoodResults = (eateries: SearchRoom[]) => {
    if (!eateryData) {
      return;
    }

    const renderTitle = (eatery: SearchRoom) => {
      return <h3> {eatery.alias}</h3>;
    };

    sortEateries(eateries, eateryData);

    return eateries.map((eatery: SearchRoom) => {
      const eateryInfo = eateryData[getEateryId(eatery)];

      return (
        <SearchResultWrapper
          key={eatery.id}
          handleClick={() => {
            zoomOnRoomById(
              map,
              eatery.id,
              eatery.floor,
              buildings,
              floorPlanMap,
              dispatch,
            );
          }}
        >
          <div className="w-full cursor-pointer rounded border p-1">
            <EateryInfoDisplay
              room={eatery}
              title={renderTitle(eatery)}
              eateryInfo={eateryInfo}
            />
          </div>
        </SearchResultWrapper>
      );
    });
  };

  return searchResults.map((buildingResult) => {
    const building = buildingResult.building;
    return (
      <div key={building.code}>
        {renderBuildingResults(building)}
        {renderFoodResults(buildingResult.searchRoom)}
      </div>
    );
  });
};

export default FoodSearchResults;
