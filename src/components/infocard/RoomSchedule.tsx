import { Event } from '@prisma/client';
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';

import React, { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { FaChevronRight } from 'react-icons/fa';

import { fetchEvents } from '@/lib/apiRoutes';
import { useAppSelector } from '@/lib/hooks';
import { formatDbDate } from '@/util/dbTime';

const RoomSchedule = () => {
  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);

  const today = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const [currentWeek, setCurrentWeek] = useState<Date>(today);
  const [dayOfWeek, setDayOfWeek] = useState<number>(today.getDay());
  const [weekEvents, setWeekEvents] = useState<Event[][] | null>(null);

  const startOfCurrentWeek = useMemo(
    () => startOfWeek(currentWeek, { weekStartsOn: 0 }),
    [currentWeek],
  );
  const endOfCurrentWeek = useMemo(
    () => endOfWeek(currentWeek, { weekStartsOn: 0 }),
    [currentWeek],
  );

  const daysOfWeek = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: endOfCurrentWeek,
  });

  useEffect(() => {
    if (!selectedRoom) {
      return;
    }

    // fetch events for the current day
    setWeekEvents(null);

    fetchEvents(
      `${selectedRoom.floor.buildingCode} ${selectedRoom.name}`,
      startOfCurrentWeek,
      endOfCurrentWeek,
      setWeekEvents,
    );
  }, [selectedRoom, currentWeek, startOfCurrentWeek, endOfCurrentWeek]);

  const renderDatePicker = () => {
    const renderDateRow = () => {
      const dateText =
        format(startOfCurrentWeek, 'MMM d') +
        ' - ' +
        format(endOfCurrentWeek, 'MMM d');

      const handlePreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));

      const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

      return (
        <div className="flex items-center justify-center gap-2">
          <FaChevronLeft
            onClick={handlePreviousWeek}
            className="cursor-pointer text-gray-600"
          />
          <div className="font-bold"> {dateText}</div>
          <FaChevronRight
            onClick={handleNextWeek}
            className="cursor-pointer text-gray-600"
          />
        </div>
      );
    };

    const renderWeekRow = () => {
      const renderDay = (day: Date) => {
        let classNames = 'w-7 text-sm text-center ';
        if (day.getDay() == dayOfWeek) {
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
              onClick={() => setDayOfWeek(day.getDay())}
            >
              {renderDay(day)}
            </div>
          ))}
        </div>
      );
    };

    return (
      <div>
        {renderDateRow()}
        {renderWeekRow()}
      </div>
    );
  };

  const renderContent = () => {
    if (weekEvents) {
      return weekEvents[dayOfWeek].map((event) => {
        const startTime = formatDbDate(event.startTime, true);
        const endTime = formatDbDate(event.endTime, true);

        return (
          <div key={event.id} className="flex justify-between">
            <p>{event.name}</p>
            <p>
              {startTime}-{endTime}
            </p>
          </div>
        );
      });
    }
  };

  return (
    <div className="space-x-4 rounded-lg bg-white p-4 shadow">
      {renderDatePicker()}
      {renderContent()}
    </div>
  );
};

export default RoomSchedule;
