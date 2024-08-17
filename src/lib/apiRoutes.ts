/* eslint-disable @typescript-eslint/no-unused-vars */
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

export async function getDbRoomExists(room: Room): Promise<boolean | null> {
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
    return null;
  }
}

export async function searchEvents(query: string) {
  const response = await fetch('/api/events/search', {
    method: 'GET',
    headers: {
      query,
    },
  });

  try {
    const body = await response.json();
    return body.map((event) => ({
      ...event,
      id: event._id.$oid,
      startTime: event.startTime.$date,
      endTime: event.endTime.$date,
    }));
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

export const getUserSchedule = async (userEmail: string): Promise<string[]> => {
  const response = await fetch('/api/getUserSchedule', {
    method: 'GET',
    headers: {
      userEmail,
    },
  });

  try {
    const body = await response.json();

    if (!response.ok) {
      console.error(body.error);
      return [];
    }

    return body;
  } catch (e) {
    console.error('Failed to get parse schedule', response);
    return [];
  }
};

export const postUserSchedule = async (
  userEmail: string,
  schedule: string[],
): Promise<boolean> => {
  const response = await fetch('/api/postUserSchedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userEmail,
      schedule,
    }),
  });

  if (response.ok) {
    return true;
  }
  console.error('Failed to post schedule', response);
  return false;
};
