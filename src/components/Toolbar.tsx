import React, { useState, useMemo, useEffect } from 'react';
import styles from '@/styles/Toolbar.module.css';
import FloorSwitcher from '@/components/building-display/FloorSwitcher';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import clsx from 'clsx';
import useEscapeKey from '@/hooks/useEscapeKey';
import InfoCard from '@/components/info-card/InfoCard';
import NavCard from './navigation/NavCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
// import { Door } from '@/pages/api/findPath';
import { twMerge } from 'tailwind-merge';
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
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const floorOrdinal = useAppSelector((state) => state.ui.floorOrdinal);
  const focusedBuilding = useAppSelector((state) => state.ui.focusedBuilding);
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
      <div
        className={
          //styles.toolbar +
          //' absolute bottom-0 left-0' + ' w-full z-100 p-[var(--main-ui-padding)] pt-0 mt-[var(--main-ui-padding)] ease-in-out duration-[var(--search-transition-duration)] flex flex-col gap-[var(--toolbar-gap)] justify-end ' //toolbar
          //+
          twMerge(
            clsx(
              styles.toolbar,
              //isSearchOpen && styles['toolbar-open'],
              //isCardOpen && styles['card-open'],
            ),
            `${isSearchOpen ? 'h-[calc(var(--floor-switcher-height) + var(--toolbar-gap) + var(--search-box-height) + var(--main-ui-padding))] translate-y-[calc(-1*(var(--floor-switcher-height] bottom-[unset] top-[0]' + styles['toolbar-open'] : ''}`,
            `${isCardOpen ? 'h-[calc(var(--floor-switcher-height) + var(--toolbar-gap) + var(--search-box-height) + var(--main-ui-padding))] translate-y-[calc(-1*(var(--floor-switcher-height] bottom-[unset] top-[0]' + styles['card-open'] : ''}`,
            'h-[calc(var(--floor-switcher-height) + var(--toolbar-gap) + var(--search-box-height) + var(--main-ui-padding))] top-0',
            'h-[calc(var(--floor-switcher-height) + var(--toolbar-gap) + var(--search-box-height) + var(--main-ui-padding))] top-0',
          )
        }
      >
        {!isNavOpen && isCardOpen && <InfoCard />}
        {isNavOpen && <NavCard />}
        {focusedBuilding && !isCardOpen && floorOrdinal && (
          <FloorSwitcher
            building={focusedBuilding}
            ordinal={floorOrdinal}
            isToolbarOpen={isSearchOpen}
          />
        )}
        <SearchBar
          onSelectRoom={onSelectRoom}
          userPosition={userPosition}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
    </>
  );
};

export default Toolbar;
