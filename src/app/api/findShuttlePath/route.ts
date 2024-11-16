import { Coordinate } from 'mapkit-react';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { coordinate } = await req.json();

  const response: Coordinate[] = [coordinate];

  return Response.json(response);
}
