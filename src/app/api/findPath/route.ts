import { ICompare, PriorityQueue } from '@datastructures-js/priority-queue';
import fs from 'fs';
import { Position } from 'geojson';
import { Coordinate } from 'mapkit-react';
import { NextRequest } from 'next/server';
import path from 'path';

import { Placement, Room } from '@/types';
import { latitudeRatio, longitudeRatio } from '@/util/geometry';

export type Node = {
  pos: { x: number; y: number };
  neighbors: {
    [neighborId: string]: {
      dist: number;
      toFloorInfo: { toFloor: string; type: string };
    };
  };
  roomId: string;
  floor: string;
  coordinate: Coordinate;
  id: string;
};

const outsideRooms = JSON.parse(
  fs.readFileSync(
    path.resolve(
      process.cwd(),
      `./public/json/floor_plan/outside/outside-1-outline.json`,
    ),
    'utf8',
  ),
);

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
): { path: Node[]; distance: number } | { error: string } {
  let start;
  let end;
  if (rooms[0].id) {
    start = Object.values(nodes).find((e) => e.roomId == rooms[0].id);
  } else {
    // Find a node with the building code
    start = Object.values(nodes).find(
      (e) =>
        outsideRooms['rooms'][e.roomId]?.name === rooms[0]?.code ||
        Object.values(e.neighbors).some(
          (f) =>
            f?.toFloorInfo &&
            f?.toFloorInfo.toFloor.split('-')[0] === rooms[0].code,
        ),
    );
  }
  if (rooms[1].id) {
    end = Object.values(nodes).find((e) => e.roomId == rooms[1].id);
  } else {
    // Find a node with the building code
    end = Object.values(nodes).find((e) => {
      return (
        outsideRooms['rooms'][e.roomId]?.name === rooms[1]?.code ||
        Object.values(e.neighbors).some(
          (f) =>
            f?.toFloorInfo &&
            f?.toFloorInfo.toFloor.split('-')[0] === rooms[1].code,
        )
      );
    });
  }
  console.log('SEARCHME', start, rooms[1]?.code);
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
      return { path: currPath, distance: length };
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

export async function POST(req: NextRequest) {
  const { rooms } = await req.json();
  if (!rooms || rooms.length !== 2) {
    return Response.json({ error: 'Invalid rooms' }, { status: 400 });
  }
  console.log(rooms[0].floor, rooms[1].floor);
  const isActuallyBuilding = !(rooms[0].floor && rooms[1].floor);
  const startFloorName = rooms[0].floor
    ? rooms[0].floor.buildingCode + '-' + rooms[0].floor.level
    : rooms[0].code + '-' + rooms[0].defaultFloor;
  const endFloorName = rooms[1].floor
    ? rooms[1].floor.buildingCode + '-' + rooms[1].floor.level
    : rooms[1].code + '-' + rooms[1].defaultFloor;
  console.log(startFloorName, endFloorName);
  const high_level_path = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), `./public/json/high_level_floor_plan.json`),
      'utf8',
    ),
  );

  console.log(startFloorName, endFloorName);
  const explored = new Set();
  const queue = [[startFloorName]];
  let current = [];
  const options = new Set();
  while (queue.length) {
    current = queue.shift();
    if (current[0] === endFloorName) {
      // console.log("Found path", current)
      options.add(current);
      if (options.size > 1) {
        break;
      }
      continue;
    }
    if (explored.has(current[0])) {
      continue;
    }
    explored.add(current[0]);
    Object.values(high_level_path[current[0]]).forEach((neighbor) => {
      queue.push([neighbor[0], ...current]);
    });
  }

  // console.log(options.values().next().value)
  const iter = options.values();
  let nodes1 = {};
  const floorPath1 = iter.next().value || [startFloorName, endFloorName];
  for (const floorName of floorPath1.concat(
    isActuallyBuilding ? ['outside-1'] : [],
  )) {
    const graphPath = path.resolve(
      process.cwd(),
      `./public/json/floor_plan/${floorName.split('-')[0]}/`,
      `${floorName}-graph.json`,
    );
    if (!fs.existsSync(graphPath)) {
      continue;
    }
    const f: { [id: string]: Node } = JSON.parse(
      fs.readFileSync(graphPath, 'utf-8'),
    );

    Object.keys(f).forEach((id: string) => {
      const node = f[id];
      f[id] = {
        ...node,
        floor: floorName,
        id,
      };
    });
    nodes1 = { ...nodes1, ...f };
  }

  let nodes2 = {};
  const floorPath2 = iter.next().value || [startFloorName, endFloorName];
  for (const floorName of floorPath2.concat(
    isActuallyBuilding ? ['outside-1'] : [],
  )) {
    console.log(floorName);
    const graphPath = path.resolve(
      process.cwd(),
      `./public/json/floor_plan/${floorName.split('-')[0]}/`,
      `${floorName}-graph.json`,
    );
    if (!fs.existsSync(graphPath)) {
      continue;
    }
    const f: { [id: string]: Node } = JSON.parse(
      fs.readFileSync(graphPath, 'utf-8'),
    );

    Object.keys(f).forEach((id: string) => {
      const node = f[id];
      f[id] = {
        ...node,
        floor: floorName,
        id,
      };
    });
    nodes2 = { ...nodes2, ...f };
  }

  // const path1 = findPath(rooms, nodes1);
  // const path2 = findPath(rooms, nodes2);

  // if (path1['error']) {
  //   return Response.json({
  //     Fastest: path2,
  //   });
  // } else if (path2['error']) {
  //   return Response.json({
  //     Fastest: path1,
  //   });
  // }

  // Find the path
  return Response.json({
    Fastest: findPath(rooms, nodes1),
    Alternative: findPath(rooms, nodes2),
  });
}
