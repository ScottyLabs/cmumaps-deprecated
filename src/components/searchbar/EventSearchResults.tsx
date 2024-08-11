import eventIcon from '@icons/quick_search/event.svg';
import { Event } from '@prisma/client';
import Image from 'next/image';

import React from 'react';

import { formatDbDate } from '@/util/dbTime';

import NoResultDisplay from './NoResultDisplay';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  searchResult: Event[];
}

const EventSearchResults = ({ searchResult }: Props) => {
  if (searchResult.length == 0) {
    return <NoResultDisplay />;
  }

  return searchResult.map((event) => {
    console.log(event);
    return (
      <SearchResultWrapper
        key={event.id}
        handleClick={() => {
          console.log('Not Implemented');
        }}
      >
        <div className="flex gap-2 text-left">
          <div className="invert">
            <Image alt={'Event Icon'} src={eventIcon} className="h-8 w-8" />
          </div>
          <div className="truncate">
            <p>{event.name}</p>
            <p>
              {formatDbDate(event.startTime, false)}-
              {formatDbDate(event.endTime, false)}
            </p>
          </div>
        </div>
      </SearchResultWrapper>
    );
  });
};

export default EventSearchResults;
