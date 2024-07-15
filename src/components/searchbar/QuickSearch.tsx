import React, { ReactElement, useState } from 'react';
import Image from 'next/image';
import toiletIcon from '/public/assets/icons/toilet.svg';
import coffeeIcon from '/public/assets/icons/coffee.svg';
import fountainIcon from '/public/assets/icons/water.svg';
import foodIcon from '/public/assets/icons/forkknife.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Collapsible from 'react-collapsible';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
export interface QuickSearchProps {
  setQuery: (q: string) => void;
}

/**
 * Displays the search results.
 */
export default function QuickSearch({
  setQuery,
}: QuickSearchProps): ReactElement {
  interface CollapsibleSearchProps {
    title: string;
    children: React.ReactElement;
  }

  const CollapsibleSearch = ({ title, children }: CollapsibleSearchProps) => {
    const [open, setOpen] = useState(false);
    return (
      <Collapsible
        trigger={
          <div className="flex flex-row items-center justify-between px-2.5 py-2">
            <p className="m-0 font-bold text-black">{title}</p>
            <div>
              {!open ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronUpIcon className="h-4 w-4" />
              )}
            </div>
          </div>
        }
        className="rounded-xl bg-white"
        openedClassName="rounded-xl bg-white"
        onOpening={() => {
          setOpen(true);
        }}
        onClosing={() => {
          setOpen(false);
        }}
        transitionTime={200}
        easing="ease-in-out"
      >
        {children}
      </Collapsible>
    );
  };

  const renderHelper = (
    name: string,
    icon: StaticImport,
    queryText: string,
    color: string,
  ) => {
    return (
      <div
        onClick={() => setQuery(queryText)}
        className="flex w-full flex-col items-center gap-1 rounded-xl p-2"
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: color }}
        >
          <Image alt={name + ' icon'} src={icon} className="h-8 w-8"></Image>
        </div>
        <p className="m-0 text-sm font-normal text-[#8e8e8e]">{name}</p>
      </div>
    );
  };

  return (
    <CollapsibleSearch title="Quick Search">
      <div className="w-var(--search-width-desktop) mx-2.5 mb-3 grid grid-cols-4 gap-2 rounded-xl border border-[#dddddd] bg-white p-2">
        {renderHelper('Restroom', toiletIcon, 'Restroom', '#efb1f4')}
        {renderHelper('Coffee', coffeeIcon, 'Cafes', '#ffd66b')}
        {renderHelper('Food', foodIcon, 'Dining', '#ffbd59')}
        {renderHelper('Fountain', fountainIcon, 'Fountain', '#52a2ff')}
      </div>
    </CollapsibleSearch>
  );
}
