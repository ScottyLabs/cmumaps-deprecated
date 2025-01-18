import lockIcon from '@icons/half-lock.svg';
import Image from 'next/image';

import React, { ReactElement, useState } from 'react';
import { IoIosArrowUp } from 'react-icons/io';
import { IoIosArrowDown } from 'react-icons/io';

import {
  getIsCardOpen,
  selectBuilding,
  setFocusedFloor,
  setIsSearchOpen,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Floor } from '@/types';

import Roundel from '../shared/Roundel';

interface FloorSwitcherProps {
  focusedFloor: Floor;
}

/**
 * The interface component allowing an user to see the current building
 * and switch floors.
 */
export default function FloorSwitcher({ focusedFloor }: FloorSwitcherProps) {
  const [showFloorPicker, setShowFloorPicker] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const isMobile = useAppSelector((state) => state.ui.isMobile);
  const isCardOpen = useAppSelector((state) => getIsCardOpen(state.ui));

  if (!buildings) {
    return;
  }

  const building = buildings[focusedFloor.buildingCode];

  const renderDefaultView = () => {
    if (building.floors.length === 0 || !focusedFloor) {
      return (
        <div className="flex items-center">
          <p className="ml-2 mr-4">{building.name}</p>
          <div className="flex items-center gap-1 rounded-r bg-gray-200 py-2 pr-1">
            <Image alt={'Lock Icon'} src={lockIcon} />
            <p className="gray p-1 text-[#646464]">Inaccessible</p>
          </div>
        </div>
      );
    }

    const floorIndex = building.floors.indexOf(focusedFloor.level);

    const canGoDown = floorIndex > 0;
    const canGoUp = floorIndex < building.floors.length - 1;

    const buttonBaseClasses = 'h-full w-full px-2 flex items-center ';

    const renderDownArrow = () => (
      <div className="border-x border-gray-300">
        <button
          title="Decrement floor"
          className={buttonBaseClasses + (canGoDown ? '' : 'text-gray-300')}
          disabled={!canGoDown}
          onClick={() => {
            dispatch(
              setFocusedFloor({
                buildingCode: building.code,
                level: building.floors[floorIndex - 1],
              }),
            );
          }}
        >
          <IoIosArrowDown />
        </button>
      </div>
    );

    const renderFloorLevelCell = () => {
      const renderEllipses = () => (
        <div className="flex justify-center">
          {building.floors.map((floorLevel) => (
            <div
              key={floorLevel}
              className={
                'm-[1px] h-1 w-1 rounded-full ' +
                (floorLevel == focusedFloor.level ? 'bg-black' : 'bg-gray-400')
              }
            ></div>
          ))}
        </div>
      );

      return (
        <button
          title="Select a floor"
          onClick={() => {
            setShowFloorPicker(true);
          }}
          className="px-2"
          disabled={building.floors.length < 2}
        >
          <div className="text-center">{building.floors[floorIndex]}</div>
          {renderEllipses()}
        </button>
      );
    };

    const renderUpArrow = () => (
      <div className="flex items-center border-l border-gray-300">
        <button
          title="Increment floor"
          className={buttonBaseClasses + (canGoUp ? '' : 'text-gray-300')}
          disabled={!canGoUp}
          onClick={() => {
            dispatch(
              setFocusedFloor({
                buildingCode: building.code,
                level: building.floors[floorIndex + 1],
              }),
            );
          }}
        >
          <IoIosArrowUp />
        </button>
      </div>
    );

    return (
      <div className="flex items-stretch">
        <p className="mx-2 flex items-center text-nowrap">{building.name}</p>
        {renderDownArrow()}
        {renderFloorLevelCell()}
        {renderUpArrow()}
      </div>
    );
  };

  const renderFloorPicker = () => {
    if (!focusedFloor) {
      return;
    }

    return (
      <div className="ml-2 flex items-stretch">
        {building.floors.map((floorLevel) => (
          <div
            key={floorLevel}
            className="flex items-center border-l border-gray-300"
          >
            <div
              className={
                'cursor-pointer px-4 ' +
                (floorLevel === focusedFloor.level ? 'font-bold' : '')
              }
              onClick={() => {
                setShowFloorPicker(false);
                dispatch(
                  setFocusedFloor({
                    buildingCode: building.code,
                    level: floorLevel,
                  }),
                );
              }}
            >
              {floorLevel}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const Wrapper = ({ children }: { children: ReactElement }) => {
    // farther from the bottom of the page when on mobile and the card is open
    const bottomClass = isMobile && isCardOpen ? 'bottom-10' : 'bottom-2';

    return (
      <div
        className={`fixed left-1/2 w-fit -translate-x-1/2 px-2 ${bottomClass}`}
      >
        {children}
      </div>
    );
  };

  return (
    <Wrapper>
      <div className="btn-shadow flex items-stretch justify-center rounded bg-white">
        <button
          className="p-1"
          onClick={() => {
            dispatch(selectBuilding(building));
            dispatch(setIsSearchOpen(false));
          }}
        >
          <Roundel code={building.code} />
        </button>
        {showFloorPicker ? renderFloorPicker() : renderDefaultView()}
      </div>
    </Wrapper>
  );
}
