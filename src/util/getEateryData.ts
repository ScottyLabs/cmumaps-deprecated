/* eslint-disable @typescript-eslint/no-explicit-any */
import { EateryData } from '@/types';

export const getEateryData = async (): Promise<EateryData[]> => {
  const res = await fetch('https://dining.apis.scottylabs.org/locations/');
  const cmueatsData = (await res.json())['locations'];

  const currentDate = new Date();

  //   const convertToDate = (time: any){

  //   }

  const getTodayTime = (eatery: any): Date => {
    const currentDay = currentDate.getDay();
    console.log(eatery['times'][currentDay]);
  };

  const parseEatery = (eatery: any): EateryData => {
    const ans: Partial<EateryData> = {};
    ans.name = eatery.name;
    ans.url = eatery.url;
    ans.shortDescription = eatery.shortDescription;

    if (eatery.times.length == 0) {
      ans.locationState = 'CLOSED_LONG_TERM';
    }

    console.log(getTodayTime(eatery));

    return ans as EateryData;
  };

  return cmueatsData.slice(0, 1).map((eatery: any) => parseEatery(eatery));
};
