import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { userId, schedule } = await req.json();

  const data = await prisma.user.create({
    data: {
      clerkId: userId,
      schedule,
    },
  });

  return Response.json(data !== null);
}
