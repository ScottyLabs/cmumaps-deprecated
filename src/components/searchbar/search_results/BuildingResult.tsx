import React from 'react';

import Roundel from '@/components/shared/Roundel';
import {
  setChoosingRoomMode,
  setEndLocation,
  setStartLocation,
} from '@/lib/features/navSlice';
import { selectBuilding, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { pushLog } from '@/lib/idb/logStore';
import { Document } from '@/types';

import { zoomOnObject } from '../../buildings/mapUtils';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  building: Document;
  query: string;
}

/**
 * Displays the search results.
 */
const BuildingResult = ({ map, building, query }: Props) => {
  const dispatch = useAppDispatch();

  const selectedBuilding = useAppSelector((state) => state.ui.selectedBuilding);
  const buildings = useAppSelector((state) => state.data.buildings);
  const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
  );

  const handleClick = (build_doc: Document) => () => {
    if (!buildings) {
      return;
    }

    const building = buildings[build_doc.id];
    if (choosingRoomMode) {
      if (choosingRoomMode == 'start') {
        pushLog(query, building.code, { nav: 'start' });
        dispatch(setStartLocation(building));
      } else if (choosingRoomMode == 'end') {
        pushLog(query, building.code, { nav: 'end' });
        dispatch(setEndLocation(building));
      }
      dispatch(setIsSearchOpen(false));
      dispatch(setChoosingRoomMode(null));
    } else {
      pushLog(query, building.code);
      if (buildings && map) {
        const building_shapes = building.shapes.flat();
        zoomOnObject(map, building_shapes);
        dispatch(setIsSearchOpen(false));
        dispatch(selectBuilding(building));
      }
    }
  };

  return (
    <SearchResultWrapper
      key={building.id}
      handleClick={handleClick(building)}
      isSelected={building.id == selectedBuilding?.code}
    >
      <div className="flex items-center gap-3">
        <div className="-mx-2.5 scale-[0.6]">
          <Roundel code={building.id} />
        </div>
        <p className="font-bold">{building.fullNameWithSpace}</p>
      </div>
    </SearchResultWrapper>
  );
};

export default BuildingResult;
