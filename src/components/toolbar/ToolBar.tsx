import React from 'react';

import { getIsCardOpen } from '@/lib/features/uiSlice';
import { useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate } from '@/types';

import FloorSwitcher from '../buildings/FloorSwitcher';
import InfoCard from '../infocard/InfoCard';
import NavCard from '../navigation/NavCard';
import SearchBar from '../searchbar/SearchBar';
import Events from './Events';
import Schedule from './Schedule';

interface Props {
  map: mapkit.Map | null;
  userPosition: AbsoluteCoordinate;
}

const ToolBar = ({ map, userPosition }: Props) => {
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const isCardOpen = useAppSelector((state) => getIsCardOpen(state.ui));
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
  );

  return (
    <div className="fixed top-4 mx-2 w-full space-y-2 sm:w-96">
      <SearchBar map={map} userPosition={userPosition} />

      {!isSearchOpen && !isCardOpen && (
        <>
          <Schedule />
          <Events />
        </>
      )}

      {!isNavOpen && !isSearchOpen && <InfoCard map={map} />}
      {isNavOpen && isCardOpen && !choosingRoomMode && <NavCard />}
      {focusedFloor && <FloorSwitcher focusedFloor={focusedFloor} />}
    </div>
  );
};

export default ToolBar;
