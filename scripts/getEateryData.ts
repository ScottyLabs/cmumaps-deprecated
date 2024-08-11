/* eslint-disable @typescript-eslint/no-explicit-any */
import { EateryData } from '../src/types';

// Promise<EateryData[]>

export const getEateryData = async () => {
  const res = await fetch('https://dining.apis.scottylabs.org/locations/');
  const cmueatsData = (await res.json())['locations'];

  const now = new Date();

  function convertToDate({ day, hour, minute }): Date {
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

  const getHourDif = (startTime, endDate) => {
    const timeDifference = endDate.getTime() - startTime.getTime();

    // Convert milliseconds to hours
    const hoursDifference = timeDifference / (1000 * 60 * 60); // milliseconds to hours

    return hoursDifference;
  };

  const getNextOpenTime = (eatery, todayStartTime) => {
    // today's session haven't started
    if (now < todayStartTime) {
      return todayStartTime;
    }

    // find next date
    console.log(eatery);
  };

  const getStatusMsgAndLocationState = (
    eatery: any,
    ans: Partial<EateryData>,
  ) => {
    const currentDay = now.getDay();
    const curTime = eatery['times'].find(
      (time) => time.start.day == currentDay,
    );
    if (curTime) {
      const startTime = convertToDate(curTime.start);
      const endTime = convertToDate(curTime.end);

      // when open
      if (now >= startTime && now <= endTime) {
        // see if more than an hour until closing
        const hourDif = getHourDif(now, endTime);

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
        const nextOpenTime = getNextOpenTime(eatery, startTime);
        const hourDif = getHourDif(now, nextOpenTime);

        if (hourDif > 1) {
          ans.locationState = 'OPENS_SOON';
          ans.statusMsg = `Open (${Math.round(hourDif)} hours until open)`;
        } else {
          ans.locationState = 'OPENS_SOON';
          ans.statusMsg = `Close (${Math.round(hourDif * 60)} minutes until open)`;
        }
      }
    }
  };

  const parseEatery = (eatery: any): EateryData => {
    const ans: Partial<EateryData> = {};
    ans.name = eatery.name;
    ans.url = eatery.url;
    ans.shortDescription = eatery.shortDescription;

    if (eatery.times.length == 0) {
      ans.locationState = 'CLOSED_LONG_TERM';
    }

    getStatusMsgAndLocationState(eatery, ans);

    return ans as EateryData;
  };

  console.log(cmueatsData.map((eatery: any) => parseEatery(eatery)));

  //   console.log(
  //     cmueatsData.slice(20, 21).map((eatery: any) => parseEatery(eatery)),
  //   );

  //   console.log(
  //     cmueatsData.slice(23, 24).map((eatery: any) => parseEatery(eatery)),
  //   );
};

getEateryData();
// console.log(await getEateryData());
