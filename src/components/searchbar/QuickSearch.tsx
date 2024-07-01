import React, { ReactElement } from 'react';
import Image from 'next/image';
import toiletIcon from '/public/assets/icons/toilet.svg';
import coffeeIcon from '/public/assets/icons/coffee.svg';
import fountainIcon from '/public/assets/icons/water.svg';
import foodIcon from '/public/assets/icons/forkknife.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
export interface QuickSearchProps {
  setQuery: (q: string) => void;
}

/**
 * Displays the search results.
 */
export default function QuickSearch({
  setQuery,
}: QuickSearchProps): ReactElement {
  const renderHelper = (
    name: string,
    icon: StaticImport,
    queryText: string,
  ) => {
    return (
      <div
        onClick={() => setQuery(queryText)}
        className="flex w-full flex-col items-center rounded-xl bg-[#e1e1e1] px-2 pb-2 pt-0"
      >
        <p className="m-0 font-semibold">{name}</p>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
          <Image alt={name + ' icon'} src={icon} className=""></Image>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-[#8f8f8f] p-2 pb-3">
      <p className="mb-2 font-bold text-white">Quick Search</p>
      <div className="w-var(--search-width-desktop) grid grid-cols-4 gap-2 rounded-xl bg-[#b2b2b2] p-2">
        {renderHelper('Restroom', toiletIcon, 'Restroom')}
        {renderHelper('Coffee', coffeeIcon, 'Cafes')}
        {renderHelper('Food', foodIcon, 'Dining')}
        {renderHelper('Fountain', fountainIcon, 'Fountain')}
      </div>
      <p className="my-2 font-bold text-white">Events</p>
      <div className="h-16 w-full rounded-lg bg-[#b2b2b2]"></div>
    </div>
  );
}
