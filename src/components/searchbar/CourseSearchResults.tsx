import React, { useEffect, useState } from 'react';

import { setCourseData } from '@/lib/features/dataSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate, Course, CourseData } from '@/types';

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
    fetch('/json/courses.json').then((response) =>
      response.json().then((data) => {
        dispatch(setCourseData(data));
      }),
    );
  }, [dispatch]);

  // search courses
  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    const newSearchResults: CourseData = {};

    Object.entries(courseData).map(([department, courses]) => {
      Object.entries(courses).map(([courseCode, course]: [string, Course]) => {
        if (
          department.includes(query) ||
          courseCode.includes(query) ||
          course.name.includes(query)
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

  if (query.length < 2) {
    return <p>Type more pls</p>;
  }

  return Object.entries(searchResult).map(([department, courses]) => (
    <div key={department}>
      <p>{department}</p>
    </div>
  ));
};

export default CourseSearchResults;
