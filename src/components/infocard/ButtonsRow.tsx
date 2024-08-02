import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { MdIosShare } from 'react-icons/md';

import {
  setEndRoom,
  setIsNavOpen,
  setStartRoom,
} from '@/lib/features/navSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

interface Props {
  middleButton: React.JSX.Element;
}

const ButtonsRow = ({ middleButton }: Props) => {
  const dispatch = useAppDispatch();
  const room = useAppSelector((state) => state.ui.selectedRoom);

  return (
    <div className="mx-3 flex justify-between py-3">
      <div className="flex gap-2.5">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-[#56b57b] px-2 py-1 text-white"
          onClick={() => {
            dispatch(setIsNavOpen(true));
            dispatch(setEndRoom(room));
          }}
        >
          <FaArrowRight size={12} />
          <p className="text-xs">Directions</p>
          <p className="ml-1 text-xs font-light">5 min</p>
        </button>
        {middleButton}
      </div>
      <div>
        <button type="button" className="rounded-full bg-[#b5b5b5] p-1">
          <MdIosShare size={20} />
        </button>
      </div>
    </div>
  );
};

export default ButtonsRow;
