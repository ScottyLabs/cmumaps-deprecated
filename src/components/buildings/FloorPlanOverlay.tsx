import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getFloorPlan } from '@/lib/apiRoutes';
import { addFloorToFloorPlanMap } from '@/lib/features/dataSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, Floor, FloorPlan } from '@/types';

import FloorPlanView from './FloorPlanView';

const getFloorAtOrdinal = (
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
  const buildings = useAppSelector((state) => state.data.buildings);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);

  // fetch the floor plan from floor
  if (!buildings || !focusedFloor?.buildingCode || !focusedFloor?.level) {
    return;
  }

  // some math to get the correct ordinal
  const focusedBuilding = buildings[focusedFloor?.buildingCode];
  const defaultIndex = focusedBuilding.floors.indexOf(
    focusedBuilding.defaultFloor,
  );

  const focusedIndex = focusedBuilding.floors.indexOf(focusedFloor.level);
  const ordinal =
    (focusedBuilding?.defaultOrdinal || 0) + focusedIndex - defaultIndex;

  const visibleFloors = visibleBuildings.map((building) =>
    getFloorAtOrdinal(building, ordinal),
  );

  return visibleFloors.map((floor) => {
    if (floor) {
      return (
        // key is the key to prevent re-rendering
        <FloorPlanView key={floor.buildingCode + floor.level} floor={floor} />
      );
    }
  });
};

export default FloorPlanOverlay;
