import React, { ReactElement, useState } from 'react';
// import { AiOutlineExclamationCircle } from 'react-icons/ai';
import { IoIosArrowUp } from 'react-icons/io';
import { IoIosArrowDown } from 'react-icons/io';

import { getIsCardOpen, setFocusedFloor } from '@/lib/features/uiSlice';
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
  const isCardWrapperCollapsed = useAppSelector(
    (state) => state.ui.isCardWrapperCollapsed,
  );

  if (!buildings) {
    return;
  }

  console.log(focusedFloor, buildings);
  const building = buildings[focusedFloor.buildingCode];

  // don't render the floor switcher if on mobile and the card covers the floor switcher
  if (isMobile && isCardOpen && !isCardWrapperCollapsed) {
    return <></>;
  }

  const renderDefaultView = () => {
    if (building.floors.length === 0 || !focusedFloor) {
      return (
        <div className="flex items-center">
          <p className="mx-2">{building.name}</p>
          {/* <AiOutlineExclamationCircle size={30} className="mr-2" />
          <p className="p-1">Floor plan not available</p> */}
        </div>
      );
    }

    const floorIndex = building.floors.indexOf(focusedFloor.level);

    const canGoDown = floorIndex > 0;
    const canGoUp = floorIndex < building.floors.length - 1;

    const renderDownArrow = () => (
      <div className="mr-2 flex items-center border-x border-gray-300 px-2">
        <button
          title="Decrement floor"
          className={canGoDown ? '' : 'text-gray-300'}
          disabled={!canGoDown}
          onClick={() =>
            dispatch(
              setFocusedFloor({
                buildingCode: building.code,
                level: building.floors[floorIndex - 1],
              }),
            )
          }
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
          disabled={building.floors.length < 2}
        >
          <div className="px-2 text-center">{building.floors[floorIndex]}</div>
          {renderEllipses()}
        </button>
      );
    };

    const renderUpArrow = () => (
      <div className="ml-2 flex items-center border-l border-gray-300 px-2">
        <button
          title="Increment floor"
          className={canGoUp ? '' : 'text-gray-300'}
          disabled={!canGoUp}
          onClick={() =>
            dispatch(
              setFocusedFloor({
                buildingCode: building.code,
                level: building.floors[floorIndex + 1],
              }),
            )
          }
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
    if (isMobile) {
      // different distance from the bottom of the page when on mobile depending on if the card is open
      const bottomClass = isCardOpen ? 'bottom-10' : 'bottom-2';

      return (
        <div
          className={`fixed left-1/2 z-10 w-fit -translate-x-1/2 px-2 ${bottomClass}`}
        >
          <div className="flex items-stretch justify-center rounded bg-white">
            {children}
          </div>
        </div>
      );
    } else {
      return (
        <div className="fixed bottom-2 left-1/2 z-10 w-fit -translate-x-1/2 px-2">
          <div className="flex items-stretch justify-center rounded bg-white">
            {children}
          </div>
        </div>
      );
    }
  };
  return (
    <Wrapper>
      <>
        <div className="p-1">
          <Roundel code={building.code} />
        </div>
        {showFloorPicker ? renderFloorPicker() : renderDefaultView()}
      </>
    </Wrapper>
  );
}
