import { Event } from '@prisma/client';

export async function fetchEvents(
  roomName: string | undefined,
  startDate: Date,
  endDate: Date,
  callback: (events: Event[][]) => void,
) {
  const response = await fetch('/api/events/range', {
    method: 'GET',
    headers: {
      roomName: roomName || '',
      startDate: startDate.valueOf().toString(),
      endDate: endDate.valueOf().toString(),
    },
  });

  try {
    const body = await response.json();
    callback(body);
  } catch (e) {
    console.error('Failed to fetch events', response);
    return;
  }
}

export async function searchEvents(query: string) {
  console.log(query);
  const response = await fetch('/api/events/search', {
    method: 'GET',
    headers: {
      query,
    },
  });

  try {
    const body = await response.json();
    return body;
  } catch (e) {
    console.error('Failed to fetch events', response);
    return;
  }
}
