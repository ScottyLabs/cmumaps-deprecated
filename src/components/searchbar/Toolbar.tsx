import React, { useState, useMemo } from 'react';
import styles from '@/styles/Toolbar.module.css';
import { MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import FloorSwitcher from '@/components/building-display/FloorSwitcher';
import { AbsoluteCoordinate, Building, Floor, FloorMap, Room } from '@/types';
import clsx from 'clsx';
import useEscapeKey from '@/hooks/useEscapeKey';
import SearchResults from './SearchResults';
import InfoCard from '@/components/info-card/InfoCard';
import QuickSearch from '@/components/searchbar/QuickSearch';
import NavCard from '../navigation/NavCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { claimRoom, setIsSearchOpen } from '@/lib/features/ui/uiSlice';
import { setIsNavOpen, setRecommendedPath } from '@/lib/features/ui/navSlice';
// import { Door } from '@/pages/api/findPath';

export interface ToolbarProps {
  buildings: Building[] | null;
  floorMap: FloorMap;
  onSelectBuilding: (newBuilding: Building | null) => void;
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  userPosition: AbsoluteCoordinate;
}

/**
 * Contains the floor switcher, the search bar and the search results.
 */
const Toolbar = ({
  buildings,
  floorMap,
  onSelectRoom,
  userPosition,
}: ToolbarProps) => {
  const isCardOpen = useAppSelector(
    (state) => !!(state.ui.selectedRoom || state.ui.selectedBuilding),
  );
  const dispatch = useAppDispatch();
  const room = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.focusedBuilding);
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const floorOrdinal = useAppSelector((state) => state.ui.floorOrdinal);
  const [searchQuery, setSearchQuery] = useState('');
  const focusedBuilding = useAppSelector((state) => state.ui.focusedBuilding);

  useMemo(() => {
    if (!room && !building) {
      return setSearchQuery('');
    }

    let formattedName = '';
    if (room?.alias) {
      return setSearchQuery(room.alias);
    }

    if (building?.name) {
      formattedName += building?.name;
    }

    if (room?.name) {
      formattedName += ' ' + room?.name;
    } else {
      formattedName == '';
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
        className={clsx(
          styles.toolbar,
          isSearchOpen && styles['toolbar-open'],
          isCardOpen && styles['card-open'],
        )}
      >
        {!isNavOpen && isCardOpen && <InfoCard />}
        {isNavOpen && <NavCard />}
        {focusedBuilding && !isCardOpen && (
          <FloorSwitcher
            building={focusedBuilding}
            ordinal={floorOrdinal!}
            isToolbarOpen={isSearchOpen}
          />
        )}

        <div className={styles['search-box']}>
          <div className={styles['search-icon-wrapper']}>
            <MagnifyingGlassIcon className={styles['search-icon']} />
          </div>
          <button
            type="button"
            title="Close"
            className={clsx(
              styles['search-close-button'],
              (isSearchOpen || isCardOpen || isNavOpen) &&
                styles['search-close-button-visible'],
            )}
            ref={(node) =>
              node &&
              (isSearchOpen || isCardOpen || isNavOpen
                ? node.removeAttribute('inert')
                : node.setAttribute('inert', ''))
            }
            onClick={() => {
              dispatch(setIsSearchOpen(false));
              dispatch(setIsNavOpen(false));
              dispatch(setRecommendedPath([]));
              dispatch(claimRoom(null));
            }}
          >
            <ArrowLeftIcon className={styles['search-close-icon']} />
          </button>
          {!isSearchOpen && (
            <button
              type="button"
              aria-label="Open Search"
              className={clsx(
                styles['open-search-button'],
                !searchQuery && styles.placeholder,
              )}
              onClick={() => {
                dispatch(setIsSearchOpen(true));
                // inputRef.current!.focus();
              }}
            >
              {searchQuery === '' ? 'Search' : searchQuery}
            </button>
          )}
        </div>
      </div>
      {isSearchOpen && (
        <input
          type="search"
          className={clsx(styles['search-box-input'])}
          placeholder="Search"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          title="Search query"
        />
      )}

      <div
        className={clsx(
          styles['search-modal-background'],
          isSearchOpen && styles['search-modal-background-active'],
        )}
        role="presentation"
      />

      <div
        className={clsx(
          styles['search-modal'],
          isSearchOpen && styles['search-modal-open'],
        )}
        ref={(node) =>
          node &&
          (isSearchOpen
            ? node.removeAttribute('inert')
            : node.setAttribute('inert', ''))
        }
      >
        {buildings && searchQuery != '' && (
          <div className={styles['search-list']}>
            <div className={styles['search-list-scroll']}>
              <SearchResults
                query={searchQuery}
                buildings={buildings}
                floorMap={floorMap}
                onSelectRoom={(
                  room: Room,
                  building: Building,
                  newFloor: Floor,
                ) => {
                  onSelectRoom(room, building, newFloor);
                  dispatch(setIsSearchOpen(false));
                }}
                userPosition={userPosition}
              />
            </div>
          </div>
        )}
        {buildings && searchQuery == '' && (
          <QuickSearch setQuery={setSearchQuery} />
        )}
      </div>
    </>
  );
};

export default Toolbar;
