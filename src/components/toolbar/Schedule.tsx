import { useUser } from '@clerk/nextjs';
import slidersIcon from '@icons/sliders.svg';
import ical from 'ical';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';

import { getUserSchedule, postUserSchedule } from '@/lib/apiRoutes';
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

  const { user } = useUser();

  const searchMap = useAppSelector((state) => state.data.searchMap);

  const [scheduleData, setScheduleData] = useState<CourseData[]>([]);

  useEffect(() => {
    if (user) {
      getUserSchedule(user.id).then((dbScheduleData) => {
        if (Object.keys(dbScheduleData).length !== 0) {
          setScheduleData(JSON.parse(dbScheduleData));
        }
      });
    }
  }, [user]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = async (e) => {
        const newScheduleData: CourseData[] = [];

        for (const course of Object.values(
          ical.parseICS(e.target?.result as string),
        )) {
          if (!course) {
            continue;
          }

          const curCourse: Partial<CourseData> = {};
          curCourse.name = course.summary?.split(' :: ')[0];
          curCourse.code = course.summary?.split(' :: ')[1].split(' ')[0];
          curCourse.section = course.summary?.slice(-1);
          curCourse.instructors = course.description
            ?.split('\n')[2]
            .replace('Instructors:', '')
            .replace('Instructor:', '');
          curCourse.room = course.location?.replace(' ', '');
          curCourse.dow = course.rrule?.options.byweekday
            .map((day) => dayMap[day])
            .join('');
          curCourse.start = course.start;
          curCourse.end = course.end;
          newScheduleData.push(curCourse as CourseData);
        }

        setScheduleData(newScheduleData);
        if (user) {
          postUserSchedule(user.id, JSON.stringify(newScheduleData));
        }
      };
    }
  };

  const renderSchedule = () => {
    const formatDate = (date: Date) => {
      return `${new Date(date).getHours().toString().padStart(2, '0')}:${new Date(date).getMinutes().toString().padStart(2, '0')}`;
    };

    return (
      <div className="h-96 space-y-3 overflow-auto pl-5 pr-2">
        {scheduleData.map((course) => (
          <button
            key={course.code + course.dow}
            className="w-full rounded border bg-gray-50 p-1 text-left hover:bg-gray-300"
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
          </button>
        ))}
      </div>
    );
  };

  const renderNoSchedule = () => {
    return (
      <div className="ml-5 text-gray-700">
        <p>
          1: Download{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://s3.andrew.cmu.edu/sio/mpa/secure/export/schedule/F24_schedule.ics"
          >
            <span className="text-blue-600 underline">Calendar Export</span>
          </a>{' '}
          from SIO
        </p>
        <p>2: Import the .ics file here:</p>
        <input
          type="file"
          id="fileInput"
          accept=".ics"
          onChange={handleFileChange}
          className="mt-1 text-sm"
        />
      </div>
    );
  };

  const renderReuploadButton = () => {
    return (
      <div className="flex justify-end">
        {' '}
        {/* Upload New Button, hide default html picker */}
        <label className="mb-1 mr-4 cursor-pointer rounded-md bg-blue-600 px-2 py-1 font-medium text-white">
          <Image
            alt={'Lock Icon'}
            src={slidersIcon}
            className="inline-block pb-1"
          />{' '}
          Upload New
          <input
            type="file"
            id="reUploadFileInput"
            accept=".ics"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    );
  };

  return (
    <CollapsibleWrapper title="Schedule">
      <div className="space-y-2 pb-2">
        {scheduleData.length > 0 ? renderSchedule() : renderNoSchedule()}
      </div>
      {scheduleData.length > 0 ? renderReuploadButton() : null}
    </CollapsibleWrapper>
  );
};

export default Schedule;
