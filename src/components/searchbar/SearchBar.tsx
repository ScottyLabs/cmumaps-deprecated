import searchIcon from '@icons/search.svg';
import { Coordinate } from 'mapkit-react';
import Image from 'next/image';

import React, { useEffect, useRef, useState } from 'react';
import { IoIosClose } from 'react-icons/io';

import QuickSearch from '@/components/searchbar/QuickSearch';
import useEscapeKey from '@/hooks/useEscapeKey';
import { searchEvents } from '@/lib/apiRoutes';
import { setIsNavOpen, setRecommendedPath } from '@/lib/features/navSlice';
import { releaseRoom, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate, Building, Floor, Room } from '@/types';
import prefersReducedMotion from '@/util/prefersReducedMotion';

import { getFloorCenter, positionOnMap } from '../buildings/FloorPlanOverlay';
import SearchResults from './SearchResults';

interface Props {
  mapRef: mapkit.Map | null;
  userPosition: AbsoluteCoordinate;
}

const SearchBar = ({ mapRef, userPosition }: Props) => {
  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLInputElement>(null);

  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const buildings = useAppSelector((state) => state.data.buildings);

  const room = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.selectedBuilding);

  const floors = useAppSelector((state) => state.data.floorMap);

  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<JSX.Element | null>(null);
  const [eventsResults, setEventsResults] = useState<Event[]>([]);

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

  // close search if esc is pressed
  useEscapeKey(() => {
    dispatch(setIsSearchOpen(false));
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
      <div className="flex items-center rounded bg-white w-full p-1">
        <Image
          alt="Search Icon"
          src={searchIcon}
          className="size-4.5 invert ml-4 opacity-60"
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

  const onSelectRoom = (room: Room, building: Building, floor: Floor) => {
    if (!floors) {
      console.error('floors is null, but how?');
      return;
    }

    // dispatch(setFloorOrdinal(floor.ordinal));

    const { placement, rooms } = floors[`${building.code}-${floor.name}`];
    const center = getFloorCenter(rooms);
    const points: Coordinate[] = room.shapes
      .flat()
      .map((point: AbsoluteCoordinate) =>
        positionOnMap(point, placement, center),
      );
    const allLat = points.map((p) => p.latitude);
    const allLon = points.map((p) => p.longitude);

    mapRef?.setRegionAnimated(
      new mapkit.BoundingRegion(
        Math.max(...allLat),
        Math.max(...allLon),
        Math.min(...allLat),
        Math.min(...allLon),
      ).toCoordinateRegion(),
      !prefersReducedMotion(),
    );

    // setShowFloor(true);
    // setShowRoomNames(true);
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

  useEffect(() => {
    setTimeout(() => {
      setSearchResults(renderSearchResults());
      // searchEvents(searchQuery).then(setEventsResults);
    }, 500);
  }, [searchQuery]);

  // don't display anything before the buildings are loaded
  if (!buildings) {
    return;
  }
  return (
    <div
      id="SearchBar"
      className="box-shadow fixed top-4 z-10 w-full rounded mx-2 sm:w-96"
    >
      {renderSearchQueryInput()}
      {searchQuery == '' && (
        <div className="mt-3">
          <QuickSearch setQuery={setSearchQuery} />
        </div>
      )}
      {searchResults}
      {/* <p> ({eventsResults.toString()})</p> */}
    </div>
  );
};

export default SearchBar;
