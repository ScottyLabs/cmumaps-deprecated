import React from 'react';

import { AbsoluteCoordinate } from '@/types';

import SearchBar from '../searchbar/SearchBar';
import Schedule from './Schedule';

interface Props {
  map: mapkit.Map | null;
  userPosition: AbsoluteCoordinate;
}

const ToolBar = ({ map, userPosition }: Props) => {
  return (
    <div className="fixed top-4 mx-2 w-full sm:w-96">
      <SearchBar map={map} userPosition={userPosition} />
      <Schedule />
    </div>
  );
};

export default ToolBar;
