import { Coordinate } from 'mapkit-react';

import { ShuttlePath } from '@/app/api/findShuttlePath/types';
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

export const shuttlePathToOverlay = (shuttlePath: ShuttlePath) => {
  const pathOverlays: mapkit.Overlay[] = [];

  // the line overlays
  // Note: the walkingPathOverlays be replaced with on Campus route later
  const walkingPathOverlay = new mapkit.PolylineOverlay(
    shuttlePath.routePath
      .slice(0, 2)
      .map((c: Coordinate) => new mapkit.Coordinate(c.latitude, c.longitude)),
    {
      style: new mapkit.Style({
        strokeColor: 'black',
        strokeOpacity: 0.9,
        lineWidth: 5,
      }),
    },
  );

  pathOverlays.push(walkingPathOverlay);

  const shuttlePathOverlay = new mapkit.PolylineOverlay(
    shuttlePath.routePath
      .slice(1, -1)
      .map((c: Coordinate) => new mapkit.Coordinate(c.latitude, c.longitude)),
    {
      style: new mapkit.Style({
        strokeColor: shuttlePath.routeColor,
        strokeOpacity: 0.9,
        lineWidth: 5,
      }),
    },
  );

  pathOverlays.push(shuttlePathOverlay);

  const walkingPathOverlay2 = new mapkit.PolylineOverlay(
    shuttlePath.routePath
      .slice(-2, shuttlePath.routePath.length)
      .map((c: Coordinate) => new mapkit.Coordinate(c.latitude, c.longitude)),
    {
      style: new mapkit.Style({
        strokeColor: 'black',
        strokeOpacity: 0.9,
        lineWidth: 5,
      }),
    },
  );

  pathOverlays.push(walkingPathOverlay2);

  // stops
  const stopOverlays = shuttlePath.routeStops.map(
    (routeStop) =>
      new mapkit.CircleOverlay(
        new mapkit.Coordinate(
          routeStop.coordinate.latitude,
          routeStop.coordinate.longitude,
        ),
        15,
        {
          style: new mapkit.Style({
            strokeColor: 'black',
            fillColor: 'white',
            fillOpacity: 1,
          }),
        },
      ),
  );

  pathOverlays.push(...stopOverlays);

  return pathOverlays;
};
