import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { Position } from 'geojson';
import { Coordinate } from 'mapkit-react';

import {
  claimRoom,
  setFocusedFloor,
  setShowRoomNames,
} from '@/lib/features/uiSlice';
import { Building, Floor, FloorPlanMap, ID, Placement } from '@/types';
import { latitudeRatio, longitudeRatio, rotate } from '@/util/geometry';
import prefersReducedMotion from '@/util/prefersReducedMotion';

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

  if (floor?.buildingCode && floor.level) {
    if (
      floorPlanMap[floor.buildingCode] &&
      floorPlanMap[floor.buildingCode][floor.level]
    ) {
      const floorPlan = floorPlanMap[floor.buildingCode][floor.level];
      const room = floorPlan[roomId];
      const points = floorPlan[room.id].coordinates;
      zoomOnObject(map, points[0]);

      dispatch(claimRoom(room));
      dispatch(setFocusedFloor(floor));
      dispatch(setShowRoomNames(true));
    }
  }
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

export const positionOnMap = (
  absolute: Position,
  placement: Placement,
  center: Position,
) => {
  const [absoluteY, absoluteX] = rotate(
    absolute[0] - center[0],
    absolute[1] - center[1],
    placement.angle,
  );
  return {
    latitude:
      absoluteY / latitudeRatio / placement.scale + placement.center.latitude,
    longitude:
      absoluteX / longitudeRatio / placement.scale + placement.center.longitude,
  };
};
