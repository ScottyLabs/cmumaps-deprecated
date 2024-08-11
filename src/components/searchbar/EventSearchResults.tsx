import eventIcon from '@icons/quick_search/event.svg';
import { Event } from '@prisma/client';
import Image from 'next/image';

import React from 'react';

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

  const formatDbDateEvent = (start: { $date: Date }, end: { $date: Date }) => {
    const startDate = new Date(start?.$date);
    const endDate = new Date(end?.$date);

    const date = startDate.toDateString();

    const getTime = (date: Date): string => {
      const startHour = date.getHours().toString().padStart(2, '0');
      const startMinute = date.getMinutes().toString().padStart(2, '0');
      return `${startHour}:${startMinute}`;
    };

    const startTime = getTime(startDate);
    const endTime = getTime(endDate);

    return (
      <p>
        {date}, {startTime}-{endTime}
      </p>
    );
  };

  return searchResult.map((event) => {
    return (
      <SearchResultWrapper
        // key={event.id}
        key={event._id.$oid}
        handleClick={() => {
          console.log('Not Implemented');
        }}
      >
        <div className="flex items-center gap-2 py-1 text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300">
            <Image alt={'Event Icon'} src={eventIcon} />
          </div>
          <div className="truncate">
            <p>{event.name}</p>
            {formatDbDateEvent(event.startTime, event.endTime)}
            <p>{event.roomName}</p>
          </div>
        </div>
      </SearchResultWrapper>
    );
  });
};

export default EventSearchResults;
