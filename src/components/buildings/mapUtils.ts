import { Coordinate } from 'mapkit-react';

import prefersReducedMotion from '@/util/prefersReducedMotion';

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
