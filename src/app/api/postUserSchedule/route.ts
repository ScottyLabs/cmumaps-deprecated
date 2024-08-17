import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { userEmail, schedule } = await req.json();

  const data = await prisma.user.create({
    data: {
      email: userEmail,
      schedule,
    },
  });

  return Response.json(data !== null);
}
