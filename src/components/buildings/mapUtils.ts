import { Position } from 'geojson';
import { Coordinate } from 'mapkit-react';

import { Building, Floor, Placement } from '@/types';
import { latitudeRatio, longitudeRatio, rotate } from '@/util/geometry';
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
