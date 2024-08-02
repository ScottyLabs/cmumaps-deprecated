import { PrismaClient } from '@prisma/client';
import { date } from 'joi';
import { NextRequest } from 'next/server';
import { start } from 'repl';
const prisma = new PrismaClient();

export async function retrieveEvents(
  roomName: string,
  startDate: Date,
  endDate: Date,
) {
  const events = await prisma.event.findMany({
    orderBy: [{ startTime: 'asc' }],
    where: {
      roomName,
      date: {
        lte: endDate,
        gte: startDate,
      },
    },
  });

  return events;
}

export async function GET(req: NextRequest) {
  const roomName = req.headers.get('roomName');

  const startDate = new Date(
    parseInt(req.headers.get('startDate')),
  ).toISOString();
  const endDate = new Date(parseInt(req.headers.get('endDate'))).toISOString();

  const events = await retrieveEvents(roomName, startDate, endDate);
  const groupedEvents = [];
  let date = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    date = new Date(date.valueOf() + 60 * 60 * 24 * 1000);
    const dateEvents = events.filter(
      (event) => event.date.getDate() == date.getDate(),
    );
    groupedEvents.push(dateEvents);
  }
  console.log(events, groupedEvents);
  return Response.json(groupedEvents);
}
