import React, { ReactElement } from 'react';
import styles from '@/styles/InfoCard.module.css';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setRecommendedPath } from '@/lib/redux/navSlice';

/**
 * Displays the search results.
 */
export default function NavCard(): ReactElement {
  const dispatch = useAppDispatch();

  const startRoom = useAppSelector((state) => state.ui.selectedRoom);
  const endRoom = useAppSelector((state) => state.nav.endRoom);

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
                  id="startRoom"
                  className="pointer-events-auto rounded-sm bg-transparent outline focus:rounded-sm focus:outline-4"
                  value={startRoom?.id}
                  readOnly={true}
                ></input>
              </p>
            </div>
            <div className="relative w-60 pl-2">
              <p>
                End:{' '}
                <input
                  id="endRoom"
                  className="pointer-events-auto rounded-sm bg-transparent outline focus:rounded-sm focus:outline-4"
                  value={endRoom?.id}
                  readOnly={true}
                ></input>
              </p>
            </div>
          </div>
          <div className="absolute left-[250px] h-[95%] w-[25%] bg-opacity-20">
            <div className="absolute left-0 top-0 m-1 h-[95%] w-[100%] rounded-[15px] bg-[#e0e0e0]">
              <div
                className="pointer-events-auto absolute left-[25%] top-[25%] w-[100%] whitespace-nowrap text-[32px] font-bold leading-[normal] tracking-[0] text-[#1e1e1e] [font-family:'Open_Sans-Bold',Helvetica]"
                onClick={() => {
                  const sRoomInput = document.getElementById(
                    'startRoom',
                  ) as HTMLInputElement; // Allow the user to type in id of the room
                  const eRoomInput = document.getElementById(
                    'endRoom',
                  ) as HTMLInputElement;
                  fetch('/api/findPath', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      rooms: [sRoomInput.value, eRoomInput.value],
                    }),
                  })
                    .then((r) => r.json())
                    .then((j) => {
                      if (j.error) {
                        console.error(j.error);
                        return;
                      }
                      dispatch(setRecommendedPath(j));
                    });
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
