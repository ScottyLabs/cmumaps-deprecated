import path from 'path';
import fs from 'fs';
import { Coordinate } from 'mapkit-react';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ICompare, PriorityQueue } from '@datastructures-js/priority-queue';
import { Room } from '@/types';
import { NextRequest } from 'next/server';

export type node = {
  pos: { x: number; y: number };
  neighbors: { [neighborId: string]: { dist: number } };
  roomID: string;
};
export interface GraphResponse {
  nodes: { [nodeId: string]: node };
}

interface Path {
  node: node;
  currPath: node[];
  length: number;
}

function getDistance(a: Coordinate, b: Coordinate) {
  return Math.sqrt(
    (a.latitude - b.latitude) ** 2 + (a.longitude - b.longitude) ** 2,
  );
}

const comparePaths: ICompare<Path> = (a: Path, b: Path) => a.length - b.length;

// Dijkstras algorithm to search from room 1 to room 2
function findPath(
  rooms: string[],
  nodes: { [nodeId: string]: node },
): node[] | { error: string } {
  const start = Object.values(nodes).find((e) => e.roomID == rooms[0]);
  const end = Object.values(nodes).find((e) => e.roomID == rooms[1]);
  if (!start || !end) {
    return { error: 'Room not found' };
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
    const { node, currPath, length } = queue.dequeue();
    if (end.pos == node.pos) {
      return currPath;
    }
    if (!visited.has(node)) {
      visited.add(node);

      Object.entries(node.neighbors).forEach((neigh) => {
        const n_id = neigh[0];
        const n_dist = neigh[1]['dist'];
        const nextNode = nodes[n_id];
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
type resp = NextApiResponse<Door[] | { error: string }>;

export async function POST(req: NextRequest) {
  let nodes = {};
  for (const ordinal of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) {
    const graphPath = path.resolve(
      process.cwd(),
      './public/json/GHC/',
      `GHC-${ordinal}-graph.json`,
    );
    const f = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));

    nodes = { ...nodes, ...f };
  }
  console.log(nodes);
  const { rooms } = await req.json();
  if (!rooms || rooms.length !== 2) {
    return Response.error();
  }
  console.log(rooms);
  // Find the path
  const recommendedPath = findPath(rooms, nodes);
  console.log('recpath', recommendedPath);
  return Response.json(recommendedPath);
}
