import React, { useState, useEffect } from 'react';
// import FloorSwitcher from '@/components/building-display/FloorSwitcher';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import useEscapeKey from '@/hooks/useEscapeKey';
import InfoCard from '@/components/info-card/InfoCard';
import NavCard from './navigation/NavCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import SearchBar from './search-bar/SearchBar';
import { setIsSearchOpen } from '@/lib/redux/uiSlice';

interface ToolbarProps {
  onSelectBuilding: (newBuilding: Building | null) => void;
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  userPosition: AbsoluteCoordinate;
}

const Toolbar = ({ onSelectRoom, userPosition }: ToolbarProps) => {
  const isCardOpen = useAppSelector(
    (state) => !!(state.ui.selectedRoom || state.ui.selectedBuilding),
  );
  const dispatch = useAppDispatch();

  const room = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.focusedBuilding);
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);
  // const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  // const floorOrdinal = useAppSelector((state) => state.ui.floorOrdinal);
  // const focusedBuilding = useAppSelector((state) => state.ui.focusedBuilding);
  const [searchQuery, setSearchQuery] = useState('');

  // set the search query using room and building
  useEffect(() => {
    // set the search query to empty when there is no room or building selected
    if (!room && !building) {
      setSearchQuery('');
      return;
    }

    // set the search query to the alias of the room if there is a room
    if (room?.alias) {
      setSearchQuery(room.alias);
      return;
    }

    // otherwise the formatted name is the building name + the room name
    let formattedName = '';
    if (building?.name) {
      formattedName += building?.name;
    }

    if (room?.name) {
      formattedName += ' ' + room?.name;
    }

    if (formattedName != '') {
      setSearchQuery(formattedName);
    }
  }, [room, building]);

  // close search if esc is pressed
  useEscapeKey(() => {
    dispatch(setIsSearchOpen(false));
  });

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
      <SearchBar
        onSelectRoom={onSelectRoom}
        userPosition={userPosition}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </>
  );
};

export default Toolbar;
