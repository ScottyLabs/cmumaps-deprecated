/* eslint-disable @typescript-eslint/no-explicit-any */
import { EateryData } from '@/types';

export const getEateryData = async (): Promise<EateryData[]> => {
  const res = await fetch('https://dining.apis.scottylabs.org/locations/');
  const cmueatsData = (await res.json())['locations'];

  const parseEatery = (eatery: any): EateryData => {
    const ans: Partial<EateryData> = {};
    ans.name = eatery.name;
    ans.url = eatery.url;
    ans.shortDescription = eatery.shortDescription;
    return ans as EateryData;
  };

  return cmueatsData.map((eatery: any) => parseEatery(eatery));
};
