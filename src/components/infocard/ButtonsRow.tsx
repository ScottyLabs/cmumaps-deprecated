import Image from 'next/image';

import React, { ReactElement } from 'react';
import { FaArrowRight } from 'react-icons/fa';

import { setEndRoom, setIsNavOpen } from '@/lib/features/navSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import shareIcon from '/public/assets/icons/infocard/share.svg';

interface Props {
  middleButton: React.JSX.Element;
}

export const renderMiddleButtonHelper = (
  title: string,
  icon: ReactElement,
  url: string,
) => {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <button
        type="button"
        className="flex h-full items-center gap-2 rounded-lg bg-[#1e86ff] px-3 py-1 text-white"
      >
        {icon}
        <p>{title}</p>
      </button>
    </a>
  );
};

const ButtonsRow = ({ middleButton }: Props) => {
  const dispatch = useAppDispatch();
  const room = useAppSelector((state) => state.ui.selectedRoom);

  const renderDirectionButton = () => {
    return (
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg bg-[#56b57b] px-3 py-1 text-white"
        onClick={() => {
          dispatch(setIsNavOpen(true));
          dispatch(setEndRoom(room));
        }}
      >
        <FaArrowRight size={12} />
        <p>Directions</p>
        <p className="ml-1 font-light">5 min</p>
      </button>
    );
  };

  return (
    <div className="mx-3 flex justify-between py-3">
      <div className="flex gap-2.5">
        {renderDirectionButton()}
        {middleButton}
      </div>
      <div>
        <button
          type="button"
          className="flex items-center rounded-full bg-[#b5b5b5] p-1.5"
        >
          <Image alt="Share Icon" src={shareIcon} className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default ButtonsRow;
