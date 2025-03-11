import courseIcon from '@icons/quick_search/course.svg';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { setCourseData } from '@/lib/features/dataSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Course, CourseData, FloorPlanMap } from '@/types';

import KeepTypingDisplay from '../display_helpers/KeepTypingDisplay';
import NoResultDisplay from '../display_helpers/NoResultDisplay';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  query: string;
}

export const handleCourseClick =
  (
    roomInfoArr: string[],
    floorPlanMap: FloorPlanMap | null,
    router: AppRouterInstance,
  ) =>
  () => {
    if (!floorPlanMap) {
      return;
    }

    const buildingCode = roomInfoArr[0];

    const buildingMap = floorPlanMap[buildingCode];

    if (!buildingMap) {
      if (buildingCode == 'DNM') {
        toast.error('This class do not meet!');
      } else if (buildingCode == 'TBA') {
        toast.error('To be determined!');
      } else {
        toast.error('Building not available!');
      }
      return;
    }

    const roomName = roomInfoArr[1];
    const floorLevel = roomName.charAt(0);

    if (!buildingMap[floorLevel]) {
      toast.error('Floor not available!');
    } else {
      const floorMap = buildingMap[floorLevel];
      const selectedRoom = Object.values(floorMap).find(
        (room) => room.name == roomName,
      );

      if (!selectedRoom) {
        toast.error('Room not available!');
      } else {
        router.push(`${buildingCode}-${selectedRoom.name}`);
      }
    }
  };

const CourseSearchResults = ({ query }: Props) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const courseData = useAppSelector((state) => state.data.courseData);
  const [searchResult, setSearchResult] = useState<CourseData>({});

  // load course data
  useEffect(() => {
    setTimeout(() => {
      if (!courseData) {
        fetch('/cmumaps-data/courses.json').then((response) =>
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

  if (query.length == 0) {
    return <KeepTypingDisplay />;
  }

  if (Object.keys(searchResult).length == 0) {
    return <NoResultDisplay />;
  }

  const renderCourseResultHelper = (courseCode: string, course: Course) => {
    return Object.entries(course.sections).map(([sectionCode, section]) => (
      <SearchResultWrapper
        key={courseCode + sectionCode}
        handleClick={handleCourseClick(
          section.room.split(' '),
          floorPlanMap,
          router,
        )}
      >
        <div
          key={courseCode}
          className="flex w-full items-center gap-2 py-1 text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-700">
            <Image alt={'Event Icon'} src={courseIcon} />
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-gray-800">
              {courseCode} {sectionCode}
            </p>
            <p className="truncate font-bold text-gray-800">{course.name}</p>
            <p className="text-[--color-gray]">
              {section.dow} {section.startTime}-{section.endTime}
            </p>
            <p className="text-[--color-gray]">{section.room}</p>
          </div>
        </div>
      </SearchResultWrapper>
    ));
  };

  return Object.entries(searchResult)
    .slice(0, 10)
    .map(([department, courses]) => (
      <div key={department}>
        <SearchResultWrapper>
          <h2>{department}</h2>
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
