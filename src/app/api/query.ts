import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function retrieveEvents(roomName: string, date: string) {
  const events = await prisma.event.findMany({
    where: {
      roomName,
    },
  });

  console.log(roomName, events);

  return events;
}

// For Theo: no longer need building name; please update your code correspondinly (:folded hand emoji)
// retrieveEvents("MI 416", "2024-04-15");
