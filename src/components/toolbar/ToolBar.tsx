import React from 'react';

import { getIsCardOpen } from '@/lib/features/uiSlice';
import { useAppSelector } from '@/lib/hooks';

import FloorSwitcher from '../buildings/FloorSwitcher';
import InfoCard from '../infocard/InfoCard';
import NavCard from '../navigation/NavCard';
import SearchBar from '../searchbar/SearchBar';
import Events from './Events';
import Schedule from './Schedule';

interface Props {
  map: mapkit.Map | null;
}

const ToolBar = ({ map }: Props) => {
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const isCardOpen = useAppSelector((state) => getIsCardOpen(state.ui));
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
  );

  return (
    <div className="fixed w-full px-2 sm:w-96">
      <div className="flex max-h-screen flex-col space-y-2 py-2">
        <SearchBar map={map} />

        {!isSearchOpen && !isCardOpen && (
          <>
            <Schedule />
            <Events />
          </>
        )}

        {!isNavOpen && !isSearchOpen && <InfoCard map={map} />}
        {isNavOpen && isCardOpen && !choosingRoomMode && <NavCard />}
      </div>

      {focusedFloor && <FloorSwitcher focusedFloor={focusedFloor} />}
    </div>
  );
};

export default ToolBar;
