import roomIcon from '@icons/quick_search/room.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

export const SearchModeList = ['rooms'] as const;

export type SearchMode = (typeof SearchModeList)[number];

export const searchModeToIcon: Record<SearchMode, StaticImport> = {
  rooms: roomIcon,
};
