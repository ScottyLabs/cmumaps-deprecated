import { Coordinate } from 'mapkit-react';

import { RouteDisplay } from '@/app/api/getAllShuttleRoutes/route';

export const getShuttleRoutesOverlays = async (): Promise<
  mapkit.PolylineOverlay[]
> => {
  const pathOverlays: mapkit.PolylineOverlay[] = [];

  const response = await fetch('/api/getAllShuttleRoutes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const allShuttleRoutes = await response.json();

  allShuttleRoutes.map((route: RouteDisplay) => {
    const shuttlePathOverlay = new mapkit.PolylineOverlay(
      route.coordinates.map(
        (c: Coordinate) => new mapkit.Coordinate(c.latitude, c.longitude),
      ),
      {
        style: new mapkit.Style({
          strokeColor: route.routeColor,
          strokeOpacity: 0.9,
          lineWidth: 5,
        }),
      },
    );

    pathOverlays.push(shuttlePathOverlay);
  });

  return pathOverlays;
};

export const shuttlePathToOverlay = (shuttlePath: Coordinate[]) => {
  const pathOverlays: mapkit.PolylineOverlay[] = [];

  const walkingPathOverlay = new mapkit.PolylineOverlay(
    shuttlePath
      .slice(0, 2)
      .map((c: Coordinate) => new mapkit.Coordinate(c.latitude, c.longitude)),
    {
      style: new mapkit.Style({
        strokeColor: 'green',
        strokeOpacity: 0.9,
        lineWidth: 5,
      }),
    },
  );

  pathOverlays.push(walkingPathOverlay);

  const shuttlePathOverlay = new mapkit.PolylineOverlay(
    shuttlePath
      .slice(1, shuttlePath.length - 1)
      .map((c: Coordinate) => new mapkit.Coordinate(c.latitude, c.longitude)),
    {
      style: new mapkit.Style({
        strokeColor: 'blue',
        strokeOpacity: 0.9,
        lineWidth: 5,
      }),
    },
  );

  pathOverlays.push(shuttlePathOverlay);

  const walkingPathOverlay2 = new mapkit.PolylineOverlay(
    shuttlePath
      .slice(shuttlePath.length - 2, shuttlePath.length)
      .map((c: Coordinate) => new mapkit.Coordinate(c.latitude, c.longitude)),
    {
      style: new mapkit.Style({
        strokeColor: 'green',
        strokeOpacity: 0.9,
        lineWidth: 5,
      }),
    },
  );

  pathOverlays.push(walkingPathOverlay2);

  return pathOverlays;
};
