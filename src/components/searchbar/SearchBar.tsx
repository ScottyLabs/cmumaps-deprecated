import searchIcon from '@icons/search.svg';
import Image from 'next/image';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IoIosClose } from 'react-icons/io';

import useEscapeKey from '@/hooks/useEscapeKey';
import {
  setChoosingRoomMode,
  setIsNavOpen,
  setRecommendedPath,
} from '@/lib/features/navSlice';
import {
  releaseRoom,
  setIsSearchOpen,
  setSearchMode,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import SearchModeSelector from './SearchModeSelector';
import { searchModeToIcon } from './searchMode';
import SearchResults from './search_results/SearchResults';

interface Props {
  map: mapkit.Map | null;
}

const SearchBar = ({ map }: Props) => {
  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLInputElement>(null);

  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const buildings = useAppSelector((state) => state.data.buildings);

  const room = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.selectedBuilding);
  const searchMode = useAppSelector((state) => state.ui.searchMode);
  const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
  );

  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const showSearchModeSelector = isSearchOpen && !choosingRoomMode;

  const autoFillSearchQuery = useCallback(() => {
    // return the building name if a building is selected
    if (building?.name) {
      setSearchQuery(building?.name);
      return;
    }

    if (room) {
      // the search query is the room alias if the room has an alias,
      if (room?.alias) {
        setSearchQuery(room.alias);
        return;
      }
      // otherwise it is the room floor name + the room name
      else {
        setSearchQuery(room.floor.buildingCode + ' ' + room.name);
        return;
      }
    }

    // set the search query to empty when there is no room or building selected
    if (!room && !building) {
      setSearchQuery('');
      return;
    }
  }, [building, room]);

  // set the search query using room and building
  useEffect(() => {
    autoFillSearchQuery();
  }, [autoFillSearchQuery]);

  // focus on the input if the search mode changed
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchMode]);

  // focus on the input and clear text if the search mode changed to not null
  useEffect(() => {
    if (inputRef.current) {
      if (choosingRoomMode) {
        inputRef.current.focus();
        setSearchQuery('');
        dispatch(setSearchMode('rooms'));
      }
    }
  }, [choosingRoomMode, dispatch]);

  // blur the input field when not searching (mainly used for clicking on the map to close search)
  useEffect(() => {
    if (!isSearchOpen) {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, [isSearchOpen]);

  const handleCloseSearch = () => {
    if (!choosingRoomMode) {
      dispatch(setIsSearchOpen(false));
      dispatch(setIsNavOpen(false));
      dispatch(setRecommendedPath([]));
      dispatch(releaseRoom(null));
      dispatch(setSearchMode('rooms'));
      setSearchQuery('');
    } else {
      dispatch(setIsSearchOpen(false));
      dispatch(setChoosingRoomMode(null));
      autoFillSearchQuery();
    }
  };

  // close search if esc is pressed
  useEscapeKey(() => {
    handleCloseSearch();
  });

  const renderSearchQueryInput = () => {
    const renderCloseButton = () => (
      <IoIosClose
        title="Close"
        size={25}
        className="absolute right-1"
        onPointerDown={handleCloseSearch}
      />
    );

    let icon = searchIcon;

    // check if the search bar is focused to determine icon
    if (document.activeElement === inputRef.current) {
      icon = searchModeToIcon[searchMode];
    }

    const placeholder = `You are searching ${searchMode} now...`;

    return (
      <div className="flex w-full items-center rounded bg-white p-1">
        <Image
          alt="Search Icon"
          src={icon}
          className="size-4.5 ml-4 opacity-60 invert"
          width={20}
        />

        <input
          type="text"
          className="w-full rounded p-2 outline-none"
          placeholder={placeholder}
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
        className={`z-10 flex-1 overflow-y-scroll rounded bg-gray-50 transition-opacity duration-150 ease-in-out ${
          searchQuery == '' && !['food', 'restrooms'].includes(searchMode)
            ? 'h-0 opacity-0'
            : 'mt-1 h-fit opacity-100' // displays all food if search query is empty
        }`}
      >
        <SearchResults map={map} query={searchQuery} />
      </div>
    );
  };

  // don't display anything before the buildings are loaded
  if (!buildings) {
    return;
  }
  return (
    <>
      {renderSearchQueryInput()}
      {showSearchModeSelector && (
        <div className="mt-2">
          <SearchModeSelector />
        </div>
      )}
      {isSearchOpen && renderSearchResults()}
    </>
  );
};

export default SearchBar;
