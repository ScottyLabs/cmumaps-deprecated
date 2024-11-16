import courseIcon from '@icons/quick_search/course.svg';
import eventIcon from '@icons/quick_search/event.svg';
import foodIcon from '@icons/quick_search/food.svg';
import roomIcon from '@icons/quick_search/room.svg';
import shuttleIcon from '@icons/quick_search/shuttle.svg';
import studyIcon from '@icons/quick_search/study.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

export const SearchModeList = [
  'rooms',
  'food',
  'courses',
  'events',
  'study',
  'shuttle',
] as const;

export type SearchMode = (typeof SearchModeList)[number];

export const searchModeToIcon: Record<SearchMode, StaticImport> = {
  rooms: roomIcon,
  food: foodIcon,
  courses: courseIcon,
  events: eventIcon,
  study: studyIcon,
  shuttle: shuttleIcon,
};

export const searchModeToDisplayText: Record<SearchMode, string> = {
  rooms: 'Rooms',
  food: 'Food',
  courses: 'Courses',
  events: 'Events',
  study: 'Study',
  shuttle: 'Shuttle',
};

export const searchModeToBgColor: Record<SearchMode, string> = {
  rooms: 'bg-[#636672]',
  food: 'bg-[#FFBD59]',
  courses: 'bg-[#C41230]',
  events: 'bg-[#87BCFB]',
  study: 'bg-[#A6E08B]',
  shuttle: 'bg-[#EFB1F4]',
};
