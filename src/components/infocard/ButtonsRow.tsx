import { FaArrowRight } from 'react-icons/fa';
import { MdIosShare } from 'react-icons/md';
import React from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { setIsNavOpen } from '@/lib/features/navSlice';

interface Props {
  middleButton: React.JSX.Element;
}

const ButtonsRow = ({ middleButton }: Props) => {
  const dispatch = useAppDispatch();

  return (
    <div className="mx-3 flex justify-between py-3">
      <div className="flex gap-2.5">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-[#56b57b] px-2 py-1 text-white"
          onClick={() => dispatch(setIsNavOpen(true))}
        >
          <FaArrowRight size={12} />
          <p className="text-xs">Directions</p>
          <p className="ml-1 text-xs font-light">5 min</p>
        </button>
        {middleButton}
      </div>
      <div>
        <button type="button" className="rounded-full bg-[#b5b5b5] p-1">
          <MdIosShare size={15} />
        </button>
      </div>
    </div>
  );
};

export default ButtonsRow;
