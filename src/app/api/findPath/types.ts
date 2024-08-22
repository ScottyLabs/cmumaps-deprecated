import { Coordinate } from 'mapkit-react';

import { Building, Floor, Room } from '@/types';

export type Edge = {
  dist: number;
  toFloorInfo: { toFloor: string; type: string };
};

export type Node = {
  pos: { x: number; y: number };
  neighbors: {
    [neighborId: string]: Edge;
  };
  roomId: string;
  floor: Floor;
  coordinate: Coordinate;
  id: string;
};

export type Path = Node[];

export type Route = { path: Path; distance: number };
export type MaybeRoute = Route | { error: string };

export type RouteResponse = Record<string, Route>;

// The things we navigate between
export type Waypoint = Room | Building | { userPosition: Coordinate };
