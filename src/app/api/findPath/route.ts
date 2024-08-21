import { ICompare, PriorityQueue } from '@datastructures-js/priority-queue';
import fs from 'fs';
import { Position } from 'geojson';
import { Coordinate } from 'mapkit-react';
import { NextRequest } from 'next/server';
import path from 'path';

import { Building, Placement, Room } from '@/types';
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

const bridges = [
  'eb1d6e15-a052-4df0-bc0b-fa70feeea3d6',
  '1a7b853f-cb9b-44d0-a1ec-c339c13b83bd',
];

const buildings: Record<string, Building> = JSON.parse(
  fs.readFileSync(
    path.resolve(process.cwd(), './public/json/buildings.json'),
    'utf8',
  ),
);
const allFloors = Object.entries(buildings)
  .map(([code, building]) => getAllFloorNames({ code, ...building }))
  .flat(2);

let nodes2 = {};
// const floorPath2 = iter.next().value || [startFloorName, endFloorName];
for (const floorName of allFloors.concat(['outside-1'])) {
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
    start = [Object.values(nodes).find((e) => e.roomId == rooms[0].id)];
  } else {
    // Find a node with the building code
    start = Object.values(nodes)
      .filter((e) => {
        return (
          (e.floor == 'outside-1' || bridges.includes(e.roomId)) &&
          (outsideRooms['rooms'][e.roomId]?.name === rooms[0]?.code ||
            Object.entries(e.neighbors).some(
              ([id, f]) =>
                f?.toFloorInfo &&
                f?.toFloorInfo.toFloor.split('-')[0] === rooms[0].code &&
                nodes[id],
            ))
        );
      })
      .map((node) => {
        if (outsideRooms['rooms'][node.roomId]?.name === rooms[0]?.code) {
          return node;
        }
        const [endId, neigh] = Object.entries(node.neighbors || {}).find(
          ([id, e]) =>
            e?.toFloorInfo?.toFloor?.split('-')?.[0] === rooms[0].code,
        );
        if (endId && neigh) {
          return nodes[endId];
        }
        return node;
      });
  }

  if (rooms[1].id) {
    end = [Object.values(nodes).find((e) => e.roomId == rooms[1].id)];
  } else {
    // Find a node with the building code
    end = Object.values(nodes)
      .filter((e) => {
        return (
          (e.floor == 'outside-1' || bridges.includes(e.roomId)) &&
          (outsideRooms['rooms'][e.roomId]?.name === rooms[1]?.code ||
            Object.entries(e.neighbors).some(
              ([id, f]) =>
                f?.toFloorInfo &&
                f?.toFloorInfo.toFloor.split('-')[0] === rooms[1].code &&
                nodes[id],
            ))
        );
      })
      .map((node) => {
        if (outsideRooms['rooms'][node.roomId]?.name === rooms[1]?.code) {
          return node;
        }
        const [endId, neigh] = Object.entries(node.neighbors || {}).find(
          ([id, e]) =>
            e?.toFloorInfo?.toFloor?.split('-')?.[0] === rooms[1].code,
        );
        if (endId && neigh) {
          return nodes[endId];
        }
        return node;
      });
  }
  console.log(start[0], end[0], 'SE');

  if (!start) {
    return { error: 'Start room not found' };
  } else if (!end) {
    return { error: 'End room not found' };
  }
  // Dijkstras algorithm
  const paths = start.map((s) => {
    const visited = new Set();

    const queue = new PriorityQueue<Path>(comparePaths);
    queue.enqueue({
      node: s,
      currPath: [s],
      length: 0,
    });

    while (queue.size()) {
      const a = queue.dequeue();
      const { node, currPath, length } = a;
      if (!node) {
        continue;
      }
      if (end.map((e) => e?.pos || false).includes(node.pos)) {
        return { path: currPath, distance: length };
      }
      if (!visited.has(node)) {
        visited.add(node);

        Object.entries(node.neighbors).forEach((neigh) => {
          const n_id = neigh[0];
          const n_dist = neigh[1]['dist'] < 0 ? 0.001 : neigh[1]['dist'];
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
  });

  const goodpaths = paths.filter((p) => !!p.path);
  goodpaths.sort((a, b) => a.distance - b.distance);
  console.log(goodpaths, 'PATH');
  return goodpaths[0] || { error: 'Path not found' };
}

function getAllFloorNames(building: Building): string[][] {
  return (building.floors || []).map((floor) => {
    return [building.code + '-' + floor];
  });
}

export async function POST(req: NextRequest) {
  const { rooms } = await req.json();
  if (!rooms || rooms.length !== 2) {
    return Response.json({ error: 'Invalid rooms' }, { status: 400 });
  }
  const isActuallyBuilding = !(rooms[0].floor && rooms[1].floor);
  const startFloorName = rooms[0].floor
    ? rooms[0].floor.buildingCode + '-' + rooms[0].floor.level
    : rooms[0].code + '-' + rooms[0].defaultFloor;
  const endFloorName = rooms[1].floor
    ? rooms[1].floor.buildingCode + '-' + rooms[1].floor.level
    : rooms[1].code + '-' + rooms[1].defaultFloor;

  const high_level_path = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), `./public/json/high_level_floor_plan.json`),
      'utf8',
    ),
  );
  if (!high_level_path[startFloorName] || !high_level_path[endFloorName]) {
    return Response.json({
      Fastest: findPath(rooms, nodes2),
    });
  }
  const explored = new Set();
  const queue = [[startFloorName]];
  let current = [];
  const options = new Set();
  while (queue.length) {
    current = queue.shift();
    if (current[0] === endFloorName) {
      options.add(current);
      if (options.size > 1) {
        break;
      }
      continue;
    }
    explored.add(current[0]);
    Object.values(high_level_path[current[0]])
      .filter((n) => !explored.has(n))
      .forEach((neighbor) => {
        queue.push([neighbor[0], ...current]);
      });
  }

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
  console.log('IMHERE', floorPath1);

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
  const paths = [findPath(rooms, nodes1), findPath(rooms, nodes2)];
  // if (paths[0]['error'] && paths[1]['error']) {
  //   return Response.json({
  //     error: 'Path not found',
  //   });
  // }
  console.log(paths, 'PATHS');
  // Find the path
  return Response.json({
    Fastest: paths[1],
    Alternative: paths[0],
  });
}
