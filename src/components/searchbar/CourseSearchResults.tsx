import courseIcon from '@icons/quick_search/course.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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
  const router = useRouter();
  const dispatch = useAppDispatch();

  const searchMap = useAppSelector((state) => state.data.searchMap);
  const courseData = useAppSelector((state) => state.data.courseData);
  const [searchResult, setSearchResult] = useState<CourseData>({});

  // load course data
  useEffect(() => {
    setTimeout(() => {
      if (!courseData) {
        fetch('/json/courses.json').then((response) =>
          response.json().then((data) => {
            dispatch(setCourseData(data));
          }),
        );
      }
    }, 500);
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
    const handleClick = (room: string) => () => {
      const roomInfoArr = room.split(' ');
      const buildingCode = roomInfoArr[0];
      const roomName = roomInfoArr[1];
      const floorLevel = roomName.charAt(0);

      const buildingMap = searchMap[buildingCode];

      if (!buildingMap) {
        if (buildingCode == 'DNM') {
          toast.error('This class do not meet!');
        } else {
          toast.error('Building not available!');
        }
        return;
      }

      if (!buildingMap[floorLevel]) {
        toast.error('Floor not available!');
      } else {
        const floorMap = buildingMap[floorLevel];
        const selectedRoom = floorMap.find((room) => room.name == roomName);

        if (!selectedRoom) {
          toast.error('Room not available!');
        } else {
          router.push(`${buildingCode}-${floorLevel}/${selectedRoom.id}`);
        }
      }
    };

    return Object.entries(course.sections).map(([sectionCode, section]) => (
      <SearchResultWrapper
        key={courseCode + sectionCode}
        handleClick={handleClick(section.room)}
      >
        <div
          key={courseCode}
          className="flex w-full items-center gap-2 py-1 text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-700">
            <Image alt={'Event Icon'} src={courseIcon} />
          </div>
          <div className="truncate">
            <p>
              {courseCode} {sectionCode}
            </p>
            <p className="truncate">{course.name}</p>
            <p>
              {section.dow} {section.startTime} {section.endTime}
            </p>
            <p>{section.room}</p>
          </div>
        </div>
      </SearchResultWrapper>
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
