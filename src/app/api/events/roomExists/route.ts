import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const dbRoomName = req.headers.get('dbRoomName') as string;

  const room = await prisma.room.findUnique({
    where: {
      name: dbRoomName,
    },
  });

  return Response.json(room !== null);
}
