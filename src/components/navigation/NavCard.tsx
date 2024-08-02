import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  setIsNavOpen,
  setRecommendedPath,
  setStartRoom,
} from '@/lib/features/navSlice';
import CardWrapper from '../infocard/CardWrapper';
import { IoIosArrowBack } from 'react-icons/io';

/**
 * Displays the search results.
 */
export default function NavCard(): ReactElement {
  const dispatch = useAppDispatch();

  const startRoom = useAppSelector((state) => state.ui.selectedRoom);
  const endRoom = useAppSelector((state) => state.nav.endRoom);
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
  }, [startRoom, endRoom]);
  return (
    <CardWrapper snapPoint={0.5}>
      <div>
        <div className="my-2 flex gap-1">
          <IoIosArrowBack
            size={20}
            className="cursor-pointer"
            onClick={() => dispatch(setIsNavOpen(false))}
          />
          <h1 className="font-bold">Navigation</h1>
        </div>
        <div className="mb-2 ml-4 space-y-2">
          <div>
            <input
              className="w-fit border"
              placeholder="Choose your starting location..."
              value={startRoom?.name}
            />
          </div>
          <div>
            <input
              className="w-fit border"
              placeholder="Desination"
              value={endRoom?.name}
            />
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
