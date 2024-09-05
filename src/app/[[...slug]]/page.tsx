'use client';

import { UserButton } from '@clerk/nextjs';
import questionMarkIcon from '@icons/question-mark.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import React, { useEffect, useRef } from 'react';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { Slide, ToastContainer } from 'react-toastify';

import MapDisplay from '@/components/buildings/MapDisplay';
import { zoomOnObject, zoomOnRoom } from '@/components/buildings/mapUtils';
import ToolBar from '@/components/toolbar/ToolBar';
import {
  setBuildings,
  setEateryData,
  setAvailableRoomImages,
  setSearchMap,
  setFloorPlanMap,
} from '@/lib/features/dataSlice';
import { setUserPosition } from '@/lib/features/navSlice';
import {
  setFocusedFloor,
  setIsMobile,
  selectBuilding,
  getIsCardOpen,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Room } from '@/types';
import { getEateryData } from '@/util/eateryUtils';

// const mockUserPosition = [40.44249719447571, -79.94314319195851];

interface Props {
  params: {
    slug?: string[];
  };
  searchParams: {
    userAgent?: string;
  };
}

/**
 * The main page of the CMU Map website.
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

  // extracting data in the initial loading of the page
  useEffect(() => {
    // makes all required things are loaded
    if (mapRef.current && buildings && params.slug && params.slug.length > 0) {
      const code = params.slug[0];
      if (!code.includes('-')) {
        // only building code
        const buildingCode = code;
        dispatch(selectBuilding(buildings[buildingCode]));
      } else {
        // Can be room name "5314" or floor name "5"
        const [buildingCode, roomOrFloorName] = code.split('-');

        // validation of the building code
        const building = buildings[buildingCode];
        if (!building) {
          router.push('/');
          return;
        }

        // Extracting floor level from room name or floor level
        const floorRegexStr = building.floors.map((floor) => floor).join('|');
        const floorRegex = new RegExp(floorRegexStr);
        const floorLevel = roomOrFloorName.match(floorRegex)?.[0];
        // validation of floor level
        if (!floorLevel) {
          router.push(buildingCode);
          return;
        }

        // Dont check this earlier so we can zoom on a building before the floorplan is loaded
        if (!Object.keys(floorPlanMap).length) {
          return;
        }
        // Retrieve room with name roomName / check if it exists
        const roomName = roomOrFloorName;
        const room = Object.values(
          floorPlanMap[buildingCode.toUpperCase()][floorLevel],
        ).find((r: Room) => r.name === roomName);

        const floor = { buildingCode, level: floorLevel };
        // if the room name is not provided, then zoom to the floor level
        if (!room) {
          dispatch(selectBuilding(building));
          zoomOnObject(mapRef.current, building.shapes.flat());
          dispatch(setFocusedFloor(floor));
        } else {
          zoomOnRoom(mapRef.current, room, dispatch);
        }
      }
    }
  }, [buildings, dispatch, params.slug, router, mapRef, floorPlanMap]);

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
      response.json().then((buildings) => dispatch(setBuildings(buildings))),
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
    if (selectedRoom) {
      const floor = selectedRoom.floor;
      url += `${floor.buildingCode}-${selectedRoom.name}`;
    } else if (focusedFloor) {
      url += `${focusedFloor.buildingCode}`;
      url += `-${focusedFloor.level}`;
    } else if (selectedBuilding) {
      url += selectedBuilding.code;
    }
    window.history.pushState({}, '', url);
    // use window instead of the next router to prevent rezooming in
  }, [selectedRoom, focusedFloor, selectedBuilding]);

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
        {/* {isMobile && (
          <div className="fixed bottom-16 right-2 size-10 cursor-pointer rounded-full bg-black">
            <Image alt="Schedule" src={scheduleIcon} />
          </div>
        )} */}
      </>
    );
  };

  return (
    <main className="relative h-screen">
      <div className="absolute z-10">
        <ToolBar map={mapRef.current} />

        {renderIcons()}

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
      </div>

      <MapDisplay mapRef={mapRef} />
    </main>
  );
};

export default Page;
