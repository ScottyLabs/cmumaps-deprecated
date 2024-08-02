import clsx from 'clsx';

import React, { useEffect, useState } from 'react';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import { FaArrowUp } from 'react-icons/fa';
import { FaArrowDown } from 'react-icons/fa';

import { setFocusedFloor } from '@/lib/features/uiSlice';
import { useAppDispatch } from '@/lib/hooks';
import styles from '@/styles/FloorSwitcher.module.css';
import { Building, Floor } from '@/types';

import Roundel from '../shared/Roundel';

interface FloorSwitcherProps {
  building: Building;
  focusedFloor: Floor;
}

/**
 * The interface component allowing an user to see the current building
 * and switch floors.
 */
export default function FloorSwitcher({
  building,
  focusedFloor,
}: FloorSwitcherProps) {
  const [showFloorPicker, setShowFloorPicker] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  // // Hide the floor picker if the building or floor changes
  // useEffect(() => setShowFloorPicker(false), [building]);

  const renderDefaultView = () => {
    const floorLevels = building.floors.map((floor) => floor.level);
    const floorIndex = floorLevels.indexOf(focusedFloor.level);

    const canGoDown = floorIndex > 0;
    const canGoUp = floorIndex < floorLevels.length - 1;

    if (building.floors.length === 0) {
      return (
        <div className="flex items-center">
          <p className="mx-2">{building.name}</p>
          <AiOutlineExclamationCircle size={30} className="mr-2" />
          <p className="p-1">Floor plan not available</p>
        </div>
      );
    }

    return (
      <div className="flex items-stretch">
        <p className="mx-2 flex items-center">{building.name}</p>

        <div className="mr-2 flex items-center border-x border-gray-300 px-2">
          <button
            title="Decrement floor"
            className={canGoDown ? '' : 'text-gray-300'}
            disabled={!canGoDown}
            onClick={() =>
              dispatch(setFocusedFloor(building.floors[floorIndex - 1]))
            }
          >
            <FaArrowDown />
          </button>
        </div>

        <button
          title="Select a floor"
          className={clsx(styles.button)}
          onClick={() => {
            setShowFloorPicker(true);
          }}
          disabled={building.floors.length < 2}
        >
          <div className="px-2 text-center">
            {building.floors[floorIndex].level}
          </div>
          <div className="flex justify-center">
            {building.floors.map((floor: Floor) => (
              <div
                key={floor.level}
                className={
                  'm-[1px] h-1 w-1 rounded-full ' +
                  (floor.level == focusedFloor.level
                    ? 'bg-black'
                    : 'bg-gray-400')
                }
              ></div>
            ))}
          </div>
        </button>

        <div className="ml-2 flex items-center border-l border-gray-300 px-2">
          <button
            title="Increment floor"
            className={canGoUp ? '' : 'text-gray-300'}
            disabled={!canGoUp}
            onClick={() =>
              dispatch(setFocusedFloor(building.floors[floorIndex + 1]))
            }
          >
            <FaArrowUp />
          </button>
        </div>
      </div>
    );
  };

  const renderFloorPicker = () => {
    return (
      <div className="ml-2 flex items-stretch">
        {building.floors.map((floor: Floor) => (
          <div
            key={floor.ordinal}
            className="flex items-center border-l border-gray-300"
          >
            <div
              className={
                'cursor-pointer px-4 ' +
                (floor.ordinal === ordinal ? 'font-bold' : '')
              }
              onClick={() => {
                setShowFloorPicker(false);
                dispatch(setFloorOrdinal(floor.ordinal));
              }}
            >
              {floor.name}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // const wrapper = (children: React.ReactElement) => {
  //   if (isDesktop) {
  //     return (
  //       <div className="fixed bottom-2 left-1/2 z-10 -translate-x-1/2">
  //         {children}
  //       </div>
  //     );
  //   } else {
  //     return (
  //       <div className="fixed bottom-2 left-1/2 z-10 w-full -translate-x-1/2">
  //         {children}
  //       </div>
  //     );
  //   }
  // };

  return (
    <div className="fixed bottom-2 left-1/2 z-10 mx-1 w-full -translate-x-1/2 sm:w-fit">
      <div className="flex items-stretch justify-center rounded bg-white">
        <div className="p-1">
          <Roundel code={building.code} />
        </div>
        {showFloorPicker ? renderFloorPicker() : renderDefaultView()}
      </div>
    </div>
  );
}
