import Image from 'next/image';

import React from 'react';

import { setSearchMode } from '@/lib/features/uiSlice';
import { useAppDispatch } from '@/lib/hooks';

import CollapsibleWrapper from '../common/CollapsibleWrapper';
import { SearchMode, SearchModeList, searchModeToIcon } from './searchMode';

const searchModeToDisplayText: Partial<Record<SearchMode, string>> = {
  food: 'Food',
  courses: 'Courses',
  events: 'Events',
  restrooms: 'Restrooms',
  study: 'Study',
};

const searchModeToBgColor: Partial<Record<SearchMode, string>> = {
  food: 'bg-[#FFBD59]',
  courses: 'bg-[#C41230]',
  events: 'bg-black',
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
        key={searchMode}
        onClick={() => dispatch(setSearchMode(searchMode))}
        className="flex flex-col items-center gap-1 p-2"
      >
        <div
          className={`flex h-14 w-14 cursor-pointer items-center justify-center rounded-full ${bgColorClass}`}
        >
          <Image alt={displayText + ' icon'} src={icon} className="h-8 w-8" />
        </div>
        <p className="text-sm text-[#8e8e8e]">{displayText}</p>
      </div>
    );
  };

  return (
    <CollapsibleWrapper title="Search Modes">
      <div className="no-scrollbar mx-2.5 mb-3 flex gap-2 overflow-x-auto rounded-xl border p-2">
        {SearchModeList.slice(1).map((searchMode) =>
          renderSearchModeHelper(searchMode),
        )}
      </div>
    </CollapsibleWrapper>
  );
};

export default SearchModeSelector;
