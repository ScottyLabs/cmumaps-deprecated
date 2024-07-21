import simplify from '../simplify';
import { DateTime } from 'luxon';
import {
  currentlyOpen,
  minutesSinceSunday,
  getNextTimeSlot,
} from '../cmueats/time';
import { getStatusMessage } from '../cmueats/queryLocations';
import { retrieveEvents } from '@/pages/api/query';

export async function getImageURL(
  buildingCode: string,
  room: string | null,
): Promise<string> {
  if (room === null) {
    return `/assets/location_images/${simplify(buildingCode)}.jpg`;
  } else {
    //check if file exists
    const res = await fetch('/assets/location_images/list_of_files.txt');
    const txt = await res.text();
    return txt.indexOf(room) != -1
      ? `/assets/location_images/${buildingCode}/${simplify(room)}.jpg`
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

export async function getEatingData(alias: string | undefined) {
  if (!alias) {
    return {};
  }

  const now = DateTime.now().setZone('America/New_York');
  const WEEK_MINUTES = 7 * 24 * 60;
  const res = await fetch('https://dining.apis.scottylabs.org/locations/');
  let eatingData = await res.json();

  if (eatingData.length == 0) {
    return {};
  }
  eatingData.locations = [
    eatingData.locations.find((e) => e.name == alias.toUpperCase()),
  ];
  if (!eatingData) {
    return {};
  } else {
    eatingData = eatingData.locations[0];
    if (!eatingData) {
      return {};
    }
    const { times } = eatingData;
    const timeSlot = times.find(({ start, end }: any) =>
      currentlyOpen(
        {
          start: { day: start.day, hour: start.hour, minute: start.minute },
          end: { day: end.day, hour: end.hour, minute: end.minute },
        },
        now,
      ),
    );

    if (timeSlot) {
      const diff =
        (minutesSinceSunday(
          timeSlot.end.weekday,
          timeSlot.end.hour,
          timeSlot.end.minute,
        ) -
          minutesSinceSunday(now.weekday, now.hour, now.minute) +
          WEEK_MINUTES) %
        WEEK_MINUTES;
      eatingData.statusMsg = getStatusMessage(true, timeSlot.start, now);
      eatingData.changesSoon = diff < 60;
    } else {
      const nextTimeSlot = getNextTimeSlot(times, now);
      let diff;
      if (!nextTimeSlot) {
        diff =
          minutesSinceSunday(
            timeSlot.start.weekday,
            timeSlot.start.hour,
            timeSlot.start.minute,
          ) - minutesSinceSunday(now.weekday, now.hour, now.minute);
        if (diff < 0) {
          diff += WEEK_MINUTES;
        }
      } else {
        eatingData.closedTemporarily = !nextTimeSlot;
        eatingData.changesSoon = !!nextTimeSlot && diff <= 60;
        eatingData.statusMsg = getStatusMessage(false, nextTimeSlot.start, now);
      }
    }
  }
  return eatingData || null;
}

export async function getBuildingWebsites(buildingCode: string | undefined) {
  if (!buildingCode) {
    return;
  }
  const res = await fetch('./assets/buildingWebsites.json');
  // var getFavicons = require('get-website-favicon')
  const buildingWebsites = await res.json();
  const websiteList = buildingWebsites[buildingCode + ''];
  if (!websiteList) {
    return null;
  }
  return websiteList;
}
