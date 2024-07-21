import React, { useEffect, useState } from 'react';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import QuickSearch from '@/components/search-bar/QuickSearch';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { claimRoom, releaseRoom, setIsSearchOpen } from '@/lib/redux/uiSlice';
import SearchResults from './SearchResults';
import { IoIosClose } from 'react-icons/io';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import useEscapeKey from '@/hooks/useEscapeKey';
import { setIsNavOpen, setRecommendedPath } from '@/lib/redux/navSlice';

interface Props {
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  userPosition: AbsoluteCoordinate;
}

const SearchBar = ({ onSelectRoom, userPosition }: Props) => {
  const dispatch = useAppDispatch();

  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const buildings = useAppSelector((state) => state.data.buildings);

  const room = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.selectedBuilding);

  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // set the search query using room and building
  useEffect(() => {
    // return the building name if a building is selected
    if (building?.name) {
      setSearchQuery(building?.name);
      return;
    }

    // if there is a selected room, the search query is
    // the room alias if the room has an alias,
    // otherwise it is the room floor name + the room name
    if (room) {
      if (room?.alias) {
        setSearchQuery(room.alias);
        return;
      } else {
        setSearchQuery(room.floor + room.name);
        return;
      }
    }

    // set the search query to empty when there is no room or building selected
    if (!room && !building) {
      setSearchQuery('');
      return;
    }
  }, [room, buildings, building]);

  // close search if esc is pressed
  useEscapeKey(() => {
    dispatch(setIsSearchOpen(false));
  });

  const renderSearchQueryInput = () => {
    const renderCloseButton = () => (
      <IoIosClose
        title="Close"
        size={25}
        className="absolute right-2"
        onPointerDown={() => {
          dispatch(setIsSearchOpen(false));
          dispatch(setIsNavOpen(false));
          dispatch(setRecommendedPath([]));
          dispatch(releaseRoom(null));
          setSearchQuery('');
        }}
      />
    );

    return (
      <div className="flex items-center rounded bg-white">
        {!isFocused && <HiMagnifyingGlass className="pl-1" size={25} />}

        <input
          type="text"
          className="w-full rounded p-2"
          placeholder="Search"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          title="Search query"
          onFocus={() => {
            dispatch(setIsSearchOpen(true));
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
        />

        {isFocused && renderCloseButton()}
      </div>
    );
  };

  const renderSearchResults = () => {
    return (
      <div
        className={`my-1 overflow-y-scroll rounded bg-gray-50 transition-opacity duration-150 ease-in-out ${
          isSearchOpen && searchQuery != ''
            ? 'h-[46em] opacity-100'
            : 'h-0 opacity-0'
        }`}
      >
        {searchQuery != '' && (
          <SearchResults
            query={searchQuery}
            onSelectRoom={(room: Room, building: Building, newFloor: Floor) => {
              onSelectRoom(room, building, newFloor);
              dispatch(setIsSearchOpen(false));
            }}
            userPosition={userPosition}
          />
        )}
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
      className="box-shadow fixed left-2 right-2 top-4 z-10 rounded"
    >
      {renderSearchQueryInput()}
      {searchQuery == '' && <QuickSearch setQuery={setSearchQuery} />}
      {renderSearchResults()}
    </div>
  );
};

export default SearchBar;
