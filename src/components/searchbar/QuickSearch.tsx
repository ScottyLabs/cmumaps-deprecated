import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

import React, { ReactElement } from 'react';

import CollapsibleWrapper from './CollapsibleWrapper';
import classesIcon from '/public/assets/icons/quick_search/classes.svg';
import foodIcon from '/public/assets/icons/quick_search/food.svg';
import restroomIcon from '/public/assets/icons/quick_search/restroom.svg';
import studyIcon from '/public/assets/icons/quick_search/study.svg';

export interface QuickSearchProps {
  setQuery: (q: string) => void;
}

/**
 * Displays the search results.
 */
export default function QuickSearch({
  setQuery,
}: QuickSearchProps): ReactElement {
  const renderIconHelper = (
    name: string,
    icon: StaticImport,
    queryText: string,
    backgroundColorClass: string,
  ) => {
    return (
      <div
        onClick={() => setQuery(queryText)}
        className="flex flex-col items-center gap-1 p-2"
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${backgroundColorClass}`}
        >
          <Image alt={name + ' icon'} src={icon} className="h-8 w-8"></Image>
        </div>
        <p className="text-sm text-[#8e8e8e]">{name}</p>
      </div>
    );
  };

  return (
    <CollapsibleWrapper title="Quick Search">
      <div className="mx-2.5 mb-3 grid grid-cols-4 gap-2 rounded-xl border bg-white p-2">
        {renderIconHelper('Restroom', restroomIcon, 'Restroom', 'bg-[#EFB1F4]')}
        {renderIconHelper('Study', studyIcon, 'Study', 'bg-[#A6E08B]')}
        {renderIconHelper('Food', foodIcon, 'Dining', 'bg-[#FFBD59]')}
        {renderIconHelper('Classes', classesIcon, 'Classes', 'bg-[#C41230]')}
      </div>
    </CollapsibleWrapper>
  );
}
