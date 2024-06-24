import React, { useMemo, useState, useEffect, ReactElement } from 'react';
import {
  Building,
  Floor,
  FloorMap,
  Room,
} from '@/types';
import styles from '@/styles/InfoCard.module.css';
import clsx from 'clsx';
import g9 from "/public/assets/icons/g9.png";
import Image from 'next/image';
import { Door } from '@/pages/api/findPath';


export interface NavCardProps {
    sroom: Room;
    eroom: Room
    setRecommendedPath: (n:Door[])=>void
}

/**
 * Displays the search results.
 */
export default function NavCard({
    sroom, eroom, setRecommendedPath
}: NavCardProps):ReactElement {

  return (
    <div
      id = "thisthing2"
      className={clsx(
        styles['info-card'],
        styles['info-card-open'],
      )}>
        <div className="relative bg-opacity-20 backdrop-blur-sm relative w-[100%] p-2 max-h-[800px] bg-[#929292] rounded-[8px]">
          <h1>Directions</h1>
          <div className="opacity-80 relative m-[1.25%] w-[97.5%] h-[90px] bg-[#b1b1b1] rounded-[8px]">
            <div className="absolute mt-1 mb-1 opacity-90 w-60">
                <div className='w-60 relative pl-2 pt-2'>
                    <p>Start: <input className="bg-transparent focus:outline-4 focus:rounded-sm outline rounded-sm" value={sroom?.id}></input></p>
                </div>
                <div className='w-60 relative pl-2 '>
                    <p>End:   <input className="bg-transparent focus:outline-4 focus:rounded-sm outline rounded-sm" value={eroom?.id}></input></p>
                </div>
            </div>
            <div className="bg-opacity-20 absolute w-[25%] h-[95%] left-[250px]">
                <div className="absolute w-[100%] h-[95%] m-1 top-0 left-0 bg-[#e0e0e0] rounded-[15px]" >
                <div className="pointer-events-auto absolute w-[100%] top-[25%] left-[25%] [font-family:'Open_Sans-Bold',Helvetica] font-bold text-[#1e1e1e] text-[32px] tracking-[0] leading-[normal] whitespace-nowrap" onClick={()=>{
                    fetch('/api/findPath', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ rooms: [sroom.id, eroom.id] }),
                      }).then((r) => r.json()).then((j) => setRecommendedPath(j));
                    }}>
                    GO
                </div>
              </div>
            </div>
        </div>
        </div>
        </div>
  );
}
