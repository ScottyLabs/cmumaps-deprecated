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
  selectBuilding,
  selectRoom,
  setIsSearchOpen,
  setSearchMode,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import { searchModeToIcon } from './searchMode';
import SearchResults from './search_results/SearchResults';

interface Props {
  map: mapkit.Map | null;
}

const SearchBar = ({ map }: Props) => {
  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLInputElement>(null);

  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.selectedBuilding);
  const searchMode = useAppSelector((state) => state.ui.searchMode);
  const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
  );

  const [searchQuery, setSearchQuery] = useState('');

  const autoFillSearchQuery = useCallback(() => {
    // return the building name if a building is selected
    if (building?.name) {
      setSearchQuery(building?.name);
      return;
    }

    if (selectedRoom) {
      // the search query is the room alias if the room has an alias,
      if (selectedRoom?.alias) {
        setSearchQuery(selectedRoom.alias);
        return;
      }
      // otherwise it is the room floor name + the room name
      else {
        setSearchQuery(
          selectedRoom.floor.buildingCode + ' ' + selectedRoom.name,
        );
        return;
      }
    }

    // set the search query to empty when there is no room or building selected
    if (!selectedRoom && !building) {
      setSearchQuery('');
      return;
    }
  }, [building, selectedRoom]);

  // set the search query using room and building
  useEffect(() => {
    autoFillSearchQuery();
  }, [autoFillSearchQuery]);

  // focus on the input and clear text if the choose room mode changed to not null
  useEffect(() => {
    if (inputRef.current) {
      if (choosingRoomMode) {
        inputRef.current.focus();
        setSearchQuery('');
        dispatch(setSearchMode('rooms'));
      }
    }
  }, [choosingRoomMode, dispatch]);

  // focus on the input when search mode changed to not default room
  useEffect(() => {
    if (inputRef.current) {
      if (searchMode !== 'rooms') {
        inputRef.current.focus();
      }
    }
  }, [searchMode, dispatch]);

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
      dispatch(setRecommendedPath(null));
      dispatch(selectBuilding(null));
      dispatch(selectRoom(null));
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

  // focus on the input if command f is pressed
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (inputRef.current) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
          dispatch(setIsSearchOpen(true));
          inputRef.current.focus();
          event.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  const renderSearchQueryInput = () => {
    const renderCloseButton = () => (
      <IoIosClose
        title="Close"
        size={25}
        className="absolute right-3"
        onClick={handleCloseSearch}
      />
    );

    let icon = searchIcon;

    // check if the search bar is focused to determine icon
    if (isSearchOpen) {
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
          className="w-full rounded p-2 pr-6 outline-none"
          placeholder={placeholder}
          ref={inputRef}
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          title="Search query"
          onFocus={() => {
            dispatch(setIsSearchOpen(true));
          }}
        />

        {(isSearchOpen || searchQuery.length > 0) && renderCloseButton()}
      </div>
    );
  };

  const renderSearchResults = () => {
    return (
      <div className="z-10 mt-1 h-fit flex-1 overflow-y-scroll rounded bg-white opacity-100 transition-opacity duration-150 ease-in-out">
        <SearchResults map={map} query={searchQuery} />
      </div>
    );
  };

  return (
    <>
      {renderSearchQueryInput()}
      {isSearchOpen && renderSearchResults()}
    </>
  );
};

export default SearchBar;
