import polyline from '@mapbox/polyline';
import fs from 'fs';
import { Coordinate } from 'mapkit-react';
import { NextRequest } from 'next/server';
import path from 'path';

import { Route, Stop } from './types';

export async function POST(req: NextRequest) {
  const { startCoordinate, endCoordinate } = await req.json();

  const routes: Route[] = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), `./public/cmumaps-data/routes.json`),
      'utf8',
    ),
  );

  const activeRoutes = routes.filter((route) => route.IsRunning);
  let closestEndDist: null | number = null;
  let closestEndStop: null | Stop = null;
  for (const route of activeRoutes) {
    for (const stop of route.Stops) {
      const endDist = Math.sqrt(
        Math.pow(endCoordinate.latitude - stop.Latitude, 2) +
          Math.pow(endCoordinate.longitude - stop.Longitude, 2),
      );

      if (!closestEndDist || endDist < closestEndDist) {
        closestEndDist = endDist;
        closestEndStop = stop;
      }
    }
  }

  if (!closestEndStop) {
    return Response.error();
  }

  const bestRoute = activeRoutes.find(
    (route) => route.RouteID === closestEndStop.RouteID,
  );
  if (!bestRoute) {
    return Response.error();
  }

  let closestStartStop: Stop | null = null;
  let closestStartDist: null | number = null;
  for (const stop of bestRoute.Stops) {
    const startDist = Math.sqrt(
      Math.pow(startCoordinate.latitude - stop.Latitude, 2) +
        Math.pow(startCoordinate.longitude - stop.Longitude, 2),
    );

    if (!closestStartDist || startDist < closestStartDist) {
      closestStartDist = startDist;
      closestStartStop = stop;
    }
  }

  if (!closestStartStop) {
    return Response.error();
  }

  let routeCoords = polyline.decode(bestRoute.EncodedPolyline);
  routeCoords = routeCoords.map((coord) => ({
    latitude: coord[0],
    longitude: coord[1],
  }));
  routeCoords = routeCoords.concat(routeCoords);

  const closestStartIdx = routeCoords.reduce(
    (acc, coord, idx) => {
      const dist = Math.sqrt(
        Math.pow(coord.latitude - closestStartStop!.Latitude, 2) +
          Math.pow(coord.longitude - closestStartStop!.Longitude, 2),
      );

      if (dist < acc[1]) {
        return [idx, dist];
      }

      return acc;
    },
    [0, Infinity],
  );
  const closestEndIdx = routeCoords.reduce(
    (acc, coord, idx) => {
      const dist = Math.sqrt(
        Math.pow(coord.latitude - closestEndStop!.Latitude, 2) +
          Math.pow(coord.longitude - closestEndStop!.Longitude, 2),
      );

      if (dist < acc[1]) {
        return [idx, dist];
      }

      return acc;
    },
    [0, Infinity],
  );

  const response: Coordinate[] = routeCoords.slice(
    closestStartIdx[0],
    closestEndIdx[0] + 1,
  );

  return Response.json([startCoordinate, ...response, endCoordinate]);
}
