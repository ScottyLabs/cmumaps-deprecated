import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns';

import React, { useEffect, useMemo, useState } from 'react';
import Collapsible from 'react-collapsible';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

import CollapsibleWrapper from '../common/CollapsibleWrapper';

interface EventInfo {
  name: string;
  location: string;
  time: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subEvents?: any[];
}

const convertDateToDayName = (date: Date) => {
  return format(date, 'EEEEEEE');
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
                className="w-full border p-1 text-left hover:bg-gray-200"
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

const Events = () => {
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

  const [eventData, setEventData] = useState<Record<
    string,
    EventInfo[]
  > | null>(null);

  // load data
  useEffect(() => {
    fetch('/json/O-week.json').then((response) =>
      response.json().then((data) => {
        setEventData(data);
      }),
    );
  }, []);

  const renderDatePicker = () => {
    const renderWeekRow = () => {
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
        <div className="mx-10 mt-2 flex items-center justify-between">
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

    return renderWeekRow();
  };

  const renderEvents = () => {
    const renderEvent = (eventInfo: EventInfo) => {
      if (eventInfo.subEvents) {
        return <SuperEvent eventInfo={eventInfo} />;
      } else {
        return (
          <div
            key={eventInfo.name}
            className="mx-2 flex justify-between rounded border border-gray-300 bg-white text-left hover:bg-gray-200"
          >
            <button className="w-full p-2 text-left">
              <h3 className="text-gray-800">{eventInfo.name}</h3>
              <p>{eventInfo.time}</p>
              <p className="truncate">{eventInfo.location}</p>
            </button>
          </div>
        );
      }
    };

    if (eventData) {
      const dayEvents = eventData[dayOfWeek];
      if (dayEvents) {
        return (
          <div className="mt-2 space-y-3 bg-gray-100 py-3 text-[--color-gray]">
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
        {renderDatePicker()}
        {renderEvents()}
      </>
    </CollapsibleWrapper>
  );
};

export default Events;
