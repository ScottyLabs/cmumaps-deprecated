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
      <div onClick={() => setQuery(queryText)}>
        <Image alt={name + ' icon'} src={icon} width={100} height={100}></Image>
        {name}
      </div>
    );
  };

  return (
    <div className="flex">
      {renderHelper('Restroom', toiletIcon, 'Restroom')}
      {renderHelper('Coffee', coffeeIcon, 'Cafes')}
      {renderHelper('Food', foodIcon, 'Dining')}
      {renderHelper('Foutain', fountainIcon, 'Fountain')}
    </div>
  );
}
