import polyline from '@mapbox/polyline';
import fs from 'fs';
import { Coordinate } from 'mapkit-react';
import { NextRequest } from 'next/server';
import path from 'path';

import { Route, Stop } from './types';

export async function POST(req: NextRequest) {
  const { startLocation, endLocation } = await req.json();
  console.log(startLocation, endLocation);
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
        Math.pow(endLocation.latitude - stop.Latitude, 2) +
          Math.pow(endLocation.longitude - stop.Longitude, 2),
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
      Math.pow(startLocation.latitude - stop.Latitude, 2) +
        Math.pow(startLocation.longitude - stop.Longitude, 2),
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

  const closestStartIdx = routeCoords.reduce(
    (acc, coord, idx) => {
      const dist = Math.sqrt(
        Math.pow(coord.latitude - closestStartStop!.Latitude, 2) +
          Math.pow(coord.longitude - closestStartStop!.Longitude, 2),
      ).toFixed(3);

      if (dist < acc[1]) {
        return [idx, dist];
      }

      return acc;
    },
    [0, Infinity],
  );
  routeCoords = routeCoords.concat(routeCoords);
  let closestEndIdx = routeCoords.reduce(
    (acc, coord, idx) => {
      if (idx < closestStartIdx[0]) {
        return acc;
      }
      const dist = Math.sqrt(
        Math.pow(coord.latitude - closestEndStop!.Latitude, 2) +
          Math.pow(coord.longitude - closestEndStop!.Longitude, 2),
      ).toFixed(3);

      if (dist < acc[1]) {
        return [idx, dist];
      }

      return acc;
    },
    [0, Infinity],
  );
  console.log(closestStartIdx, closestEndIdx);
  if (closestEndIdx[0] < closestStartIdx[0]) {
    closestEndIdx = [closestEndIdx[0] + routeCoords.length, closestEndIdx[1]];
  }

  const response: Coordinate[] = routeCoords.slice(
    closestStartIdx[0],
    closestEndIdx[0] + 1,
  );
  console.log(response);
  return Response.json([startLocation, ...response, endLocation]);
  // return Response.json([startLocation,
  //   {longitude: closestStartStop.Longitude, latitude: closestStartStop.Latitude},
  //   {longitude: closestEndStop.Longitude, latitude: closestEndStop.Latitude},
  //   endLocation]);
}
