import ical from 'ical';

import React, { useState } from 'react';

import CollapsibleWrapper from '../common/CollapsibleWrapper';

export interface CourseData {
  name: string;
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
          curCourse.name = course.summary;
          curCourse.instructors = course.description.split('\n')[2];
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
      <div className="no-scrollbar h-96 space-y-2 overflow-auto">
        {scheduleData.map((course) => (
          <div key={course.name + course.dow} className="border p-1">
            <p>{course.name}</p>
            <p>{course.instructors}</p>
            <p>
              {course.dow} {formatDate(course.start)}-{formatDate(course.end)}
            </p>
            <p>{course.room}</p>
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
            Calendar Export
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
