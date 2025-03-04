import React from 'react';

import EateryInfoDisplay from '@/components/infocard/EateryInfoDisplay';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { pushLog } from '@/lib/idb/logStore';
import { Document } from '@/types';
import { getEateryId } from '@/util/eateryUtils';

import { zoomOnRoomById } from '../../buildings/mapUtils';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  eatery: Document;
  query: string;
}

/**
 * Displays the search results.
 */
const RoomSearchResults = ({ map, eatery, query }: Props) => {
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
        pushLog(query, eatery);
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
};

export default RoomSearchResults;
