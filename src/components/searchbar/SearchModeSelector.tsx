import Image from 'next/image';

import React from 'react';

import { setSearchMode } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import {
  SearchMode,
  SearchModeList,
  searchModeToBgColor,
  searchModeToDisplayText,
  searchModeToIcon,
} from './searchMode';

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
        id={searchMode}
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
    <div className="no-scrollbar flex justify-between gap-2 overflow-x-auto rounded bg-white">
      {SearchModeList.map((searchmode) => renderSearchModeHelper(searchmode))}
    </div>
  );
};

export default SearchModeSelector;
