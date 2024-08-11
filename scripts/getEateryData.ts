/* eslint-disable @typescript-eslint/no-explicit-any */
import { EateryData } from '../src/types';

// Promise<EateryData[]>

export const getEateryData = async () => {
  //   const res = await fetch('https://dining.apis.scottylabs.org/locations/');
  //   const cmueatsData = (await res.json())['locations'];

  const cmueatsData = [
    {
      conceptId: 113,
      name: 'AU BON PAIN AT SKIBO CAFÉ',
      shortDescription:
        'Coffee/tea, espresso, soup, sandwiches/salads, grab-n-go, yogurt parfaits, fruit, snacks',
      description:
        'At Au Bon Pain café bakery, each signature recipe is uniquely crafted. You can enjoy delicious hot or iced coffee and teas, espresso drinks, a variety of cold beverages, soup, a customized made-to-order breakfast or lunch sandwich or salad, or you can grab a pre-made salad, sandwich, wrap, yogurt parfait, fresh fruit or snack. There is always something new to try ... healthy choices, comfort food, indulgent treats … try them all!  Nutritional information can be found at aubonpain.com/nutrition. To place a catering order, please email abpcmu@grcafes.com. For on-campus assistance, call 804-839-6774.',
      url: 'https://apps.studentaffairs.cmu.edu/dining/conceptinfo/Concept/113',
      location: 'Cohon Center, Second floor',
      coordinates: { lat: 40.444107, lng: -79.942206 },
      acceptsOnlineOrders: true,
      times: [
        {
          start: { day: 0, hour: 1, minute: 0 },
          end: { day: 0, hour: 2, minute: 0 },
        },
        {
          start: { day: 1, hour: 8, minute: 0 },
          end: { day: 1, hour: 14, minute: 0 },
        },
        {
          start: { day: 3, hour: 8, minute: 0 },
          end: { day: 3, hour: 14, minute: 0 },
        },
        {
          start: { day: 4, hour: 8, minute: 0 },
          end: { day: 4, hour: 14, minute: 0 },
        },
        {
          start: { day: 5, hour: 8, minute: 0 },
          end: { day: 5, hour: 14, minute: 0 },
        },
        {
          start: { day: 6, hour: 8, minute: 0 },
          end: { day: 6, hour: 15, minute: 0 },
        },
      ],
    },
  ];

  const daysOfWeek = [
    'Sunday', // 0
    'Monday', // 1
    'Tuesday', // 2
    'Wednesday', // 3
    'Thursday', // 4
    'Friday', // 5
    'Saturday', // 6
  ];

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
        const getNextDate = (eatery): Date => {
          // today's session haven't started
          if (now < startTime) {
            return startTime;
          }

          const todayIndex = eatery.times.findIndex(
            (time) => time.start.day == currentDay,
          );

          return convertToDate(
            eatery.times[(todayIndex + 1) % eatery.times.length].start,
          );
        };

        const nextDate = getNextDate(eatery);
        closeHelper(nextDate, ans);
      }
    } else {
      const makeWrapAround = (times) => {
        const firstElement = JSON.parse(JSON.stringify(times[0]));

        // Modify the specified field in the copied element
        firstElement.start.day += 7;
        firstElement.end.day += 7;

        // Push the modified copy to the destination list
        times.push(firstElement);
      };

      makeWrapAround(eatery.times);

      const nextDay = eatery.times.find((time) => time.start.day > currentDay);
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

  console.log(
    cmueatsData.slice(0, 1).map((eatery: any) => parseEatery(eatery)),
  );
};

getEateryData();
