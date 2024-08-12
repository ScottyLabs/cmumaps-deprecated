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
  const [scheduleData, setScheduleData] = useState([]);

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

  const renderNoSchedule = () => {
    return (
      <CollapsibleWrapper title="Schedule">
        <div className="space-y-2 px-5 pb-2">
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
        </div>
      </CollapsibleWrapper>
    );
  };

  if (scheduleData.length > 0) {
    console.log(scheduleData);
  } else {
    return renderNoSchedule();
  }
};

export default Schedule;
