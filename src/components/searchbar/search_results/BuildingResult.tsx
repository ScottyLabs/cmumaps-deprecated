import React from 'react';

import {
  setChoosingRoomMode,
  setEndLocation,
  setStartLocation,
} from '@/lib/features/navSlice';
import { setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Document } from '@/types';

import { zoomOnObject } from '../../buildings/mapUtils';
import SearchResultWrapper from './SearchResultWrapper';
import Roundel from '@/components/shared/Roundel';


interface Props {
    map: mapkit.Map | null;
    building: Document;
}

/**
 * Displays the search results.
 */
const BuildingResult = ({ map, building }: Props) => {
    const dispatch = useAppDispatch();

    const selectedBuilding = useAppSelector((state) => state.ui.selectedBuilding);
    const buildings = useAppSelector((state) => state.data.buildings);
    const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
    );


    const handleClick = (building: Document) => () => {
        if (choosingRoomMode) {
        if (choosingRoomMode == 'start') {
            dispatch(setStartLocation(building));
        } else if (choosingRoomMode == 'end') {
            dispatch(setEndLocation(building));
        }
        dispatch(setIsSearchOpen(false));
        dispatch(setChoosingRoomMode(null));
        } else {
        if (buildings && map) {
            const building_shapes = buildings[building.id].shapes.flat();
            zoomOnObject(map, building_shapes);
        }
        dispatch(setIsSearchOpen(false));
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
}

export default BuildingResult;
