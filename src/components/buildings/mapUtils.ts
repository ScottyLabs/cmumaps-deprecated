import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { Coordinate } from 'mapkit-react';

import {
  selectRoom,
  setFocusedFloor,
  setIsZooming,
  setShowRoomNames,
} from '@/lib/features/uiSlice';
import { Building, Floor, FloorPlanMap, Room, RoomId } from '@/types';
import prefersReducedMotion from '@/util/prefersReducedMotion';

const setIsZoomingAsync = (isZooming: boolean) => {
  return (dispatch: Dispatch) => {
    return new Promise<void>((resolve) => {
      dispatch(setIsZooming(isZooming));
      resolve();
    });
  };
};

export const getRoomIdByNameAndFloor = (
  roomName: string,
  floor: Floor,
  floorPlanMap: FloorPlanMap,
): string | null => {
  let roomId: string | null = null;

  if (
    floorPlanMap[floor.buildingCode] &&
    floorPlanMap[floor.buildingCode][floor.level]
  ) {
    const floorPlan = floorPlanMap[floor.buildingCode][floor.level];
    for (const room of Object.values(floorPlan)) {
      if (room.name == roomName) {
        roomId = room.id;
      }
    }
  }

  return roomId;
};

/**
 * Also assign the redux variables accordingly
 */
export const zoomOnRoomById = (
  map: mapkit.Map | null,
  roomId: RoomId,
  floor: Floor,
  buildings: Record<string, Building> | null,
  floorPlanMap: FloorPlanMap | null,
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

      dispatch(selectRoom(room));

      zoomOnRoom(map, room, dispatch);
    }
  }
};

/**
 *
 */
export const zoomOnRoom = (
  map: mapkit.Map | null,
  room: Room,
  dispatch: Dispatch<UnknownAction>,
) => {
  if (!map) {
    return;
  }

  dispatch(setShowRoomNames(true));
  dispatch(setFocusedFloor(room.floor));

  // zoom after finish setting the floor
  setIsZoomingAsync(true)(dispatch).then(() => {
    const points = room.coordinates;
    zoomOnObject(map, points[0]);
  });
};

/**
 * Also assign the redux variables accordingly
 */
export const zoomOnFloor = (
  map: mapkit.Map,
  buildings: Record<string, Building>,
  floor: Floor,
  dispatch: Dispatch<UnknownAction>,
) => {
  // zoom after finish setting the floor
  setIsZoomingAsync(true)(dispatch).then(() => {
    dispatch(setFocusedFloor(floor));
    zoomOnObject(map, buildings[floor.buildingCode].shapes.flat());
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
