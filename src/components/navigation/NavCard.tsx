import React, { useMemo, useState, useEffect, ReactElement } from 'react';
import { Building, Floor, FloorMap, Room } from '@/types';
import styles from '@/styles/InfoCard.module.css';
import clsx from 'clsx';
import g9 from '/public/assets/icons/g9.png';
import Image from 'next/image';
import { Door } from '@/pages/api/findPath';

export interface NavCardProps {
  sroom: Room;
  eroom: Room;
  setRecommendedPath: (n: Door[]) => void;
}

/**
 * Displays the search results.
 */
export default function NavCard({
  sroom,
  eroom,
  setRecommendedPath,
}: NavCardProps): ReactElement {
  return (
    <div
      id="thisthing2"
      className={clsx(styles['info-card'], styles['info-card-open'])}
    >
      <div className="relative max-h-[800px] w-[100%] rounded-[8px] bg-[#929292] bg-opacity-20 p-2 backdrop-blur-sm">
        <h1>Directions</h1>
        <div className="relative m-[1.25%] h-[90px] w-[97.5%] rounded-[8px] bg-[#b1b1b1] opacity-80">
          <div className="absolute mb-1 mt-1 w-60 opacity-90">
            <div className="relative w-60 pl-2 pt-2">
              <p>
                Start:{' '}
                <input
                  className="rounded-sm bg-transparent outline focus:rounded-sm focus:outline-4"
                  value={sroom?.id}
                ></input>
              </p>
            </div>
            <div className="relative w-60 pl-2">
              <p>
                End:{' '}
                <input
                  className="rounded-sm bg-transparent outline focus:rounded-sm focus:outline-4"
                  value={eroom?.id}
                ></input>
              </p>
            </div>
          </div>
          <div className="absolute left-[250px] h-[95%] w-[25%] bg-opacity-20">
            <div className="absolute left-0 top-0 m-1 h-[95%] w-[100%] rounded-[15px] bg-[#e0e0e0]">
              <div
                className="pointer-events-auto absolute left-[25%] top-[25%] w-[100%] whitespace-nowrap text-[32px] font-bold leading-[normal] tracking-[0] text-[#1e1e1e] [font-family:'Open_Sans-Bold',Helvetica]"
                onClick={() => {
                  fetch('/api/findPath', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rooms: [sroom.id, eroom.id] }),
                  })
                    .then((r) => r.json())
                    .then((j) => setRecommendedPath(j));
                }}
              >
                GO
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
