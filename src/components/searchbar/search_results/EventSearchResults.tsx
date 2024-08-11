import eventIcon from '@icons/quick_search/event.svg';
import { Event } from '@prisma/client';
import Image from 'next/image';

import React, { useEffect, useState } from 'react';

import { searchEvents } from '@/lib/apiRoutes';

import KeepTypingDisplay from '../display_helpers/KeepTypingDisplay';
import LoadingDisplay from '../display_helpers/LoadingDisplay';
import NoResultDisplay from '../display_helpers/NoResultDisplay';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  query: string;
}

const EventSearchResults = ({ query }: Props) => {
  const [searchResult, setSearchResults] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      if (query.length > 0) {
        setIsLoading(true);
        searchEvents(query).then((result) => {
          setIsLoading(false);
          setSearchResults(result);
        });
      } else {
        setSearchResults([]);
      }
    }, 500);
  }, [query]);

  if (isLoading) {
    return <LoadingDisplay />;
  }

  if (query.length == 0) {
    return <KeepTypingDisplay />;
  }

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
