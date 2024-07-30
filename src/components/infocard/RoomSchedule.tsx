import React, { useState } from 'react';
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { FaChevronLeft } from 'react-icons/fa';
import { FaChevronRight } from 'react-icons/fa';

const RoomSchedule = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentWeek, setCurrentWeek] = useState<Date>(today);
  const [dayOfWeek, setDayOfWeek] = useState<number>(today.getDay());

  const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const endOfCurrentWeek = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const daysOfWeek = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: endOfCurrentWeek,
  });

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

    const renderContent = () => {
      return (
        <p>
          Theo, please give me the events for {daysOfWeek[dayOfWeek].toString()}
        </p>
      );
    };

    return (
      <div>
        {renderDateRow()}
        {renderWeekRow()}
        {renderContent()}
      </div>
    );
  };

  return (
    <div className="space-x-4 rounded-lg bg-white p-4 shadow">
      {renderDatePicker()}
    </div>
  );
};

export default RoomSchedule;
