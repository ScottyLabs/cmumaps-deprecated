import courseIcon from '@icons/quick_search/course.svg';
import eventIcon from '@icons/quick_search/event.svg';
import roomIcon from '@icons/quick_search/room.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

export const SearchModeList = ['rooms', 'courses', 'events'] as const;

export type SearchMode = (typeof SearchModeList)[number];

export const searchModeToIcon: Record<SearchMode, StaticImport> = {
  rooms: roomIcon,
  courses: courseIcon,
  events: eventIcon,
};
