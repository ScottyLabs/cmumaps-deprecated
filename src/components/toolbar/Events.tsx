import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns';
import { useRouter } from 'next/navigation';

import React, { useEffect, useMemo, useState } from 'react';
import Collapsible from 'react-collapsible';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { toast } from 'react-toastify';

import { useAppSelector } from '@/lib/hooks';

import CollapsibleWrapper from '../common/CollapsibleWrapper';

interface EventInfo {
  name: string;
  location: string;
  time: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subEvents?: any[];
  roomName?: string;
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

const Events = () => {
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

  const searchMap = useAppSelector((state) => state.data.searchMap);

  const [eventData, setEventData] = useState<Record<
    string,
    EventInfo[]
  > | null>(null);

  const [showTransferStudentEvents, setShowTransferStudentEvents] =
    useState<boolean>(false);

  // load data
  useEffect(() => {
    fetch('/json/O-week.json').then((response) =>
      response.json().then((data) => {
        setEventData(data);
      }),
    );
  }, []);

  const handleClick = (room: string) => {
    const roomInfoArr = room.split(' ');

    const buildingCode = roomInfoArr[0];
    const roomName = roomInfoArr[1];
    const floorLevel = roomName.charAt(0);

    const selectedRoom = searchMap[buildingCode][floorLevel].find(
      (room) => room.name == roomName,
    );

    router.push(`${buildingCode}-${floorLevel}/${selectedRoom.id}`);
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
            {eventInfo.subEvents.map((subEvent) => {
              return (
                <button
                  key={subEvent.subGroup}
                  className="w-full border p-1 text-left transition-colors duration-100 hover:bg-gray-200"
                  onClick={() => {
                    handleClick(subEvent.roomName);
                  }}
                >
                  <p className="text-gray-700">{subEvent.subGroup}</p>
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
            className="mx-2 flex justify-between rounded border border-gray-300 bg-white text-left transition-colors duration-100 hover:bg-gray-200"
          >
            <button
              className="w-full p-2 text-left"
              onClick={() => {
                if (eventInfo.roomName) {
                  handleClick(eventInfo.roomName);
                } else {
                  toast.error("This event doesn't have a location!");
                }
              }}
            >
              <h3 className="text-gray-800">{eventInfo.name}</h3>
              <p>{eventInfo.time}</p>
              <p className="text-wrap">{eventInfo.location}</p>
            </button>
          </div>
        );
      }
    };

    if (eventData) {
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
    } else {
      return <p>Loading...</p>;
    }
  };

  return (
    <CollapsibleWrapper title="Orientation Events">
      <>
        <TransferStudentToggle
          showTransferStudentEvents={showTransferStudentEvents}
          setShowTransferStudentEvents={setShowTransferStudentEvents}
        />
        {renderDatePicker()}
        {renderEvents()}
      </>
    </CollapsibleWrapper>
  );
};

export default Events;
