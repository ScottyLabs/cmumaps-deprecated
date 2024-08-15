import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userEmail = req.headers.get('userName') as string;

  const room = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });

  return Response.json(room !== null);
}
