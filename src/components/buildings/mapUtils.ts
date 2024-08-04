import { Coordinate } from 'mapkit-react';

import { Building, Floor } from '@/types';
import prefersReducedMotion from '@/util/prefersReducedMotion';

export const getBuildingDefaultFloorToFocus = (building: Building): Floor => {
  return { buildingCode: building.code, level: building.defaultFloor };
};

export const zoomOnObject = (
  mapRef: React.RefObject<mapkit.Map | null>,
  points: Coordinate[],
) => {
  const allLat = points.map((p) => p.latitude);
  const allLon = points.map((p) => p.longitude);
  mapRef.current?.setRegionAnimated(
    new mapkit.BoundingRegion(
      Math.max(...allLat),
      Math.max(...allLon),
      Math.min(...allLat),
      Math.min(...allLon),
    ).toCoordinateRegion(),
    !prefersReducedMotion(),
  );
};
