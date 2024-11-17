//https://andysbuses.com/Services/JSONPRelay.svc/GetMapVehiclePoints?apiKey=8882812681&isPublicMap=true
import { NextRequest } from 'next/server';

// import { Bus } from './types';

export async function POST(req: NextRequest) {
  const { routeId } = await req.json();

  const busses: Bus[] = await fetch(
    'https://andysbuses.com/Services/JSONPRelay.svc/GetMapVehiclePoints?apiKey=8882812681&isPublicMap=true',
  ).then((res) => res.json());

  if (!busses) {
    return Response.error();
  }

  const routeBus: Bus | undefined = busses.find(
    (bus) => bus.RouteID === routeId,
  );
  if (!routeBus) {
    return Response.error();
  }

  const response = {
    location: {
      latitude: routeBus.Latitude,
      longitude: routeBus.Longitude,
    },
    routeId: routeBus.RouteID,
  };

  return Response.json(response);
}
