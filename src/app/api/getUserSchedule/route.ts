import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('userId') as string;

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (user && user.schedule) {
    return Response.json(user.schedule);
  } else {
    return Response.json({});
  }
}
