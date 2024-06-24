import React, { useState, useEffect, ReactElement } from 'react';
import Image from 'next/image';
import styles from '@/styles/QuickSearch.module.css';
import coffeeIcon from '/public/assets/icons/coffee.svg';
import toiletIcon from '/public/assets/icons/toilet.svg';
import fountainIcon from '/public/assets/icons/water.svg';
import foodIcon from '/public/assets/icons/forkknife.svg';

export interface QuickSearchProps {
  setQuery: (q: string) => void;
}

/**
 * Displays the search results.
 */
export default function QuickSearch({
  setQuery,
}: QuickSearchProps): ReactElement {
  return (
    <div className="h-[275px] w-[100%]">
      <div className="relative h-[275px]">
        <div className="absolute left-0 top-0 h-[275px] w-[100%] rounded-[20px] bg-[#8e8e8e]" />
        <p className="absolute left-[10px] top-[165px] w-[100%] text-[16px] font-bold leading-[normal] tracking-[0] text-white [font-family:'Inter-Bold',Helvetica]">
          Events (as of now 3:00PM EST Sat Mar 23)
        </p>
        <div className="absolute left-[8px] top-[12px] h-[140px] w-[100%]">
          <div className="absolute left-[2px] top-0 w-[100%] text-[16px] font-bold leading-[normal] tracking-[0] text-white [font-family:'Inter-Bold',Helvetica]">
            Quick Search
          </div>
          <div className="absolute left-0 top-[30px] h-[110px] w-[95%] rounded-[9.71px] bg-[#b1b1b1]">
            <div
              className="absolute left-[6px] top-[10px] h-[90px] w-[22%]"
              onClick={() => setQuery('Restroom')}
            >
              <div className="relative h-[90px] w-[100%] rounded-[9.29px] bg-[#e0e0e0]">
                <p className="absolute left-[9px] top-[3px] w-[22%] text-[13px] font-normal leading-[normal] tracking-[0] text-[#545454] [font-family:'Inter-Bold',Helvetica]">
                  <span className="font-bold">Restroom</span>
                  <span className="text-[14.9px] [font-family:'Inter-Regular',Helvetica]">
                    &nbsp;
                  </span>
                </p>
                <div className="absolute left-[10px] top-[23px] h-[61px] w-[60px] rounded-[30.23px/30.25px] bg-white" />
                <Image
                  className="absolute left-[20px] top-[32px] h-[50hu] w-[50%] object-cover"
                  alt="Toilet"
                  src={toiletIcon}
                  width={100}
                  height={100}
                ></Image>
              </div>
            </div>
            <div
              className="absolute left-[94px] top-[10px] h-[90px] w-[22%]"
              onClick={() => setQuery('Cafes')}
            >
              <div className="relative h-[90px] w-[100%] rounded-[9.29px] bg-[#e0e0e0]">
                <div className="absolute left-[9px] top-[3px] w-[22%] text-center text-[13px] font-bold leading-[normal] tracking-[0] text-[#545454] [font-family:'Inter-Bold',Helvetica]">
                  Coffee
                </div>
                <div className="absolute left-[10px] top-[23px] h-[61px] w-[60px] rounded-[30.23px/30.25px] bg-white" />
                <Image
                  className="absolute left-[12px] top-[23px] h-[58px] w-[58px] object-cover"
                  alt="Coffee"
                  src={coffeeIcon}
                  width={100}
                  height={100}
                ></Image>
              </div>
            </div>
            <div
              className="absolute left-[182px] top-[10px] h-[90px] w-[22%]"
              onClick={() => setQuery('Dining')}
            >
              <div className="relative h-[90px] w-[100%] rounded-[9.29px] bg-[#e0e0e0]">
                <div className="absolute left-[9px] top-[3px] w-[22%] text-center text-[13px] font-bold leading-[normal] tracking-[0] text-[#545454] [font-family:'Inter-Bold',Helvetica]">
                  Food
                </div>
                <div className="absolute left-[10px] top-[23px] h-[61px] w-[60px] rounded-[30.23px/30.25px] bg-white" />
                <Image
                  className="absolute left-[24px] top-[30px] h-[46px] w-[32px] object-cover"
                  alt="Food"
                  src={foodIcon}
                  width={100}
                  height={100}
                ></Image>
              </div>
            </div>
            <div
              className="absolute left-[270px] top-[10px] h-[90px] w-[22%]"
              onClick={() => setQuery('restroom')}
            >
              <div className="relative h-[90px] w-[100%] rounded-[9.29px] bg-[#e0e0e0]">
                <div className="absolute left-[9px] top-[3px] w-[22%] text-center text-[13px] font-bold leading-[normal] tracking-[0] text-[#545454] [font-family:'Inter-Bold',Helvetica]">
                  Fountain
                </div>
                <div className="absolute left-[10px] top-[23px] h-[61px] w-[60px] rounded-[30.23px/30.25px] bg-white" />
                <Image
                  className="absolute left-[20px] top-[33px] h-[42px] w-[42px] object-cover"
                  alt="Fountain"
                  src={fountainIcon}
                  width={100}
                  height={100}
                ></Image>
              </div>
            </div>
          </div>
          <div className="absolute top-[180px] h-[69px] w-[95%] rounded-[9.82px] bg-[#b1b1b1]" />
        </div>
      </div>
    </div>
  );
}
