import React, { Dispatch, SetStateAction, useState } from 'react';
import styles from '@/styles/Toolbar.module.css';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import QuickSearch from '@/components/search-bar/QuickSearch';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { claimRoom, setIsSearchOpen } from '@/lib/redux/uiSlice';
import { setIsNavOpen, setRecommendedPath } from '@/lib/redux/navSlice';
import SearchResults from './SearchResults';

import { HiMagnifyingGlass } from 'react-icons/hi2';
import { IoIosClose } from 'react-icons/io';

interface Props {
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  userPosition: AbsoluteCoordinate;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

const SearchBar = ({
  onSelectRoom,
  userPosition,
  searchQuery,
  setSearchQuery,
}: Props) => {
  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);

  const [isFocused, setIsFocused] = useState(false);

  const renderSearchQueryInput = () => {
    const renderCloseButton = () => (
      <IoIosClose
        title="Close"
        size={25}
        className="absolute right-2"
        onClick={() => {
          dispatch(setIsSearchOpen(false));
          dispatch(setIsNavOpen(false));
          dispatch(setRecommendedPath([]));
          dispatch(claimRoom(null));
        }}
      />
    );

    return (
      <div className="flex items-center rounded bg-white">
        {!isFocused && <HiMagnifyingGlass className="pl-1" size={25} />}

        <input
          type="search"
          className="w-full rounded p-2"
          placeholder="Search"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          title="Search query"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {isFocused && renderCloseButton()}
      </div>
    );
  };

  const renderSearchResults = () => {
    return (
      <div
        className={
          //   clsx(
          //   styles['search-modal'],
          //   //SearchOpen && styles['search-modal-open'],
          // )
          styles['search-modal'] +
          ' z-95 left-0 top-0 w-[var(--search-width-desktop)] translate-y-[100vh] p-[var(--main-ui-padding)] pb-0 pt-20' + //search-modal
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
      </div>
    );
  };

  // don't display anything before the buildings are loaded
  if (!buildings) {
    return;
  }

  return (
    <div
      id="SearchBar"
      className="box-shadow fixed left-2 right-2 top-4 z-10 space-y-5 rounded"
    >
      {renderSearchQueryInput()}

      {/* displays the QuickSearch or the search results 
          depending on if the search query is empty */}
      {searchQuery == '' ? (
        <QuickSearch setQuery={setSearchQuery} />
      ) : (
        renderSearchResults()
      )}
    </div>
  );
};

export default SearchBar;
