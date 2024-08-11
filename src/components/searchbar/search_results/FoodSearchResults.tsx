import React from 'react';

import { selectBuilding, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, SearchRoom } from '@/types';
import { sortEateries } from '@/util/eateryUtils';

import { zoomOnObject, zoomOnSearchRoom } from '../../buildings/mapUtils';
import EateryInfoDisplay from '../../infocard/EateryInfoDisplay';
import Roundel from '../../shared/Roundel';
import NoResultDisplay from '../display_helpers/NoResultDisplay';
import { RoomSearchResult } from '../searchUtils';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  searchResult: RoomSearchResult[];
}

/**
 * Displays the food search results.
 */
const FoodSearchResults = ({ map, searchResult }: Props) => {
  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const eateryData = useAppSelector((state) => state.data.eateryData);

  if (searchResult.length == 0) {
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
          <div className="mx-[-10px] scale-[0.6]">
            <Roundel code={building.code} />
          </div>
          <p className="pl-[-1] font-bold">{building.name}</p>
        </div>
      </SearchResultWrapper>
    );
  };

  const renderFoodResults = (eateries: SearchRoom[]) => {
    const renderTitle = (eatery: SearchRoom) => {
      return <h3> {eatery.alias}</h3>;
    };

    sortEateries(eateries, eateryData);

    return eateries.map((eatery: SearchRoom) => {
      const eateryInfo = eateryData[eatery.alias.toUpperCase()];

      return (
        <SearchResultWrapper
          key={eatery.id}
          handleClick={() => {
            zoomOnSearchRoom(map, eatery, buildings, floorPlanMap, dispatch);
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

  return searchResult.map((buildingResult) => {
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
