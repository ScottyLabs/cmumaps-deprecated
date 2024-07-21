import React from 'react';
// import FloorSwitcher from '@/components/building-display/FloorSwitcher';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import InfoCard from '@/components/info-card/InfoCard';
import NavCard from './navigation/NavCard';
import { useAppSelector } from '@/lib/hooks';
import SearchBar from './search-bar/SearchBar';

interface ToolbarProps {
  onSelectBuilding: (newBuilding: Building | null) => void;
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  userPosition: AbsoluteCoordinate;
}

const Toolbar = ({ onSelectRoom, userPosition }: ToolbarProps) => {
  const isCardOpen = useAppSelector(
    (state) => !!(state.ui.selectedRoom || state.ui.selectedBuilding),
  );

  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);
  // const floorOrdinal = useAppSelector((state) => state.ui.floorOrdinal);
  // const focusedBuilding = useAppSelector((state) => state.ui.focusedBuilding);

  return (
    <>
      {!isNavOpen && isCardOpen && <InfoCard />}
      {isNavOpen && <NavCard />}
      {/* {focusedBuilding && !isCardOpen && floorOrdinal && (
        <FloorSwitcher
          building={focusedBuilding}
          ordinal={floorOrdinal}
          isToolbarOpen={isSearchOpen}
        />
      )} */}
      <SearchBar onSelectRoom={onSelectRoom} userPosition={userPosition} />
    </>
  );
};

export default Toolbar;
