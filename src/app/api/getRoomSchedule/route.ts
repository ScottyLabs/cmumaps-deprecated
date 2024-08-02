import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const roomName = requestData.roomName;

    console.log(await prisma.room.findFirst());

    const events = await prisma.event.findMany({
      orderBy: [{ startTime: 'asc' }],
      where: {
        roomName: 'TEP 2612',
        // date: {
        //   lte: endDate,
        //   gte: startDate,
        // },
      },
    });

    console.log(events);

    // good response
    return new NextResponse(JSON.stringify({ events }), {
      status: 200,
    });
  } catch (e) {
    // Javascript Error Message
    // console.log(e);
    return new NextResponse(
      JSON.stringify({
        error: String(e),
        // error: String(e.stack),
      }),
      {
        status: 500,
      },
    );
  }
}
