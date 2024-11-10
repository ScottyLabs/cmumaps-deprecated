import React from 'react';

import { getIsCardOpen } from '@/lib/features/uiSlice';
import { useAppSelector } from '@/lib/hooks';

import FloorSwitcher from '../buildings/FloorSwitcher';
import InfoCard from '../infocard/InfoCard';
import NavCard from '../navigation/NavCard';
import SearchBar from '../searchbar/SearchBar';
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
  const isMobile = useAppSelector((state) => state.ui.isMobile);

  const isCardWrapperCollapsed = useAppSelector(
    (state) => state.ui.isCardWrapperCollapsed,
  );

  // first only show floor switcher if there is focused floor
  let showFloorSwitcher = !!focusedFloor;

  // mobile cases
  if (isMobile) {
    if (isCardOpen && !isCardWrapperCollapsed) {
      showFloorSwitcher = false;
    }

    if (isSearchOpen) {
      showFloorSwitcher = false;
    }
  }

  const showSearchBar = () => {
    if (isNavOpen && !choosingRoomMode) {
      return false;
    }

    return true;
  };

  return (
    // need box content in the desktop version so the width of the search bar match the card
    <div
      style={{ maxHeight: `calc(100vh)` }}
      className="fixed flex w-full px-2 sm:box-content sm:w-96"
    >
      <div className="flex w-full flex-col space-y-2 overflow-hidden py-2">
        {showSearchBar() && <SearchBar map={map} />}

        {!isSearchOpen && !isCardOpen && <Schedule />}

        {!isNavOpen && !isSearchOpen && <InfoCard map={map} />}
        {isNavOpen && isCardOpen && !choosingRoomMode && <NavCard map={map} />}
      </div>

      {showFloorSwitcher && focusedFloor && (
        <FloorSwitcher focusedFloor={focusedFloor} />
      )}
    </div>
  );
};

export default ToolBar;
