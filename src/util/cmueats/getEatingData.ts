import { DateTime } from 'luxon';
import {
  currentlyOpen,
  minutesSinceSunday,
  getNextTimeSlot,
} from '../cmueats/time';
import { getStatusMessage } from '../cmueats/queryLocations';

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
