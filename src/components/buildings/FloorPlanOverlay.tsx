import React, { useEffect } from 'react';

import { setIsFloorPlanRendered } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, Floor } from '@/types';

import FloorPlanView from './FloorPlanView';

export const getOrdinalOfFloor = (building: Building, floor: Floor) => {
  const defaultIndex = building.floors.indexOf(building.defaultFloor);
  const focusedIndex = building.floors.indexOf(floor.level);
  return (building?.defaultOrdinal || 0) + focusedIndex - defaultIndex;
};

export const getFloorAtOrdinal = (
  building: Building,
  ordinal: number,
): Floor | null => {
  const ordinalDif = ordinal - (building.defaultOrdinal || 0);
  const defaultIndex = building.floors.indexOf(building.defaultFloor);
  const floorIndex = defaultIndex + ordinalDif;

  if (!building.floors[floorIndex]) {
    return null;
  }

  return {
    buildingCode: building.code,
    level: building.floors[floorIndex],
  };
};

interface Props {
  visibleBuildings: Building[];
}

/**
 * The contents of a floor displayed on the map.
 */
const FloorPlanOverlay = ({ visibleBuildings }: Props) => {
  const dispatch = useAppDispatch();

  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const buildings = useAppSelector((state) => state.data.buildings);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);

  useEffect(() => {
    dispatch(setIsFloorPlanRendered(true));
  });

  if (!buildings || !focusedFloor?.buildingCode || !focusedFloor?.level) {
    return;
  }

  // some math to get the correct ordinal
  const focusedBuilding = buildings[focusedFloor?.buildingCode];
  const ordinal = getOrdinalOfFloor(focusedBuilding, focusedFloor);

  const visibleFloors = visibleBuildings.map((building) => {
    return getFloorAtOrdinal(building, ordinal);
  });
  return visibleFloors.map((floor) => {
    if (floor) {
      return (
        // key is the key to prevent re-rendering
        <FloorPlanView
          key={floor.buildingCode + floor.level}
          floor={floor}
          floorPlan={floorPlanMap?.[floor.buildingCode]?.[floor.level]}
        />
      );
    }
  });
};

export default FloorPlanOverlay;
