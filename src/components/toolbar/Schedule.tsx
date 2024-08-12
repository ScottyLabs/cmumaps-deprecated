import ical from 'ical';
import { useRouter } from 'next/navigation';

import React, { useState } from 'react';

import { useAppSelector } from '@/lib/hooks';

import CollapsibleWrapper from '../common/CollapsibleWrapper';
import { handleCourseClick } from '../searchbar/search_results/CourseSearchResults';

export interface CourseData {
  name: string;
  code: string;
  section: string;
  instructors: string;
  room: string;
  dow: string;
  start: Date;
  end: Date;
}

const dayMap = {
  0: 'M', // Monday
  1: 'T', // Tuesday
  2: 'W', // Wednesday
  3: 'R', // Thursday
  4: 'F', // Friday
  5: 'S', // Saturday
  6: 'U', // Sunday
};

const Schedule = () => {
  const router = useRouter();

  const searchMap = useAppSelector((state) => state.data.searchMap);

  const [scheduleData, setScheduleData] = useState<CourseData[]>([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = async (e) => {
        const newScheduleData = [];

        for (const course of Object.values(
          ical.parseICS(e.target.result as string),
        )) {
          const curCourse: Partial<CourseData> = {};
          curCourse.name = course.summary.split(' :: ')[0];
          curCourse.code = course.summary.split(' :: ')[1].split(' ')[0];
          curCourse.section = course.summary.slice(-1);
          curCourse.instructors = course.description
            .split('\n')[2]
            .replace('Instructors:', '')
            .replace('Instructor:', '');
          curCourse.room = course.location.replace(' ', '');
          curCourse.dow = course.rrule.options.byweekday
            .map((day) => dayMap[day])
            .join('');
          curCourse.start = course.start;
          curCourse.end = course.end;
          newScheduleData.push(curCourse);
        }

        setScheduleData(newScheduleData);
      };
    }
  };

  const renderSchedule = () => {
    const formatDate = (date: Date) => {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
      <div className="no-scrollbar h-96 space-y-3 overflow-auto">
        {scheduleData.map((course) => (
          <div
            key={course.code + course.dow}
            className="rounded border bg-gray-50 p-1"
            onClick={handleCourseClick(
              course.room.split('-'),
              searchMap,
              router,
            )}
          >
            <h3 className="truncate text-gray-700">
              {course.code} {course.name}
            </h3>
            <div className="text-gray-500">
              <div className="flex justify-between">
                <p>Section {course.section}</p>
                <p>{course.instructors}</p>
              </div>
              <div className="flex justify-between">
                <p>
                  {course.dow} {formatDate(course.start)}-
                  {formatDate(course.end)}
                </p>
                <p>{course.room}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNoSchedule = () => {
    return (
      <>
        <p>
          First step: download{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://s3.andrew.cmu.edu/sio/mpa/secure/export/schedule/F24_schedule.ics"
          >
            <span className="text-blue-600 underline">Calendar Export</span>
          </a>{' '}
          from SIO
        </p>
        <p>
          Second step: Import the .ics file here:
          <input
            type="file"
            id="fileInput"
            accept=".ics"
            onChange={handleFileChange}
          />
        </p>
      </>
    );
  };

  return (
    <CollapsibleWrapper title="Schedule">
      <div className="space-y-2 px-5 pb-2">
        {scheduleData.length > 0 ? renderSchedule() : renderNoSchedule()}
      </div>
    </CollapsibleWrapper>
  );
};

export default Schedule;
