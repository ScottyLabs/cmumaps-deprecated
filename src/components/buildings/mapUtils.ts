import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { Position } from 'geojson';
import { Coordinate } from 'mapkit-react';

import {
  claimRoom,
  setFocusedFloor,
  setShowRoomNames,
} from '@/lib/features/uiSlice';
import { Floor, FloorPlan, Placement, Room } from '@/types';
import { latitudeRatio, longitudeRatio, rotate } from '@/util/geometry';
import prefersReducedMotion from '@/util/prefersReducedMotion';

import { getFloorCenter } from './FloorPlanView';

export const zoomOnRoom = (
  mapRef: mapkit.Map,
  room: Room,
  floor: Floor,
  floorPlan: FloorPlan,
  dispatch: Dispatch<UnknownAction>,
) => {
  const { placement, rooms } = floorPlan;
  const center = getFloorCenter(Object.values(rooms));
  const points = rooms[room.id].polygon.coordinates
    .flat()
    .map((point) => positionOnMap(point, placement, center));
  zoomOnObject(mapRef, points);

  dispatch(claimRoom(room));
  dispatch(setFocusedFloor(floor));
  dispatch(setShowRoomNames(true));
};

export const zoomOnObject = (mapRef: mapkit.Map, points: Coordinate[]) => {
  const allLat = points.map((p) => p.latitude);
  const allLon = points.map((p) => p.longitude);
  mapRef.setRegionAnimated(
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
