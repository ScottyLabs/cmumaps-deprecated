import courseIcon from '@icons/quick_search/course.svg';
import Image from 'next/image';

import React, { useEffect, useState } from 'react';

import { setCourseData } from '@/lib/features/dataSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate, Course, CourseData } from '@/types';

import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  query: string;
  userPosition: AbsoluteCoordinate;
}

const CourseSearchResults = ({ query }: Props) => {
  const dispatch = useAppDispatch();

  const courseData = useAppSelector((state) => state.data.courseData);
  const [searchResult, setSearchResult] = useState<CourseData>({});

  // load course data
  useEffect(() => {
    if (!courseData) {
      fetch('/json/courses.json').then((response) =>
        response.json().then((data) => {
          dispatch(setCourseData(data));
        }),
      );
    }
  }, [courseData, dispatch]);

  // search courses
  useEffect(() => {
    if (!courseData) {
      return;
    }

    const loweredQuery = query.toLowerCase();

    const newSearchResults: CourseData = {};

    Object.entries(courseData).map(([department, courses]) => {
      Object.entries(courses).map(([courseCode, course]: [string, Course]) => {
        if (
          department.toLowerCase().includes(loweredQuery) ||
          courseCode.toLowerCase().includes(loweredQuery) ||
          course.name.toLowerCase().includes(loweredQuery)
        ) {
          if (!newSearchResults[department]) {
            newSearchResults[department] = {};
          }
          newSearchResults[department][courseCode] = course;
        }
      });
    });

    setSearchResult(newSearchResults);
  }, [courseData, query]);

  const renderCourseResultHelper = (courseCode: string, course: Course) => {
    return Object.entries(course.sections).map(([sectionCode, section]) => (
      <div key={courseCode} className="flex items-center gap-2 py-1 text-left">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-700">
          <Image alt={'Event Icon'} src={courseIcon} />
        </div>
        <SearchResultWrapper
          key={courseCode + sectionCode}
          handleClick={() => {
            console.log('later');
          }}
        >
          <>
            <p className="truncate">
              {courseCode} {sectionCode}
            </p>
            <p>{course.name}</p>
            <p>
              {section.dow} {section.startTime} {section.endTime}
            </p>
            <p>{section.room}</p>
          </>
        </SearchResultWrapper>
      </div>
    ));
  };

  return Object.entries(searchResult).map(([department, courses]) => (
    <div key={department}>
      <SearchResultWrapper>
        <h3>{department}</h3>
      </SearchResultWrapper>
      {Object.entries(courses)
        .slice(0, 10)
        .map(([courseCode, course]) =>
          renderCourseResultHelper(courseCode, course),
        )}
    </div>
  ));
};

export default CourseSearchResults;
