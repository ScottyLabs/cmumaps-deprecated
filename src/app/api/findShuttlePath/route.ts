import polyline from '@mapbox/polyline';
import fs from 'fs';
import { first } from 'lodash';
import { Coordinate } from 'mapkit-react';
import { NextRequest } from 'next/server';
import path from 'path';

import { Route, Stop } from './types';

export async function POST(req: NextRequest) {
  const { startLocation, endLocation } = await req.json();

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
    const startDist =
      Math.sqrt(
        Math.pow(startLocation.latitude - stop.Latitude, 2) +
          Math.pow(startLocation.longitude - stop.Longitude, 2),
      ) * 1.5;
    console.log(startDist.toFixed(3), closestStartDist?.toFixed(3));
    if (
      !closestStartDist ||
      startDist.toFixed(2) < closestStartDist.toFixed(2)
    ) {
      closestStartDist = startDist;
      closestStartStop = stop;
    }
  }

  if (!closestStartStop) {
    return Response.error();
  }

  let sortedStops = bestRoute.Stops.sort((a, b) => a.Order - b.Order);

  const firstStopIdx = sortedStops.findIndex(
    (stop) => stop.Order === closestStartStop!.Order,
  );
  let lastStopIdx = sortedStops.findIndex(
    (stop) => stop.Order === closestEndStop!.Order,
  );
  if (firstStopIdx > lastStopIdx) {
    lastStopIdx = lastStopIdx + sortedStops.length;
    sortedStops = sortedStops.concat(sortedStops);
  }
  // console.log(sortedStops.map(stop => stop.Order), firstStopIdx, lastStopIdx)
  // console.log(closestStartStop.Order, closestEndStop.Order, sortedStops.map(stop => stop.Order).slice(firstStopIdx, lastStopIdx))
  const stopsPath = sortedStops.slice(firstStopIdx, lastStopIdx).map((stop) => {
    return {
      coordinate: {
        latitude: stop.Latitude,
        longitude: stop.Longitude,
      },
      name: stop.Description,
    };
  });

  let routeCoords = polyline.decode(bestRoute.EncodedPolyline);
  routeCoords = routeCoords.map((coord) => ({
    latitude: coord[0],
    longitude: coord[1],
  }));

  const possibleEndIdxs = routeCoords
    .map((coord, idx) => [coord, idx])
    .filter(([coord, idx]) => {
      return (
        Math.sqrt(
          Math.pow(coord.latitude - closestEndStop!.Latitude, 2) +
            Math.pow(coord.longitude - closestEndStop!.Longitude, 2),
        ).toFixed(3) == '0.000'
      );
    })
    .map(([coord, idx]) => idx);

  const possibleStartIdxs = routeCoords
    .map((coord, idx) => [coord, idx])
    .filter(([coord, idx]) => {
      return (
        Math.sqrt(
          Math.pow(coord.latitude - closestStartStop!.Latitude, 2) +
            Math.pow(coord.longitude - closestStartStop!.Longitude, 2),
        ).toFixed(3) == '0.000'
      );
    })
    .map(([coord, idx]) => idx);

  console.log(possibleStartIdxs, possibleEndIdxs);

  let closestPair = [0, Infinity];
  let minDist = Infinity;
  for (const idx of possibleStartIdxs) {
    for (const idx2 of possibleEndIdxs) {
      const dist =
        (idx2 - (idx % routeCoords.length) + routeCoords.length) %
        routeCoords.length;
      if (dist < minDist) {
        minDist = dist;
        closestPair = [idx, idx2];
      }
    }
  }
  console.log(closestPair);
  let [closestStartIdx, closestEndIdx] = closestPair;
  if (closestEndIdx < closestStartIdx) {
    console.log('this happened', closestEndIdx, closestStartIdx);
    routeCoords = routeCoords.concat(routeCoords);
    closestEndIdx = closestEndIdx + routeCoords.length;
  }

  const response: Coordinate[] = routeCoords.slice(
    closestStartIdx,
    closestEndIdx + 1,
  );
  return Response.json({
    routeId: bestRoute.RouteID,
    routeColor: bestRoute.MapLineColor,
    routePath: [startLocation, ...response, endLocation],
    routeStops: stopsPath,
  });
}
