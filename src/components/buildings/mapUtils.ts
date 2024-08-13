import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { Position } from 'geojson';
import { Coordinate } from 'mapkit-react';

import { getFloorPlan } from '@/lib/apiRoutes';
import {
  claimRoom,
  setFocusedFloor,
  setShowRoomNames,
} from '@/lib/features/uiSlice';
import {
  Building,
  Floor,
  FloorPlan,
  FloorPlanMap,
  Placement,
  Room,
  SearchRoom,
} from '@/types';
import { latitudeRatio, longitudeRatio, rotate } from '@/util/geometry';
import prefersReducedMotion from '@/util/prefersReducedMotion';

export const zoomOnSearchRoom = (
  map: mapkit.Map | null,
  searchRoom: SearchRoom,
  buildings: Record<string, Building> | null,
  floorPlanMap: FloorPlanMap,
  dispatch: Dispatch<UnknownAction>,
) => {
  if (!buildings || !map) {
    return;
  }

  const floor = searchRoom.floor;

  if (floor?.buildingCode && floor.level) {
    if (
      floorPlanMap[floor.buildingCode] &&
      floorPlanMap[floor.buildingCode][floor.level]
    ) {
      const floorPlan = floorPlanMap[floor.buildingCode][floor.level];
      const room = floorPlan.rooms[searchRoom.id];
      zoomOnRoom(map, room, floor, floorPlan, dispatch);
    } else {
      getFloorPlan(floor).then((floorPlan) => {
        // be careful of floor plans that doesn't have placements !!!
        if (floorPlan?.placement) {
          const room = floorPlan.rooms[searchRoom.id];
          zoomOnRoom(map, room, floor, floorPlan, dispatch);
        }
      });
    }
  }
};

export const zoomOnRoom = (
  map: mapkit.Map,
  room: Room,
  floor: Floor,
  floorPlan: FloorPlan,
  dispatch: Dispatch<UnknownAction>,
) => {
  const points = floorPlan[room.id].coordinates;
  zoomOnObject(map, points[0]);

  dispatch(claimRoom(room));
  dispatch(setFocusedFloor(floor));
  dispatch(setShowRoomNames(true));
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
