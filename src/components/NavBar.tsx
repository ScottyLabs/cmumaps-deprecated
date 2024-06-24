import { Room } from "@/types";
import React, { ReactElement } from "react";
import shareIcon from "/public/assets/icons/icon-share-one.svg"
import navIcon from "/public/assets/icons/icon-navigation.svg"
import Image from 'next/image'

export interface NavBarProps {
    room: Room,
    setIsNavOpen: (n: boolean) => void,
    setNavSRoom: (n: Room) => void,
    setNavERoom:(n: Room) => void,
  }
/**
 * Displays the search results.
 */
export default function NavBar({room, setIsNavOpen, setNavSRoom, setNavERoom }: NavBarProps):ReactElement {
    return (
        <div className="opacity-80 m-[1.25%] w-[97.5%] h-[78px] bg-collection-1-background rounded-[8px] relative w-[355px]">
            <div className="absolute w-[100%] h-[78px] top-0 left-0  rounded-[8px]">
                <div className="absolute m-1 w-[48%] h-[70px] left-[50%]">
                    <div className="relative w-[100%] h-[70px] bg-collection-1-padding rounded-[12px]">
                        <Image
                            onClick={()=>{setNavERoom(room); setIsNavOpen(true)}}
                            height={66}
                            width={66}
                            className="absolute w-[66px] h-[66px] top-[2px] left-[95px]"
                            alt="Icon navigation"
                            src={navIcon}
                        />
                        <div className="absolute w-[77px] top-[7px] left-[4px] [font-family:'Inria_Sans-Regular',Helvetica] font-normal text-black text-[22px] text-right tracking-[0] leading-[normal]">
                            0.5 mi.
                            <br />5 mins
                        </div>
                    </div>
                </div>
                <div className="pointer-events-auto absolute w-[70px] h-[70px] m-1 bg-collection-1-padding rounded-[12px]">
                    <Image
                        onClick={()=>{navigator.clipboard.writeText(window.location.href);}}
                        height={66}
                        width={66}
                        className="absolute m-[2px] w-[65px] h-[66px]"
                        alt="Icon share"
                        src={shareIcon}
                    />
                </div>
            </div>
        </div>
    );
};
