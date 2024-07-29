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

  const handlePreviousWeek = () => setCurrentWeek((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeek((prev) => addWeeks(prev, 1));

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

    const renderWeekRow = () => (
      <div className="mx-10 mt-2 flex justify-between">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center">
            <div
              className={`text-sm ${day.getTime() === today.getTime() ? 'font-bold' : ''}`}
            >
              {format(day, 'EEEEEE')}
            </div>
          </div>
        ))}
      </div>
    );

    return (
      <div>
        {renderDateRow()}
        {renderWeekRow()}
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
