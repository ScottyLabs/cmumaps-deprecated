import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { Coordinate } from 'mapkit-react';

import {
  claimRoom,
  setFocusedFloor,
  setIsZoomingOnRoom,
  setShowRoomNames,
} from '@/lib/features/uiSlice';
import { Building, Floor, FloorPlanMap, ID } from '@/types';
import prefersReducedMotion from '@/util/prefersReducedMotion';

const setIsZoomingOnRoomAsync = (isZooming: boolean) => {
  return (dispatch) => {
    return new Promise<void>((resolve) => {
      dispatch(setIsZoomingOnRoom(isZooming));
      resolve();
    });
  };
};

export const zoomOnRoom = (
  map: mapkit.Map | null,
  roomId: ID,
  floor: Floor,
  buildings: Record<string, Building> | null,
  floorPlanMap: FloorPlanMap,
  dispatch: Dispatch<UnknownAction>,
) => {
  if (!buildings || !map || !floorPlanMap) {
    return;
  }

  if (floor) {
    if (
      floorPlanMap[floor.buildingCode] &&
      floorPlanMap[floor.buildingCode][floor.level]
    ) {
      const floorPlan = floorPlanMap[floor.buildingCode][floor.level];
      const room = floorPlan[roomId];

      dispatch(claimRoom(room));
      dispatch(setShowRoomNames(true));
      dispatch(setFocusedFloor(floor));

      // zoom after finish setting the floor
      setIsZoomingOnRoomAsync(true)(dispatch).then(() => {
        const points = floorPlan[room.id].coordinates;
        zoomOnObject(map, points[0]);
      });
    }
  }
};

export const zoomOnFloor = (
  map: mapkit.Map,
  buildings: Record<string, Building> | null,
  floor: Floor,
  dispatch: Dispatch<UnknownAction>,
) => {
  dispatch(setFocusedFloor(floor));

  // zoom after finish setting the floor
  setIsZoomingOnRoomAsync(true)(dispatch).then(() => {
    const points = buildings[floor.buildingCode].shapes.flat();
    zoomOnObject(map, points);
  });
};

export const zoomOnObject = (map: mapkit.Map, points: Coordinate[]) => {
  const allLat = points.map((p) => p.latitude);
  const allLon = points.map((p) => p.longitude);
  map.setRegionAnimated(
    new mapkit.BoundingRegion(
      Math.max(...allLat),
      Math.max(...allLon),
      Math.min(...allLat),
      Math.min(...allLon),
    ).toCoordinateRegion(),
    !prefersReducedMotion(),
  );
};
