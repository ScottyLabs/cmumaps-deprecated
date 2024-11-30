import Image from 'next/image';

import React from 'react';

import { setSearchMode } from '@/lib/features/uiSlice';
import { useAppDispatch } from '@/lib/hooks';

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

  const renderSearchModeHelper = (searchMode: SearchMode) => {
    const displayText = searchModeToDisplayText[searchMode];
    const icon = searchModeToIcon[searchMode];
    const bgColorClass = searchModeToBgColor[searchMode];

    if (!icon) {
      return;
    }

    return (
      <div
        id={searchMode}
        key={searchMode}
        onClick={() => dispatch(setSearchMode(searchMode))}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm hover:bg-gray-100"
      >
        <div
          className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full ${bgColorClass}`}
        >
          <Image alt={displayText + ' icon'} src={icon} className="h-4 w-4" />
        </div>
        <p className="text-xs text-[#8e8e8e]">{displayText}</p>
      </div>
    );
  };

  // the default search mode is room, so room shouldn't be displayed
  return (
    <div className="no-scrollbar flex justify-between gap-2 overflow-x-auto">
      {SearchModeList.filter((searchMode) => searchMode !== 'rooms').map(
        (searchmode) => renderSearchModeHelper(searchmode),
      )}
    </div>
  );
};

export default SearchModeSelector;
