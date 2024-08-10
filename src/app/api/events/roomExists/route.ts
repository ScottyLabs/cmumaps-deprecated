import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';

export async function retrieveRoom(roomName: string | undefined) {
  const events = await prisma.event.findFirst({
    where: {
      roomName,
    },
  });

  return events;
}

export async function GET(req: NextRequest) {
  const roomName = req.headers.get('roomName') as string;

  const events = await retrieveRoom(roomName);

  return Response.json(events);
}
