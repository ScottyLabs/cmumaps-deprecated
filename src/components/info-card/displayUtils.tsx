import { FaArrowRight } from 'react-icons/fa';
import { MdIosShare } from 'react-icons/md';

export const renderButtonsRowHelper = (middleButton: React.JSX.Element) => {
  return (
    <div className="mx-3 flex justify-between py-3">
      <div className="flex gap-2.5">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-[#56b57b] px-2 py-1 text-white"
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
