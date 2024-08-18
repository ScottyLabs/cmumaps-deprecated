import eventIcon from '@icons/quick_search/event.svg';
import { Event } from '@prisma/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { searchEvents } from '@/lib/apiRoutes';
import { useAppSelector } from '@/lib/hooks';

import KeepTypingDisplay from '../display_helpers/KeepTypingDisplay';
import LoadingDisplay from '../display_helpers/LoadingDisplay';
import NoResultDisplay from '../display_helpers/NoResultDisplay';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  query: string;
}

const EventSearchResults = ({ query }: Props) => {
  const router = useRouter();

  const searchMap = useAppSelector((state) => state.data.searchMap);

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

  const formatDbDateEvent = (start: Date, end: Date) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const date = startDate.toDateString();

    const getTime = (date: Date): string => {
      const startHour = date.getUTCHours().toString().padStart(2, '0');
      const startMinute = date.getUTCMinutes().toString().padStart(2, '0');
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
    const handleClick = (room: string) => () => {
      const roomInfoArr = room.split(' ');

      if (roomInfoArr.length > 2) {
        toast.error('Weirdly formatted room name!');
        return;
      }

      const buildingCode = roomInfoArr[0];
      const roomName = roomInfoArr[1];
      const floorLevel = roomName.charAt(0);

      const buildingMap = searchMap[buildingCode];

      if (!buildingMap) {
        if (buildingCode == 'DNM') {
          toast.error('This class do not meet!');
        } else {
          toast.error('Building not available!');
        }
        return;
      }

      if (!buildingMap[floorLevel]) {
        toast.error('Floor not available!');
      } else {
        const floorMap = buildingMap[floorLevel];
        const selectedRoom = floorMap.find((room) => room.name == roomName);

        if (!selectedRoom) {
          toast.error('Room not available!');
        } else {
          router.push(`${buildingCode}-${floorLevel}/${selectedRoom.id}`);
        }
      }
    };

    return (
      <SearchResultWrapper
        key={event.id}
        handleClick={handleClick(event.roomName)}
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
