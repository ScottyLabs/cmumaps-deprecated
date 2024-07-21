import simplify from '../simplify';
import { retrieveEvents } from '@/pages/api/query';

export async function getImageURL(
  buildingCode: string,
  room: string | null,
): Promise<string> {
  if (room === null) {
    return `/assets/location_images/building_images/${simplify(buildingCode)}.jpg`;
  } else {
    //check if file exists
    const res = await fetch('/assets/location_images/list_of_files.txt');
    const txt = await res.text();
    return txt.indexOf(room) != -1
      ? `/assets/location_images/room_images/${buildingCode}/${simplify(room)}.jpg`
      : getImageURL(buildingCode, null);
  }
  // "./assets/location_images/GHC/4102.jpg"
}

export async function getAvailabilityData(
  buildingCode: string,
  room: string,
): Promise<any[] | null> {
  const specialdata = await fetch(
    //Use threads here
    `/api/events`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        building: buildingCode,
        room,
        date: undefined,
      }),
    },
  );
  let parsedspecialdata;
  try {
    parsedspecialdata = await specialdata?.json();
  } catch (error) {
    parsedspecialdata = [];
  }

  // let res = await fetch("./assets/roomsToTimesS24_new.json")
  // let roomsToTimes = await res.json()
  const thisroom = []; //= roomsToTimes[buildingCode+"_"+room]
  parsedspecialdata.forEach((element) => {
    const dow = (new Date(element.date).getDay() + 1) % 7;
    const start = new Date(element.startTime);
    const startTime = start.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    const end = new Date(element.endTime);
    const endTime = end.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    if (!thisroom[dow]) {
      thisroom[dow] = [];
    }
    console.log([[startTime, endTime], element.name]);

    thisroom[dow].push([[startTime, endTime], element.name]);
  });
  console.log(thisroom);
  return thisroom || null;
}
