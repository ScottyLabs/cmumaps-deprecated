import courseIcon from '@icons/quick_search/course.svg';
import eventIcon from '@icons/quick_search/event.svg';
import foodIcon from '@icons/quick_search/food.svg';
import restroomIcon from '@icons/quick_search/restroom.svg';
import roomIcon from '@icons/quick_search/room.svg';
import studyIcon from '@icons/quick_search/study.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

export const SearchModeList = [
  'rooms',
  'food',
  'courses',
  'events',
  'restrooms',
  'study',
] as const;

export type SearchMode = (typeof SearchModeList)[number];

export const searchModeToIcon: Record<SearchMode, StaticImport> = {
  rooms: roomIcon,
  food: foodIcon,
  courses: courseIcon,
  events: eventIcon,
  restrooms: restroomIcon,
  study: studyIcon,
};
