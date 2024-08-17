import Image from 'next/image';

import React from 'react';

import { setSearchMode } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import { SearchMode, SearchModeList, searchModeToIcon } from './searchMode';

const searchModeToDisplayText: Record<SearchMode, string> = {
  rooms: 'Rooms',
  food: 'Food',
  courses: 'Courses',
  events: 'Events',
  restrooms: 'Restrooms',
  study: 'Study',
};

const searchModeToBgColor: Record<SearchMode, string> = {
  rooms: 'bg-[#636672]',
  food: 'bg-[#FFBD59]',
  courses: 'bg-[#C41230]',
  events: 'bg-[#87BCFB]',
  restrooms: 'bg-[#EFB1F4]',
  study: 'bg-[#A6E08B]',
};

const SearchModeSelector = () => {
  const dispatch = useAppDispatch();
  const selectedSearchMode = useAppSelector((state) => state.ui.searchMode);

  const renderSearchModeHelper = (searchMode: SearchMode) => {
    const displayText = searchModeToDisplayText[searchMode];
    const icon = searchModeToIcon[searchMode];
    const bgColorClass = searchModeToBgColor[searchMode];

    if (!icon) {
      return;
    }

    return (
      <div
        key={searchMode}
        onClick={() => dispatch(setSearchMode(searchMode))}
        className={`flex flex-col items-center gap-1 p-2 ${searchMode == selectedSearchMode ? 'bg-gray-200' : ''}`}
      >
        <div
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ${bgColorClass}`}
        >
          <Image alt={displayText + ' icon'} src={icon} className="h-5 w-5" />
        </div>
        <p className="text-xs text-[#8e8e8e]">{displayText}</p>
      </div>
    );
  };

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto rounded bg-white px-2">
      {SearchModeList.map((searchmode) => renderSearchModeHelper(searchmode))}
    </div>
  );
};

export default SearchModeSelector;
