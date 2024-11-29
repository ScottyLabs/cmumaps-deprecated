'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import questionMarkIcon from '@icons/question-mark.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';

import React, { useEffect, useRef } from 'react';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { Slide, toast, ToastContainer } from 'react-toastify';

import MapDisplay from '@/components/buildings/MapDisplay';
import {
  getRoomIdByNameAndFloor,
  zoomOnFloor,
  zoomOnRoomById,
} from '@/components/buildings/mapUtils';
import ToolBar from '@/components/toolbar/ToolBar';
import {
  setBuildings,
  setEateryData,
  setAvailableRoomImages,
  setSearchMap,
  setFloorPlanMap,
} from '@/lib/features/dataSlice';
import {
  setEndLocation,
  setIsNavOpen,
  setStartLocation,
  setUserPosition,
} from '@/lib/features/navSlice';
import {
  setIsMobile,
  selectBuilding,
  getIsCardOpen,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, BuildingCode, Floor, Room, RoomId } from '@/types';
import { decodeCoord, encodeCoord } from '@/util/coordEncoding';
import { getEateryData } from '@/util/eateryUtils';

// const mockUserPosition = [40.44249719447571, -79.94314319195851];
const FLOOR_REGEX = /^[A-F0-9]|LL|M|EV|PH/; // matches A-F, 0-9, and LL at the start of a string

interface Props {
  params: {
    slug?: string[];
  };
  searchParams: {
    src?: string;
    dst?: string;
    userAgent?: string;
  };
}

/**
 * The main page of the CMU Maps website.
 */
const Page = ({ params, searchParams }: Props) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const mapRef = useRef<mapkit.Map | null>(null);

  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const buildings = useAppSelector((state) => state.data.buildings);

  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const isMobile = useAppSelector((state) => state.ui.isMobile);
  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const selectedBuilding = useAppSelector((state) => state.ui.selectedBuilding);
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const isCardOpen = useAppSelector((state) => getIsCardOpen(state.ui));

  const startLocation = useAppSelector((state) => state.nav.startLocation);
  const endLocation = useAppSelector((state) => state.nav.endLocation);
  const userPosition = useAppSelector((state) => state.nav.userPosition);

  // serviceWorker for caching
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  }, []);

  // Identify posthog user with Clerk id
  const { isSignedIn, userId } = useAuth();
  const posthog = usePostHog();
  useEffect(() => {
    if (isSignedIn && userId) {
      posthog?.identify(userId);
    } else {
      posthog?.reset();
    }
  }, [posthog, isSignedIn, userId]);

  // extracting data from URL in the initial loading of the page
  // cmumaps.com/{buildingCode}-{roomName}?src={}&dst={}.
  useEffect(() => {
    // makes sure mapRef, buildings, and floorPlanMap are loaded
    if (!(mapRef.current && buildings && floorPlanMap)) {
      return;
    }

    interface ParsedData {
      buildingCode?: BuildingCode;
      floor?: Floor;
      roomId?: RoomId;
    }

    /**
     * Parse a string to retrieve its building code, floor, and room id.
     * @remarks Responsible for toasting errors.
     * @param input The string to parse
     * @returns Possibly null building code, floor, and room id.
     */
    const parseHelper = (input: string): ParsedData => {
      // the input is just the building code
      if (!input.includes('-')) {
        // validating the building code
        if (buildings[input]) {
          return { buildingCode: input };
        } else {
          toast.warn('Invalid building code!');
          return {};
        }
      }

      // extract buildingCode, roomName, and floorLevel
      // {buildingCode}-{roomName}
      const buildingCode = input.split('-')[0].toUpperCase();
      const roomName = input.split('-')[1];
      const floorLevel = roomName.match(FLOOR_REGEX)?.[0] || '';

      const building = buildings[buildingCode];

      // validating the building code
      if (!building) {
        toast.warn('Invalid building code!');
        return {};
      }

      // validating the floor level
      if (!building.floors.includes(floorLevel)) {
        toast.warn('Invalid floor level!');
        return { buildingCode };
      }

      const floor = { buildingCode, level: floorLevel };

      // if the room name is the floor level,
      // then the url is only up to floor level
      if (roomName.length == floorLevel.length) {
        return { buildingCode, floor };
      }

      // otherwise we can try to retrieve the room id
      const roomId = getRoomIdByNameAndFloor(
        roomName,
        floor,
        buildings,
        floorPlanMap,
      );

      // validating the room name
      if (!roomId) {
        toast.warn('Invalid room name!');
        return { buildingCode, floor };
      }

      return { buildingCode, floor, roomId };
    };

    // The selected room is parsed from
    //   - params.slug if there is a non-empty params.slug
    //   - the dst if the params.slug is empty
    //   - the src otherwise
    const dst = searchParams.dst;
    const src = searchParams.src;
    let path = dst || src;
    if (params.slug && params.slug.length > 0) {
      // need to use decodeURIComponent for characters such as ':'
      path = decodeURIComponent(params.slug[0]);
    }

    // the url is empty in this case
    if (!path) {
      return;
    }

    const { buildingCode, floor, roomId } = parseHelper(path);

    // either a romm or a building can be selected at the same time, not both
    if (buildingCode && !roomId) {
      dispatch(selectBuilding(buildings[buildingCode]));
    }

    // zoom on the room/floor
    if (floor) {
      if (roomId) {
        zoomOnRoomById(
          mapRef.current,
          roomId,
          floor,
          buildings,
          floorPlanMap,
          dispatch,
        );
      } else {
        zoomOnFloor(mapRef.current, buildings, floor, dispatch);
      }
    }

    // assign start/end nav locations.
    const assignNavHelper = (input: string | undefined, setLocation) => {
      if (!input) {
        return;
      }

      // only building code
      if (!input.includes('-') && buildings[input]) {
        dispatch(setLocation(buildings[input]));
      } else if (!input.includes('-')) {
        // the code is the user position
        if (input === 'user') {
          dispatch(setLocation({ userPosition }));
        } else {
          dispatch(setLocation({ waypoint: decodeCoord(input) }));
        }
      }

      // set location to room level if possible
      const { buildingCode, floor, roomId } = parseHelper(input);
      if (buildingCode && floor && roomId) {
        const building = buildings[buildingCode];

        // validating the building and floor level
        if (building && building.floors.includes(floor.level)) {
          const floorPlan = floorPlanMap[floor.buildingCode][floor.level];
          const room = floorPlan[roomId];
          dispatch(setLocation(room));
        }
      }
    };

    if (src || dst) {
      dispatch(setIsNavOpen(true));
      assignNavHelper(src, setStartLocation);
      assignNavHelper(dst, setEndLocation);
    }

    // userPosition shouldn't cause an update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mapRef,
    params.slug,
    searchParams,
    buildings,
    floorPlanMap,
    dispatch,
    router,
  ]);

  // determine the device type
  const userAgent = searchParams.userAgent || '';
  useEffect(() => {
    if (userAgent) {
      const { isMobile } = getSelectorsByUserAgent(userAgent);
      dispatch(setIsMobile(isMobile));
    }
  }, [userAgent, dispatch]);

  // get user position
  useEffect(() => {
    navigator?.geolocation?.getCurrentPosition((pos) => {
      const coord = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      dispatch(setUserPosition(coord));
    });
  }, [dispatch]);

  // load the list of images of the rooms
  useEffect(() => {
    const getRoomImageList = async () => {
      const res = await fetch('/assets/location_images/list_of_files.txt');
      const txt = await res.text();
      const lines = txt.trim().split('\n');

      const roomImageList: Record<string, string[]> = {};

      let curBuilding = '';

      for (const line of lines) {
        if (line.startsWith('├──')) {
          curBuilding = line.substring(4);
          roomImageList[curBuilding] = [];
        } else if (line.includes('.jpg')) {
          const curRoom = line.split(' ').at(-1);
          if (curRoom) {
            roomImageList[curBuilding].push(curRoom);
          }
        }
      }

      dispatch(setAvailableRoomImages(roomImageList));
    };
    getRoomImageList();
  }, [dispatch]);

  // load the eatery data
  useEffect(() => {
    getEateryData().then((eateryData) => dispatch(setEateryData(eateryData)));
  }, [dispatch]);

  // load the buildings and searchMap and floorPlanMap data
  useEffect(() => {
    if (!dispatch) {
      return;
    }

    // set buildings
    fetch('/cmumaps-data/buildings.json').then((response) =>
      response.json().then((buildings) => {
        dispatch(setBuildings(buildings));
      }),
    );

    // set searchMap
    fetch('/cmumaps-data/searchMap.json').then((response) =>
      response.json().then((searchMap) => {
        dispatch(setSearchMap(searchMap));
      }),
    );

    // set floorPlanMap
    fetch('/cmumaps-data/floorPlanMap.json').then((response) =>
      response.json().then((floorPlanMap) => {
        dispatch(setFloorPlanMap(floorPlanMap));
      }),
    );
  }, [dispatch]);

  // update the page title
  useEffect(() => {
    let title = 'CMU Maps';
    if (selectedRoom) {
      if (selectedRoom.alias) {
        title = `${selectedRoom.alias} - CMU Maps`;
      } else {
        title = `${selectedRoom.floor.buildingCode} ${selectedRoom.name} - CMU Maps`;
      }
    } else if (buildings && focusedFloor) {
      const buildingCode = buildings[focusedFloor.buildingCode].code;
      title = `${buildingCode} Floor ${focusedFloor.level} - CMU Maps`;
    } else if (selectedBuilding) {
      title = `${selectedBuilding.name} - CMU Maps`;
    }
    document.title = title;
  }, [buildings, selectedBuilding, focusedFloor, selectedRoom]);

  // update the URL
  useEffect(() => {
    let url = window.location.origin + '/';

    const roomToString = (room: Room) => {
      const floor = room.floor;
      return `${floor.buildingCode}-${room.name}`;
    };

    // selected/focused room, floor, building
    if (selectedRoom) {
      url += roomToString(selectedRoom);
    } else if (focusedFloor) {
      url += `${focusedFloor.buildingCode}`;
      url += `-${focusedFloor.level}`;
    } else if (selectedBuilding) {
      url += selectedBuilding.code;
    }

    // navigation
    const toString = (location: Room | Building) => {
      if ('id' in location) {
        return roomToString(location);
      } else {
        return location.code;
      }
    };

    if (startLocation) {
      if ('userPosition' in startLocation) {
        url += `?src=user`;
      } else if ('waypoint' in startLocation) {
        url += `?src=${encodeCoord(startLocation.waypoint)}`;
      } else {
        url += `?src=${toString(startLocation)}`;
      }
    }

    if (endLocation) {
      if (startLocation) {
        url += '&';
      } else {
        url += '?';
      }
      if ('userPosition' in endLocation) {
        url += `dst=user`;
      } else if ('waypoint' in endLocation) {
        url += `dst=${encodeCoord(endLocation.waypoint)}`;
      } else {
        url += `dst=${toString(endLocation)}`;
      }
    }

    window.history.pushState({}, '', url);
    // use window instead of the next router to prevent rezooming in
  }, [
    selectedRoom,
    focusedFloor,
    selectedBuilding,
    startLocation,
    endLocation,
  ]);

  const renderIcons = () => {
    // don't show icons if in mobile and either the search is open or the card is open
    if (isMobile && (isSearchOpen || isCardOpen)) {
      return <></>;
    }

    const renderClerkIcon = () => {
      if (isMobile) {
        return (
          <div className="fixed bottom-[7.5rem] right-3 flex items-center justify-center rounded-full bg-[#4b5563] p-2">
            <UserButton />
          </div>
        );
      } else {
        return (
          <div className="fixed right-6 top-14">
            <UserButton />
          </div>
        );
      }
    };

    const renderQuestionMarkIcon = () => {
      return (
        <div className="btn-shadow fixed bottom-[4.5rem] right-3 rounded-full sm:bottom-16 sm:right-3.5">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://docs.google.com/document/d/1jZeIij72ovf3K2J1J57rlD4pz3xnca3BfPedg9Ff1sc/edit"
          >
            <Image
              alt="Question Mark"
              src={questionMarkIcon}
              height={isMobile ? 43 : 50}
            />
          </a>
        </div>
      );
    };

    return (
      <>
        {renderClerkIcon()}
        {renderQuestionMarkIcon()}
      </>
    );
  };

  return (
    <main className="relative h-screen">
      <div className="absolute z-10">
        <ToolBar map={mapRef.current} />
      </div>

      <div className="fixed z-10">{renderIcons()}</div>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={true}
        closeOnClick
        theme="colored"
        transition={Slide}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      />
      <MapDisplay mapRef={mapRef} />
    </main>
  );
};

export default Page;
