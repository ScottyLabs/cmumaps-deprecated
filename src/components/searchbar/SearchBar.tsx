import searchIcon from '@icons/search.svg';
import Image from 'next/image';

import React, { useEffect, useRef, useState } from 'react';
import { IoIosClose } from 'react-icons/io';

import QuickSearch from '@/components/searchbar/QuickSearch';
import useEscapeKey from '@/hooks/useEscapeKey';
import { setIsNavOpen, setRecommendedPath } from '@/lib/features/navSlice';
import { releaseRoom, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate } from '@/types';

import SearchResults from './SearchResults';

interface Props {
  map: mapkit.Map | null;
  userPosition: AbsoluteCoordinate;
}

const SearchBar = ({ map, userPosition }: Props) => {
  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLInputElement>(null);

  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const buildings = useAppSelector((state) => state.data.buildings);

  const room = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.selectedBuilding);

  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // const [eventsResults, setEventsResults] = useState<Event[]>([]);
  // searchEvents(searchQuery).then(setEventsResults);

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
        setSearchQuery(room.floor.buildingCode + ' ' + room.name);
        return;
      }
    }

    // set the search query to empty when there is no room or building selected
    if (!room && !building) {
      setSearchQuery('');
      return;
    }
  }, [room, buildings, building]);

  const handleCloseSearch = () => {
    dispatch(setIsSearchOpen(false));
    dispatch(setIsNavOpen(false));
    dispatch(setRecommendedPath([]));
    dispatch(releaseRoom(null));
    setSearchQuery('');
  };

  // close search if esc is pressed
  useEscapeKey(() => {
    handleCloseSearch();
  });

  // blur the input field when not searching
  // mainly used for clicking on the map to close search
  useEffect(() => {
    if (!isSearchOpen) {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, [isSearchOpen]);

  const renderSearchQueryInput = () => {
    const renderCloseButton = () => (
      <IoIosClose
        title="Close"
        size={25}
        className="absolute right-1"
        onPointerDown={handleCloseSearch}
      />
    );

    return (
      <div className="flex w-full items-center rounded bg-white p-1">
        <Image
          alt="Search Icon"
          src={searchIcon}
          className="size-4.5 ml-4 opacity-60 invert"
        />

        <input
          type="text"
          className="w-full rounded p-2 outline-none"
          placeholder="Search"
          ref={inputRef}
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
            map={map}
            query={searchQuery}
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
    <div id="SearchBar" className="box-shadow rounded">
      {renderSearchQueryInput()}
      {searchQuery == '' && (
        <div className="mt-3">
          <QuickSearch setQuery={setSearchQuery} />
        </div>
      )}
      {renderSearchResults()}
      {/* <p> ({eventsResults.toString()})</p> */}
    </div>
  );
};

export default SearchBar;
