import polyline from '@mapbox/polyline';
import fs from 'fs';
import { Coordinate } from 'mapkit-react';
import { NextRequest } from 'next/server';
import path from 'path';

import { Route } from '../findShuttlePath/types';

export type RouteDisplay = {
  routeID: string;
  routeColor: string;
  coordinates: Coordinate[];
};

export async function GET(_req: NextRequest) {
  const routes: Route[] = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), `./public/cmumaps-data/routes.json`),
      'utf8',
    ),
  );

  const activeRoutes = routes.filter((route) => route.IsRunning);

  const response = activeRoutes.map((route) => {
    return {
      routeID: route.RouteID,
      routeColor: route.MapLineColor,
      coordinates: polyline.decode(route.EncodedPolyline).map((coord) => ({
        latitude: coord[0],
        longitude: coord[1],
      })),
    };
  });

  return Response.json(response);
}
