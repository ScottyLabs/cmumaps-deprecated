import { ICompare, PriorityQueue } from '@datastructures-js/priority-queue';
import fs from 'fs';
import { NextRequest } from 'next/server';
import path from 'path';

import { Building } from '@/types';

import { MaybeRoute, Node, Route, Waypoint } from './types';

const outsideRooms = JSON.parse(
  fs.readFileSync(
    path.resolve(
      process.cwd(),
      `./public/json/floor_plan/outside/outside-1-outline.json`,
    ),
    'utf8',
  ),
);

const allNodes: Record<string, Node> = JSON.parse(
  fs.readFileSync(
    path.resolve(process.cwd(), './public/json/all_graph.json'),
    'utf8',
  ),
);

const high_level_graph: Record<string, [string, string][]> = JSON.parse(
  fs.readFileSync(
    path.resolve(process.cwd(), `./public/json/high_level_floor_plan.json`),
    'utf8',
  ),
);

// The 'search nodes' in the dijkstra's graph
interface PathNode {
  node: Node;
  currPath: Node[];
  length: number;
}

const comparePaths: ICompare<PathNode> = (a: PathNode, b: PathNode) =>
  a.length - b.length;

// Dijkstras algorithm to search from room 1 to room 2
function findPath(
  start: Node[],
  end: Node[],
  nodesFilter: (node: Node) => boolean = () => true,
  transitionFilter: ([string, Edge]) => boolean = () => true,
  stairsCost = 15, // cost of taking stairs in Meters
): MaybeRoute {
  const nodes = allNodes;

  // Dijkstras algorithm, performed over all start nodes
  const paths = start.map((s) => {
    const visited = new Set();

    const queue = new PriorityQueue<PathNode>(comparePaths);
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

      // Supports multiple end nodes
      if (end.map((e) => e.pos).includes(node.pos)) {
        return { path: currPath, distance: length };
      }

      if (!visited.has(node)) {
        visited.add(node);

        Object.entries(node.neighbors)
          .filter(transitionFilter)
          .filter(([id, neighbor]) => nodesFilter(nodes[id]))
          .forEach(([n_id, neighbor]) => {
            const n_dist = neighbor.dist < 0 ? stairsCost : neighbor.dist;
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

  let shortestRoute: Route | null = null;
  for (const route of paths) {
    if (
      route.distance &&
      (!shortestRoute || route.distance < shortestRoute.distance)
    ) {
      shortestRoute = route;
    }
  }

  return shortestRoute || { error: 'Path not found' };
}

const waypointToNodes = (
  waypoint: Waypoint,
  nodesFilter: (node: Node) => boolean = () => true,
): Node[] | null => {
  const nodes = Object.values(allNodes).filter(nodesFilter);

  if ('id' in waypoint) {
    // Waypoint is a Room
    const node = nodes.find((e: Node) => e.roomId == waypoint.id);
    if (!node) {
      return null;
    }
    return [node];
  }
  if ('code' in waypoint) {
    // Waypoint is a Building, 2 cases: building without floorplan, building with floorplan
    const building = waypoint as Building;
    if (
      !building?.floors?.length ||
      building.code === 'FBA' ||
      building.code === 'MOR'
    ) {
      // Building without floorplan, just get it from outside
      const buildingNodes = nodes.filter(
        (e: Node) => outsideRooms['rooms'][e.roomId]?.name === building.code,
      );
      return buildingNodes.length ? buildingNodes : null;
    }
    // Building with floorplan, find all nodes in the building linked to outside
    const buildingNodes = nodes.filter(
      (e: Node) =>
        e.floor.buildingCode == building.code &&
        Object.values(e.neighbors).some(
          (neigh) => neigh?.toFloorInfo?.toFloor == 'outside-1',
        ),
    );
    return buildingNodes.length ? buildingNodes : null;
  }
  return null;
};

const waypointToFloor = (waypoint: Waypoint): string | null =>
  'floor' in waypoint
    ? waypoint.floor.buildingCode + '-' + waypoint.floor.level // if is room
    : (waypoint as Building).code + '-' + (waypoint as Building).defaultFloor;

const highLevelPath = (
  startFloor: string,
  endFloor: string,
): string[] | null => {
  const explored = new Set();
  let endFloorName = endFloor;
  if (!high_level_graph[endFloor]) {
    endFloorName = 'outside-1';
  }
  let startFloorName = startFloor;
  if (!high_level_graph[startFloor]) {
    startFloorName = 'outside-1';
  }
  const queue = [[startFloorName]];

  let current: string[] = [];
  while (queue.length) {
    current = queue.shift() || [];
    if (current[0] === endFloorName) {
      return current;
    }
    explored.add(current[0]);
    Object.values(high_level_graph[current[0]])
      .filter((n) => !explored.has(n))
      .forEach((neighbor) => {
        queue.push([neighbor[0], ...current]);
      });
  }
  return null;
};

export async function POST(req: NextRequest) {
  const { waypoints } = await req.json();

  if (!waypoints || waypoints.length !== 2) {
    return Response.json({ error: 'Invalid waypoints' }, { status: 400 });
  }
  const [startFloorName, endFloorName] = waypoints.map(waypointToFloor);
  const [startNodes, endNodes] = waypoints.map((waypoint) =>
    waypointToNodes(waypoint),
  );
  console.log(startNodes, endNodes);

  if (!startNodes || !endNodes) {
    return Response.json(
      { error: 'Cannot find nodes for waypoints' },
      { status: 400 },
    );
  }
  let allowFloors: string[] | null = null;
  try {
    allowFloors = highLevelPath(startFloorName, endFloorName);
  } catch {
    allowFloors = null;
  }

  if (
    !high_level_graph[startFloorName] ||
    !high_level_graph[endFloorName] ||
    !allowFloors
  ) {
    return Response.json({
      Fastest: findPath(startNodes, endNodes),
    });
  }

  const nodeFilter = (node) =>
    allowFloors.includes(node.floor.buildingCode + '-' + node.floor.level);

  const paths = [
    findPath(startNodes, endNodes, nodeFilter),
    findPath(startNodes, endNodes),
  ];

  let resp = {};
  if ('error' in paths[0]) {
    resp = { error: 'Path not found' };
    return Response.json(resp);
  }

  if ('path' in paths[0]) {
    resp['Alternative'] = paths[0];
  }
  if ('path' in paths[1]) {
    resp['Fastest'] = paths[1];
  } else if ('error' in paths[0]) {
    resp = { error: 'Path not found' };
  }

  // Find the path
  return Response.json({
    Fastest: paths[1],
    Alternative: paths[0],
  });
}
