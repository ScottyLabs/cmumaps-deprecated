import { ICompare, PriorityQueue } from '@datastructures-js/priority-queue';
import fs from 'fs';
import { Position } from 'geojson';
import { Coordinate } from 'mapkit-react';
import { NextRequest } from 'next/server';
import path from 'path';

import { Floor, Placement, Room } from '@/types';
import { latitudeRatio, longitudeRatio } from '@/util/geometry';

export type Node = {
  pos: { x: number; y: number };
  neighbors: {
    [neighborId: string]: {
      dist: number;
      toFloorInfo: { toFloor: Floor; type: string };
    };
  };
  roomId: string;
  floor: Floor;
  coordinate: Coordinate;
};
export interface GraphResponse {
  nodes: { [nodeId: string]: Node };
}

export function rotate(x: number, y: number, angle: number): number[] {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = cos * x + sin * y;
  const ny = cos * y - sin * x;
  return [nx, ny];
}

export const positionOnMap = (
  absolute: Position,
  placement: Placement,
  center: Position,
) => {
  const [absoluteY, absoluteX] = rotate(
    absolute[0] - center[0],
    absolute[1] - center[1],
    placement.angle,
  );
  return {
    latitude:
      absoluteY / latitudeRatio / placement.scale + placement.center.latitude,
    longitude:
      absoluteX / longitudeRatio / placement.scale + placement.center.longitude,
  };
};

interface Path {
  node: Node;
  currPath: Node[];
  length: number;
}

const comparePaths: ICompare<Path> = (a: Path, b: Path) => a.length - b.length;

// Dijkstras algorithm to search from room 1 to room 2
function findPath(
  rooms: Room[],
  nodes: { [nodeId: string]: Node },
): Node[] | { error: string } {
  const start = Object.values(nodes).find((e) => e.roomId == rooms[0].id);
  const end = Object.values(nodes).find((e) => e.roomId == rooms[1].id);
  if (!start) {
    return { error: 'Start room not found' };
  } else if (!end) {
    return { error: 'End room not found' };
  }
  // Dijkstras algorithm
  const visited = new Set();

  const queue = new PriorityQueue<Path>(comparePaths);

  queue.enqueue({
    node: start,
    currPath: [start],
    length: 0,
  });

  while (queue.size()) {
    const a = queue.dequeue();
    const { node, currPath, length } = a;
    if (end.pos == node.pos) {
      return currPath;
    }
    if (!visited.has(node)) {
      visited.add(node);

      Object.entries(node.neighbors).forEach((neigh) => {
        const n_id = neigh[0];
        const n_dist = neigh[1]['dist'];
        const nextNode = nodes[n_id];
        if (!nextNode) {
          return;
        }
        queue.enqueue({
          node: nextNode,
          currPath: [...currPath, nextNode],
          length: length + n_dist,
        });
      });
    }
  }
  return { error: 'Path not found' };
}
const getFloorCenter = (rooms: Room[]): Position => {
  let points: Position[] = Object.values(rooms).flatMap((room: Room) =>
    room.polygon.coordinates.flat(),
  );

  points = points.filter((e) => e !== undefined);

  const allX = points.map((p) => p[0]);
  const allY = points.map((p) => p[1]);

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  return [(minX + maxX) / 2, (minY + maxY) / 2];
};
export async function POST(req: NextRequest) {
  let nodes = {};
  for (const buildingCode of ['GHC', 'WEH', 'NSH']) {
    for (const level of [
      'A',
      'B',
      'C',
      'D',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
    ]) {
      const graphPath = path.resolve(
        process.cwd(),
        `./public/json/floor_plan/${buildingCode}/`,
        `${buildingCode}-${level}-graph.json`,
      );
      const outlinePath = path.resolve(
        process.cwd(),
        `./public/json/floor_plan/${buildingCode}/`,
        `${buildingCode}-${level}-outline.json`,
      );
      if (!fs.existsSync(graphPath) || !fs.existsSync(outlinePath)) {
        continue;
      }
      const f: { [id: string]: Node } = JSON.parse(
        fs.readFileSync(graphPath, 'utf-8'),
      );
      const outline = JSON.parse(fs.readFileSync(outlinePath, 'utf-8'));

      const rooms = outline.rooms;
      const center = getFloorCenter(rooms);

      Object.keys(f).forEach((id: string) => {
        const node = f[id];
        f[id] = {
          ...node,
          coordinate: positionOnMap(
            [node.pos.x, node.pos.y],
            outline.placement,
            center,
          ),
          floor: { buildingCode, level },
        };
      });
      nodes = { ...nodes, ...f };
    }
  }
  const { rooms } = await req.json();
  if (!rooms || rooms.length !== 2) {
    return Response.error();
  }
  // Find the path
  const recommendedPath = findPath(rooms, nodes);
  return Response.json(recommendedPath);
}
