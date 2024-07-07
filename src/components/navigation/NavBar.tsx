import { Room } from '@/types';
import React, { ReactElement } from 'react';
import shareIcon from '/public/assets/icons/icon-share-one.svg';
import navIcon from '/public/assets/icons/icon-navigation.svg';
import Image from 'next/image';
import { useAppDispatch } from '@/lib/hooks';
import { setEndRoom } from '@/lib/features/ui/navSlice';

export interface NavBarProps {
  room: Room;
  setIsNavOpen: (n: boolean) => void;
}
/**
 * Displays the search results.
 */
export default function NavBar({
  room,
  setIsNavOpen,
}: NavBarProps): ReactElement {
  const dispatch = useAppDispatch();

  return (
    <div className="bg-collection-1-background relative m-[1.25%] h-[78px] w-[355px] w-[97.5%] rounded-[8px] opacity-80">
      <div className="absolute left-0 top-0 h-[78px] w-[100%] rounded-[8px]">
        <div className="absolute left-[50%] m-1 h-[70px] w-[48%]">
          <div className="bg-collection-1-padding relative h-[70px] w-[100%] rounded-[12px]">
            <Image
              onClick={() => {
                console.log(room);
                dispatch(setEndRoom(room));
                setIsNavOpen(true);
              }}
              height={66}
              width={66}
              className="absolute left-[95px] top-[2px] h-[66px] w-[66px]"
              alt="Icon navigation"
              src={navIcon}
            />
            <div className="absolute left-[4px] top-[7px] w-[77px] text-right text-[22px] font-normal leading-[normal] tracking-[0] text-black [font-family:'Inria_Sans-Regular',Helvetica]">
              0.5 mi.
              <br />5 mins
            </div>
          </div>
        </div>
        <div className="bg-collection-1-padding pointer-events-auto absolute m-1 h-[70px] w-[70px] rounded-[12px]">
          <Image
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            height={66}
            width={66}
            className="absolute m-[2px] h-[66px] w-[65px]"
            alt="Icon share"
            src={shareIcon}
          />
        </div>
      </div>
    </div>
  );
}
