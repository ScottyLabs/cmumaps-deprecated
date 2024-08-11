import { Event } from '@prisma/client';

import { Floor, FloorPlan, Room } from '@/types';

export async function fetchEvents(
  roomName: string,
  startDate: Date,
  endDate: Date,
  callback: (events: Event[][]) => void,
) {
  const response = await fetch('/api/events/range', {
    method: 'GET',
    headers: {
      roomName,
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

export async function getDbRoomExists(
  room: Room,
): Promise<boolean | undefined> {
  const dbRoomName = room.floor.buildingCode + ' ' + room.name;

  const response = await fetch('/api/events/roomExists', {
    method: 'GET',
    headers: {
      dbRoomName,
    },
  });

  try {
    const body = await response.json();
    return body;
  } catch (e) {
    console.error('Failed to fetch room', response);
    return;
  }
}

export async function searchEvents(query: string) {
  // console.log(query);
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

export const getFloorPlan = async (floor: Floor): Promise<FloorPlan | null> => {
  const response = await fetch('/api/getFloorPlan', {
    method: 'GET',
    headers: {
      buildingCode: floor.buildingCode,
      floorLevel: floor.level,
    },
  });

  try {
    const body = await response.json();

    if (!response.ok) {
      console.error(body.error);

      return null;
    }

    return body.floorPlan || null;
  } catch (e) {
    console.error('Failed to get floor plan', response);
    return null;
  }
};
