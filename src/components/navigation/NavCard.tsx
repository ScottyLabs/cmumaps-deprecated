import React, { ReactElement, useEffect } from 'react';
import { IoIosArrowBack } from 'react-icons/io';

import { setIsNavOpen, setRecommendedPath } from '@/lib/features/navSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Room } from '@/types';

import CardWrapper from '../infocard/CardWrapper';

/**
 * Displays the search results.
 */
export default function NavCard(): ReactElement {
  const dispatch = useAppDispatch();

  const startRoom = useAppSelector((state) => state.ui.selectedRoom);
  const endRoom = useAppSelector((state) => state.nav.endRoom);

  // calculate path from start to end
  useEffect(() => {
    fetch('/api/findPath', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rooms: [startRoom, endRoom] }),
    })
      .then((r) => r.json())
      .then((j) => {
        dispatch(setRecommendedPath(j));
      });
  }, [startRoom, endRoom, dispatch]);

  const renderTop = () => {
    return (
      <div className="flex gap-1 py-2">
        <IoIosArrowBack
          size={20}
          className="cursor-pointer text-gray-500"
          onClick={() => dispatch(setIsNavOpen(false))}
        />
        <h1 className="font-bold">Navigation</h1>
      </div>
    );
  };

  const renderRoomInput = (
    startRoom: Room | null,
    placeHolder: string,
    circleColor: string,
  ) => {
    const renderCircle = () => {
      return <div className={`h-5 w-5 rounded-full ${circleColor}`} />;
    };

    const renderText = () => {
      if (startRoom) {
        return <p>{startRoom.name}</p>;
      } else {
        return <p className="text-[gray]">{placeHolder}</p>;
      }
    };

    return (
      <div className="flex w-fit gap-2 border p-1">
        {renderCircle()}
        <button className="w-64 text-left">{renderText()}</button>
      </div>
    );
  };

  const renderStartRoomInput = () => {
    const placeHolder = 'Choose your starting location...';
    const circleColor = 'bg-green-700';

    return renderRoomInput(startRoom, placeHolder, circleColor);
  };

  const renderEndRoomInput = () => {
    const placeHolder = 'Choose your destination...';
    const circleColor = 'bg-red-700';

    return renderRoomInput(endRoom, placeHolder, circleColor);
  };

  return (
    <CardWrapper snapPoint={0.5}>
      <div>
        {renderTop()}
        <div className="space-y-2 pb-2 pl-4">
          {renderStartRoomInput()}
          {renderEndRoomInput()}
        </div>
      </div>
    </CardWrapper>
  );
}
