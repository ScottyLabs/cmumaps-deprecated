import Image from 'next/image';

import React, { ReactElement, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';

import {
  setEndRoom,
  setIsNavOpen,
  setStartRoom,
} from '@/lib/features/navSlice';
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
          if (room) {
            dispatch(setIsNavOpen(true));
            dispatch(setStartRoom(null));
            dispatch(setEndRoom(room));
          } else {
            toast.error("You can't navigate to buildings... yet!");
          }
        }}
      >
        <FaArrowRight size={12} />
        <p>Directions</p>
      </button>
    );
  };

  const ShareButton = () => {
    const [clicked, setClicked] = useState<boolean>(false);

    return (
      <>
        <button
          type="button"
          className={`flex items-center rounded-full p-1.5 ${clicked ? 'bg-green-600' : 'bg-[#b5b5b5]'}`}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setClicked(true);
            toast.success('Link copied!');
          }}
        >
          <Image alt="Share Icon" src={shareIcon} className="size-5" />
        </button>
      </>
    );
  };

  return (
    <div className="mx-3 flex justify-between py-3">
      <div className="flex gap-2.5">
        {renderDirectionButton()}
        {middleButton}
      </div>
      <ShareButton />
    </div>
  );
};

export default ButtonsRow;
