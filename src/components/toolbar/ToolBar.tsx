import React from 'react';

import { useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate } from '@/types';

import SearchBar from '../searchbar/SearchBar';
import Events from './Events';
import Schedule from './Schedule';

interface Props {
  map: mapkit.Map | null;
  userPosition: AbsoluteCoordinate;
}

const ToolBar = ({ map, userPosition }: Props) => {
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);

  return (
    <div className="fixed top-4 mx-2 w-full space-y-2 sm:w-96">
      <SearchBar map={map} userPosition={userPosition} />

      {!isSearchOpen && (
        <>
          <Schedule />
          <Events />
        </>
      )}
    </div>
  );
};

export default ToolBar;
