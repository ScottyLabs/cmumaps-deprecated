import React from 'react';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Document } from '@/types';

import { zoomOnRoomById } from '../../buildings/mapUtils';
import SearchResultWrapper from './SearchResultWrapper';
import EateryInfoDisplay from '@/components/infocard/EateryInfoDisplay';
import { getEateryId } from '@/util/eateryUtils';


interface Props {
    map: mapkit.Map | null;
    eatery: Document;
}

/**
 * Displays the search results.
 */
const RoomSearchResults = ({ map, eatery }: Props) => {
    const dispatch = useAppDispatch();

    const buildings = useAppSelector((state) => state.data.buildings);
    const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
    const eateryData = useAppSelector((state) => state.data.eateryData);

    if (!eateryData) {
      return;
    }
    
    const renderTitle = (eatery: Document) => {
          return <h3> {eatery.alias}</h3>;
        };

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
      <div className="w-full cursor-pointer">
        <EateryInfoDisplay
          room={eatery}
          title={renderTitle(eatery)}
          eateryInfo={eateryInfo}
        />
      </div>
    </SearchResultWrapper>
    );
}

export default RoomSearchResults;
