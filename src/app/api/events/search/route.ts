import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';

export async function searchEvents(query: string) {
  const events = await prisma.$runCommandRaw({
    aggregate: 'Event',
    pipeline: [
      {
        $search: {
          index: 'roomNameIndex',
          text: {
            query,
            path: {
              wildcard: '*',
            },
          },
        },
      },
    ],
    cursor: {},
  });

  if (!events.cursor) {
    return undefined;
  }

  return (events.cursor as Prisma.JsonObject).firstBatch;
}

export async function GET(req: NextRequest) {
  const [query] = [req.headers.get('query') || undefined];
  if (!query) {
    return Response.error();
  }

  const events = await searchEvents(query);
  console.log(events);
  return Response.json(events);
}
