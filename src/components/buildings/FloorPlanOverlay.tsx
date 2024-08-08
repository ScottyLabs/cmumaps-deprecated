import React, { useEffect, useState } from 'react';

import { getFloorPlan } from '@/lib/apiRoutes';
import { addFloorToFloorPlanMap } from '@/lib/features/dataSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, Floor, FloorPlan } from '@/types';

import FloorPlanView from './FloorPlanView';

const getFloorAtOrdinal = (
  building: Building,
  ordinal: number,
): Floor | null => {
  const ordinalDif = ordinal - building.defaultOrdinal;
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

  const buildings = useAppSelector((state) => state.data.buildings);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);

  const [floorPlans, setFloorPlans] = useState<(FloorPlan | null)[] | null>(
    null,
  );

  // fetch the floor plan from floor
  useEffect(() => {
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
      focusedBuilding.defaultOrdinal + focusedIndex - defaultIndex;

    // get all the floor plans
    const promises = visibleBuildings.map(async (building) => {
      const floor = getFloorAtOrdinal(building, ordinal);

      if (floor) {
        if (
          floorPlanMap[floor.buildingCode] &&
          floorPlanMap[floor.buildingCode][floor.level]
        ) {
          return floorPlanMap[floor.buildingCode][floor.level];
        }

        return getFloorPlan(floor).then((floorPlan) => {
          // be careful of floor plans that doesn't have placements
          if (floorPlan?.placement) {
            dispatch(
              addFloorToFloorPlanMap([
                floor.buildingCode,
                floor.level,
                floorPlan,
              ]),
            );
            return floorPlan;
          } else {
            return null;
          }
        });
      } else {
        return null;
      }
    });

    Promise.all(promises).then((newFloorPlans) => setFloorPlans(newFloorPlans));
  }, [
    buildings,
    dispatch,
    floorPlanMap,
    focusedFloor?.buildingCode,
    focusedFloor?.level,
    visibleBuildings,
  ]);

  if (!floorPlans) {
    return;
  }

  return floorPlans.map((floorPlan, index) => {
    if (floorPlan) {
      return <FloorPlanView key={index} floorPlan={floorPlan} />;
    }
  });
};

export default FloorPlanOverlay;
