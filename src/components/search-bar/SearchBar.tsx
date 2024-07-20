import React, { useState } from 'react';
import styles from '@/styles/Toolbar.module.css';
import { MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import clsx from 'clsx';
import QuickSearch from '@/components/search-bar/QuickSearch';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { claimRoom, setIsSearchOpen } from '@/lib/redux/uiSlice';
import { setIsNavOpen, setRecommendedPath } from '@/lib/redux/navSlice';
import { twMerge } from 'tailwind-merge';
import SearchResults from './SearchResults';

interface Props {
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  userPosition: AbsoluteCoordinate;
  searchQuery;
  setSearchQuery;
}

const SearchBar = ({
  onSelectRoom,
  userPosition,
  searchQuery,
  setSearchQuery,
}: Props) => {
  const isCardOpen = useAppSelector(
    (state) => !!(state.ui.selectedRoom || state.ui.selectedBuilding),
  );
  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);

  return (
    <>
      <div
        className={
          'relative h-[var(--search-box-height)] overflow-hidden rounded-[8px] border-0 bg-white [box-shadow:0_10px_15px_-3px_rgb(0_0_0_/_0.1),_0_4px_6px_-4px_rgb(0_0_0_/_0.1)]' /*styles['search-box']*/
        }
      >
        {/* Arrow */}
        <div
          className={
            'pointer-events-none absolute left-0.5 flex h-full w-10 items-center justify-center' /*styles['search-icon-wrapper']*/
          }
        >
          {/* Magnifying Glass Size */}
          <MagnifyingGlassIcon
            className={'h-6 w-6 fill-[#767575]' /*styles['search-icon']*/}
          />
        </div>
        <button
          type="button"
          title="Close"
          // back arrow
          className={
            'absolute left-2 top-2.5 flex items-center justify-center bg-white opacity-0' + //search-close-button
            ' focus-visible:border-3px focus-visible:border-solid focus-visible:border-[#007cff]' + //search-close-button: focus-visible
            `${isSearchOpen || isCardOpen || isNavOpen ? ' pointer-events-auto opacity-100' : ''}` //search-close-button-visible
            // clsx(
            //   //styles['search-close-button'],
            //   //(isSearchOpen || isCardOpen || isNavOpen) &&
            //   //styles['search-close-button-visible'],
            // )
          }
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
          {/* Arrow Left on Search Bar */}
          <ArrowLeftIcon
            className={'h-6 w-6 text-[#4b5563]' /*styles['search-close-icon']*/}
          />
        </button>
        {!isSearchOpen && (
          <button
            type="button"
            aria-label="Open Search"
            // Search Word in search bar
            className={
              //clsx(
              //styles['open-search-button'],
              //!searchQuery && styles.placeholder, //What does this do?
              //)
              'absolute block h-full w-full cursor-text whitespace-nowrap rounded-[8px] border-0 bg-transparent pl-[var(--search-icon-width)] text-left text-[20px] [color:inherit] [font-family:inherit]' +
              'focus-visible:pl-[calc(var(--search-icon-width) - 3px)] focus-visible:border-[3px] focus-visible:border-solid focus-visible:border-[#007cff] focus-visible:bg-[#e0efff]'
            }
            onClick={() => {
              dispatch(setIsSearchOpen(true));
              // inputRef.current!.focus();
            }}
          >
            {searchQuery === '' ? 'Search' : searchQuery}
          </button>
        )}
      </div>
      {isSearchOpen && (
        <input
          type="search"
          className={
            clsx(styles['search-box-input']) +
            ' w-18 fixed left-14 top-4 h-9 border-0 bg-transparent p-0 pr-3 font-["inherit"] text-[20px]'
          }
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
        className={
          //   clsx(
          //   styles['search-modal'],
          //   //SearchOpen && styles['search-modal-open'],
          // )
          styles['search-modal'] +
          ' z-95 absolute left-0 top-0 w-[var(--search-width-desktop)] translate-y-[100vh] p-[var(--main-ui-padding)] pb-0 pt-20' + //search-modal
          `${isSearchOpen ? ' transform-none' : ''}` //search-modal-open
          //something is wrong
        }
        ref={(node) =>
          node &&
          (isSearchOpen
            ? node.removeAttribute('inert')
            : node.setAttribute('inert', ''))
        }
      >
        {buildings && searchQuery != '' && (
          // Search results
          <div
            className={
              'rounded-3 relative h-[90vh] overflow-hidden bg-gray-50 p-2.5 [box-shadow:0_20px_25px_-5px_rgb(0_0_0_/_0.1),_0_8px_10px_-6px_rgb(0_0_0_/_0.1)]'
              //+ styles['search-list']
            }
          >
            <div
              className={
                'h-full overflow-y-auto' /*styles['search-list-scroll']*/
              }
            >
              <SearchResults
                query={searchQuery}
                buildings={buildings}
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

export default SearchBar;
