/* eslint-disable @typescript-eslint/no-explicit-any */
import { EateryData } from '@/types';

const daysOfWeek = [
  'Sunday', // 0
  'Monday', // 1
  'Tuesday', // 2
  'Wednesday', // 3
  'Thursday', // 4
  'Friday', // 5
  'Saturday', // 6
];

interface CmuEatsTimeType {
  day: number;
  hour: number;
  minute: number;
}

interface CmuEatsTimeIntervalType {
  start: CmuEatsTimeType;
  end: CmuEatsTimeType;
}

export const getEateryData = async (): Promise<EateryData[]> => {
  const res = await fetch('https://dining.apis.scottylabs.org/locations/');
  const cmueatsData = (await res.json())['locations'];

  const now = new Date();

  // a ChatGPT generated function that converts CmuEatsTimeType to Date
  function convertToDate({ day, hour, minute }: CmuEatsTimeType): Date {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Create a new date object set to the current date
    const date = new Date(now);

    // Calculate the date of the desired day
    const daysUntilTarget = (day - currentDay + 7) % 7;
    date.setDate(now.getDate() + daysUntilTarget);

    // Set the desired hour and minute
    date.setHours(hour, minute, 0, 0);

    return date;
  }

  const getHourDif = (startTime: Date, endDate: Date) => {
    const timeDifference = endDate.getTime() - startTime.getTime();

    // Convert milliseconds to hours
    const hoursDifference = timeDifference / (1000 * 60 * 60); // milliseconds to hours

    return hoursDifference;
  };

  const closeHelper = (nextDate: Date, ans: Partial<EateryData>) => {
    const hourDif = getHourDif(now, nextDate);

    if (hourDif < 1) {
      ans.locationState = 'OPENS_SOON';
      ans.statusMsg = `Close (${Math.round(hourDif * 60)} minutes until open)`;
    } else if (hourDif < 24) {
      ans.locationState = 'CLOSED';
      ans.statusMsg = `Open (${Math.round(hourDif)} hours until open)`;
    } else {
      ans.locationState = 'CLOSED';
      ans.statusMsg = `Close (${Math.ceil(hourDif / 24)} days until open on ${daysOfWeek[nextDate.getDay()]})`;
    }
  };

  const getStatusMsgAndLocationState = (
    eatery: any,
    ans: Partial<EateryData>,
  ) => {
    const currentDay = now.getDay();
    const curTime = eatery['times'].find(
      (time: CmuEatsTimeIntervalType) => time.start.day == currentDay,
    );
    if (curTime) {
      const startTime = convertToDate(curTime.start);
      const endTime = convertToDate(curTime.end);

      // when open
      if (now >= startTime && now <= endTime) {
        const hourDif = getHourDif(now, endTime);

        // message depend on if more than an hour until closing
        if (hourDif > 1) {
          ans.locationState = 'OPEN';
          ans.statusMsg = `Open (${Math.round(hourDif)} hours until close)`;
        } else {
          ans.locationState = 'CLOSES_SOON';
          ans.statusMsg = `Open (${Math.round(hourDif * 60)} minutes until close)`;
        }
      }
      // when close
      else {
        const getNextDate = (eatery: any): Date => {
          // if today's session haven't started
          if (now < startTime) {
            return startTime;
          }

          // otherwise get the next index
          const todayIndex = eatery.times.findIndex(
            (time: CmuEatsTimeIntervalType) => time.start.day == currentDay,
          );

          return convertToDate(
            eatery.times[(todayIndex + 1) % eatery.times.length].start,
          );
        };

        const nextDate = getNextDate(eatery);
        closeHelper(nextDate, ans);
      }
    } else {
      const makeWrapAround = (times: CmuEatsTimeType[]) => {
        const firstElement = JSON.parse(JSON.stringify(times[0]));

        // Modify the specified field in the copied element
        firstElement.start.day += 7;
        firstElement.end.day += 7;

        // Push the modified copy to the destination list
        times.push(firstElement);
      };

      makeWrapAround(eatery.times);

      const nextDay = eatery.times.find(
        (time: CmuEatsTimeIntervalType) => time.start.day > currentDay,
      );
      const nextDate = convertToDate(nextDay.start);
      closeHelper(nextDate, ans);
    }
  };

  const parseEatery = (eatery: any): EateryData => {
    const ans: Partial<EateryData> = {};
    ans.name = eatery.name;
    ans.url = eatery.url;
    ans.shortDescription = eatery.shortDescription;

    if (eatery.times.length == 0) {
      ans.locationState = 'CLOSED_LONG_TERM';
    } else {
      getStatusMsgAndLocationState(eatery, ans);
    }

    return ans as EateryData;
  };

  return cmueatsData.map((eatery: any) => parseEatery(eatery));
};
