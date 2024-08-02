import React, { ReactElement, useState } from 'react';
import Image from 'next/image';
import studyIcon from '/public/assets/icons/quick_search/study.svg';
import foodIcon from '/public/assets/icons/quick_search/food.svg';
import restroomIcon from '/public/assets/icons/quick_search/restroom.svg';

import fountainIcon from '/public/assets/icons/water.svg';

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
          <div className="mt-3 flex flex-row items-center justify-between rounded bg-white px-2.5 py-2">
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
    <CollapsibleSearch title="Quick Search">
      <div className="mx-2.5 mb-3 grid grid-cols-4 gap-2 rounded-xl border bg-white p-2">
        {renderHelper('Restroom', restroomIcon, 'Restroom', 'bg-[#EFB1F4]')}
        {renderHelper('Study', studyIcon, 'Study', 'bg-[#A6E08B]')}
        {renderHelper('Food', foodIcon, 'Dining', 'bg-[#FFBD59]')}
        {renderHelper('Classes', fountainIcon, 'Fountain', 'bg-[#52a2ff]')}
      </div>
    </CollapsibleSearch>
  );
}
