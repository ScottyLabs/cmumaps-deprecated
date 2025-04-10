import ScottyLabsFeaturedIcon from '@icons/ScottyLabs-featured.png';
import featuredIcon from '@icons/featured.svg';
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import React, { useEffect, useMemo, useState } from 'react';
import Collapsible from 'react-collapsible';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { toast } from 'react-toastify';

import { useAppSelector } from '@/lib/hooks';

import { zoomOnObject } from '../buildings/mapUtils';
import CollapsibleWrapper from '../common/CollapsibleWrapper';

interface EventInfo {
  name: string;
  location: string;
  time: string;
  subEvents?: EventInfo[];
  room?: string;
  building?: string;
  searchFood?: boolean;
  featured?: boolean;
  ScottyLabs?: boolean;
}

const convertDateToDayName = (date: Date) => {
  return format(date, 'EEEEEEE');
};

const TransferStudentToggle = ({
  showTransferStudentEvents,
  setShowTransferStudentEvents,
}) => {
  return (
    <div className="ml-4 flex items-center gap-2">
      <div
        className={`flex h-6 w-10 cursor-pointer items-center rounded-full ${
          showTransferStudentEvents ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        onClick={() => setShowTransferStudentEvents(!showTransferStudentEvents)}
      >
        <div
          className={`m-1 size-4 rounded-full bg-white shadow duration-200 ease-in ${
            showTransferStudentEvents ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
      <p>Transfer Student Events</p>
    </div>
  );
};

interface Props {
  map: mapkit.Map | null;
}

const Events = ({ map }: Props) => {
  const router = useRouter();

  const today = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const [dayOfWeek, setDayOfWeek] = useState<string>(
    convertDateToDayName(today),
  );

  const daysOfWeek = useMemo(() => {
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

    return eachDayOfInterval({
      start: startOfCurrentWeek,
      end: endOfCurrentWeek,
    });
  }, [today]);

  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);

  const [eventData, setEventData] = useState<Record<
    string,
    EventInfo[]
  > | null>(null);

  const [hasTransferStudentEvents, setHasTransferStudentEvents] =
    useState<boolean>(false);
  const [showTransferStudentEvents, setShowTransferStudentEvents] =
    useState<boolean>(false);

  // load data
  useEffect(() => {
    fetch('/cmumaps-data/O-Week.json').then((response) =>
      response.json().then((data) => {
        setEventData(data);
      }),
    );
  }, []);

  // check if the toggle is needed
  useEffect(() => {
    if (eventData && eventData[dayOfWeek]) {
      const newHasTransferStudentEvents =
        eventData[dayOfWeek].filter((event) =>
          event.name.includes('Transfer Student'),
        ).length > 0;

      if (!newHasTransferStudentEvents) {
        setShowTransferStudentEvents(false);
      }

      setHasTransferStudentEvents(newHasTransferStudentEvents);
    }
  }, [dayOfWeek, eventData]);

  const handleClick = (eventInfo: EventInfo) => () => {
    const building = eventInfo.building;

    if (building) {
      router.push(building);
      return;
    }

    if (eventInfo.location == 'The Cut') {
      if (map) {
        zoomOnObject(map, [
          { latitude: 40.443228550178866, longitude: -79.94351913028393 },
          { latitude: 40.44304699325484, longitude: -79.94263924643847 },
          { latitude: 40.442118474765685, longitude: -79.9429629109336 },
          { latitude: 40.44231994253659, longitude: -79.94387917897825 },
          { latitude: 40.443228550178866, longitude: -79.94351913028393 },
        ]);
      }
      return;
    }

    const room = eventInfo.room;
    if (!room) {
      toast.error("Sorry, we can't find the location for this event :(");
      return;
    }

    const roomInfoArr = room.split(' ');

    const buildingCode = roomInfoArr[0];
    const roomName = roomInfoArr[1];
    const floorLevel = roomName.charAt(0);

    if (!floorPlanMap) {
      return;
    }

    const selectedRoom = Object.values(
      floorPlanMap[buildingCode][floorLevel],
    ).find((room) => room.name == roomName);

    if (selectedRoom) {
      router.push(`${buildingCode}-${selectedRoom.name}`);
    } else {
      toast.error('Unable to find this location :(');
    }
  };

  const renderDatePicker = () => {
    const renderDay = (day: Date) => {
      let classNames = 'w-7 text-sm text-center ';
      if (convertDateToDayName(day) == dayOfWeek) {
        classNames += 'rounded-full bg-black text-white p-1';
      } else if (day.getTime() === today.getTime()) {
        classNames += 'text-blue-500 ';
      }

      return <div className={classNames}>{format(day, 'EEEEEE')}</div>;
    };

    return (
      <div className="sticky top-2 mx-10 mt-2 flex items-center justify-between">
        {daysOfWeek.map((day, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => setDayOfWeek(convertDateToDayName(day))}
          >
            {renderDay(day)}
          </div>
        ))}
      </div>
    );
  };

  const SuperEvent = ({ eventInfo }: { eventInfo: EventInfo }) => {
    const [open, setOpen] = useState<boolean>(false);

    const renderTrigger = () => (
      <div className="rounded">
        <div className="flex items-center justify-between text-gray-800">
          <h3>{eventInfo.name}</h3>
          <div>
            {open ? <IoIosArrowUp size={15} /> : <IoIosArrowDown size={15} />}
          </div>
        </div>
        <p>{eventInfo.time}</p>
        <p
          className={`transition-all duration-700 ease-in-out ${open ? 'text-wrap' : 'truncate'}`}
        >
          {eventInfo.location}
        </p>
      </div>
    );

    return (
      <Collapsible
        open={open}
        trigger={renderTrigger()}
        className="mx-2 rounded border border-gray-300 bg-white p-2"
        openedClassName="mx-2 rounded border border-gray-300 bg-white p-2"
        onTriggerOpening={() => setOpen(true)}
        onOpening={() => setOpen(true)}
        onTriggerClosing={() => setOpen(false)}
        onClosing={() => {
          setOpen(false);
        }}
        easing="ease-in-out"
        transitionTime={200}
      >
        <div>
          <div className="my-2 space-y-2">
            {eventInfo.subEvents &&
              eventInfo.subEvents.map((subEvent) => {
                return (
                  <button
                    key={subEvent.name}
                    className="w-full border p-1 text-left transition-colors duration-100 hover:bg-gray-200"
                    onClick={handleClick(subEvent)}
                  >
                    <p className="text-gray-700">{subEvent.name}</p>
                    <p className="text-gray-500">{subEvent.time}</p>
                    <p className="text-gray-500">{subEvent.location}</p>
                  </button>
                );
              })}
          </div>
        </div>
      </Collapsible>
    );
  };

  const renderEvents = () => {
    const renderEvent = (eventInfo: EventInfo) => {
      // handle show transfer students
      if (showTransferStudentEvents) {
        if (!eventInfo.name.includes('Transfer Student')) {
          return;
        }
      } else {
        if (eventInfo.name.includes('Transfer Student')) {
          return;
        }
      }

      if (eventInfo.subEvents) {
        return <SuperEvent key={eventInfo.name} eventInfo={eventInfo} />;
      } else {
        return (
          <div
            key={eventInfo.name}
            className="mx-2 flex justify-between rounded-xl border border-gray-300 bg-white text-left transition-colors duration-100 hover:bg-gray-200"
          >
            <button
              className="w-full text-left"
              onClick={handleClick(eventInfo)}
            >
              {eventInfo.featured && (
                <div className="relative -mb-1">
                  <Image
                    src={
                      eventInfo.ScottyLabs
                        ? ScottyLabsFeaturedIcon
                        : featuredIcon
                    }
                    alt="Feature Icon"
                  />
                  <p className="absolute bottom-1 left-2 text-white">
                    Featured
                  </p>
                </div>
              )}
              <div className="p-2">
                <h3 className="text-gray-800">{eventInfo.name}</h3>
                <p>{eventInfo.time}</p>
                <p
                  className={`text-wrap ${eventInfo.searchFood ? 'italic' : ''}`}
                >
                  {eventInfo.location}
                </p>
              </div>
            </button>
          </div>
        );
      }
    };

    if (!eventData) {
      return (
        <div className="flex justify-center">
          <h4 className="my-2 italic text-[--color-gray]">Loading...</h4>
        </div>
      );
    } else {
      const dayEvents = eventData[dayOfWeek];
      if (dayEvents) {
        return (
          <div className="mt-2 h-80 space-y-3 overflow-y-scroll bg-gray-100 py-3 text-[--color-gray]">
            {dayEvents.map((eventInfo) => renderEvent(eventInfo))}
          </div>
        );
      } else {
        return (
          <p className="mt-2 flex justify-center bg-gray-100 py-3 italic text-[--color-gray]">
            Coming &lsquo;&lsquo;Tomorrow&rsquo;&rsquo;!
          </p>
        );
      }
    }
  };

  return (
    <CollapsibleWrapper title="Orientation Events">
      <>
        {hasTransferStudentEvents && (
          <TransferStudentToggle
            showTransferStudentEvents={showTransferStudentEvents}
            setShowTransferStudentEvents={setShowTransferStudentEvents}
          />
        )}
        {renderDatePicker()}
        {renderEvents()}
      </>
    </CollapsibleWrapper>
  );
};

export default Events;
