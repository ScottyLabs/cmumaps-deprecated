import React, { ReactElement, useState } from 'react';
// import { AiOutlineExclamationCircle } from 'react-icons/ai';
import { FaArrowUp } from 'react-icons/fa';
import { FaArrowDown } from 'react-icons/fa';

import { getIsCardOpen, setFocusedFloor } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, Floor } from '@/types';

import Roundel from '../shared/Roundel';

interface FloorSwitcherProps {
  building: Building;
  focusedFloor: Floor | null;
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

  const isMobile = useAppSelector((state) => state.ui.isMobile);
  const isCardOpen = useAppSelector((state) => getIsCardOpen(state.ui));
  const isCardWrapperCollapsed = useAppSelector(
    (state) => state.ui.isCardWrapperCollapsed,
  );

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

    const floorLevels = building.floors.map((floor) => floor.level);
    const floorIndex = floorLevels.indexOf(focusedFloor.level);

    const canGoDown = floorIndex > 0;
    const canGoUp = floorIndex < floorLevels.length - 1;

    const renderDownArrow = () => (
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
    );

    const renderFloorLevelCell = () => {
      const renderEllipses = () => (
        <div className="flex justify-center">
          {building.floors.map((floor: Floor) => (
            <div
              key={floor.level}
              className={
                'm-[1px] h-1 w-1 rounded-full ' +
                (floor.level == focusedFloor.level ? 'bg-black' : 'bg-gray-400')
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
          <div className="px-2 text-center">
            {building.floors[floorIndex].level}
          </div>
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
            dispatch(setFocusedFloor(building.floors[floorIndex + 1]))
          }
        >
          <FaArrowUp />
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
        {building.floors.map((floor: Floor) => (
          <div
            key={floor.level}
            className="flex items-center border-l border-gray-300"
          >
            <div
              className={
                'cursor-pointer px-4 ' +
                (floor.level === focusedFloor.level ? 'font-bold' : '')
              }
              onClick={() => {
                setShowFloorPicker(false);
                dispatch(setFocusedFloor(floor));
              }}
            >
              {floor.level}
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
          className={`fixed left-1/2 z-10 px-2 -translate-x-1/2 w-fit ${bottomClass}`}
        >
          <div className="flex items-stretch justify-center rounded bg-white">
            {children}
          </div>
        </div>
      );
    } else {
      return (
        <div className="fixed bottom-2 left-1/2 z-10 px-2 -translate-x-1/2 w-fit">
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
