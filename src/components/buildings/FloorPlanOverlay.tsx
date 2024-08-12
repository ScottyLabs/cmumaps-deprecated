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
  visibleBuildings;

  const dispatch = useAppDispatch();
  const buildings = useAppSelector((state) => state.data.buildings);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);

  const [floorPlans, setFloorPlans] = useState<
    ((FloorPlan & Floor) | null)[] | null
  >(null);

  const floorPlanMapRef = useRef({});

  const addToFloorPlanMaps = useCallback(
    (buildingCode: string, floorLevel: string, floorPlan: FloorPlan) => {
      if (!floorPlanMapRef.current[buildingCode]) {
        floorPlanMapRef.current[buildingCode] = {};
      }
      floorPlanMapRef.current[buildingCode][floorLevel] = floorPlan;

      dispatch(addFloorToFloorPlanMap([buildingCode, floorLevel, floorPlan]));
    },
    [dispatch],
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
      (focusedBuilding?.defaultOrdinal || 0) + focusedIndex - defaultIndex;

    // get all the floor plans
    const promises = visibleBuildings.map(async (building) => {
      const floor = getFloorAtOrdinal(building, ordinal);

      if (floor) {
        if (
          floorPlanMapRef.current[floor.buildingCode] &&
          floorPlanMapRef.current[floor.buildingCode][floor.level]
        ) {
          return {
            ...floorPlanMapRef.current[floor.buildingCode][floor.level],
            buildingCode: floor.buildingCode,
            level: floor.level,
          };
        }

        return getFloorPlan(floor).then((floorPlan) => {
          // be careful of floor plans that doesn't have placements
          if (floorPlan?.placement) {
            addToFloorPlanMaps(floor.buildingCode, floor.level, floorPlan);
            return {
              ...floorPlan,
              buildingCode: floor.buildingCode,
              level: floor.level,
            };
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
    addToFloorPlanMaps,
    buildings,
    dispatch,
    focusedFloor?.buildingCode,
    focusedFloor.level,
    visibleBuildings,
  ]);

  if (!floorPlans) {
    return;
  }
  return floorPlans.map((floorPlan) => {
    if (floorPlan) {
      return (
        // key is the key to prevent re-rendering
        <FloorPlanView
          key={floorPlan.buildingCode + floorPlan.level}
          floorPlan={floorPlan}
        />
      );
    }
  });
};

export default FloorPlanOverlay;
