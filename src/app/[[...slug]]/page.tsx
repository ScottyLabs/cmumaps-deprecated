'use client';

import { UserButton } from '@clerk/nextjs';
import questionMarkIcon from '@icons/question-mark.png';
import scheduleIcon from '@icons/schedule.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import React, { useEffect, useRef } from 'react';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { Slide, ToastContainer } from 'react-toastify';

import MapDisplay from '@/components/buildings/MapDisplay';
import { zoomOnObject, zoomOnRoom } from '@/components/buildings/mapUtils';
import ToolBar from '@/components/toolbar/ToolBar';
import { getFloorPlan } from '@/lib/apiRoutes';
import {
  setBuildings,
  setEateryData,
  setAvailableRoomImages,
  setSearchMap,
} from '@/lib/features/dataSlice';
import {
  setFocusedFloor,
  setIsMobile,
  selectBuilding,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getEateryData } from '@/util/eateryUtils';

const points = [[40.44249719447571, -79.94314319195851]];

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

  const buildings = useAppSelector((state) => state.data.buildings);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const isMobile = useAppSelector((state) => state.ui.isMobile);
  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const selectedBuilding = useAppSelector((state) => state.ui.selectedBuilding);

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
        // at least floor level
        const buildingCode = code.split('-')[0];
        const floorLevel = code.split('-')[1];

        const building = buildings[buildingCode];

        // validations on the building code
        if (!building) {
          router.push('/');
          return;
        }

        // validations on the floor level
        if (!building.floors.includes(floorLevel)) {
          router.push(buildingCode);
          return;
        }

        const floor = { buildingCode, level: floorLevel };
        const roomId = params.slug[1];

        if (!roomId) {
          // up to floor level
          dispatch(selectBuilding(building));
          zoomOnObject(mapRef.current, building.shapes.flat());
          dispatch(setFocusedFloor(floor));
        } else {
          // up to room level
          getFloorPlan(floor).then((floorPlan) => {
            // be careful of floor plans that doesn't have placements !!!
            if (floorPlan?.placement) {
              const room = floorPlan.rooms[roomId];
              if (room) {
                if (mapRef.current) {
                  zoomOnRoom(mapRef.current, room, floor, floorPlan, dispatch);
                }
              }
            }
          });
        }
      }
    }
  }, [buildings, dispatch, params.slug, router, mapRef]);

  // determine the device type
  const userAgent = searchParams.userAgent || '';
  useEffect(() => {
    if (userAgent) {
      const { isMobile } = getSelectorsByUserAgent(userAgent);
      dispatch(setIsMobile(isMobile));
    }
  }, [userAgent, dispatch]);

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

  // load the buidling and floor data
  useEffect(() => {
    if (!dispatch) {
      return;
    }
    // set buildings
    fetch('/json/buildings.json').then((response) =>
      response.json().then((buildings) => dispatch(setBuildings(buildings))),
    );

    // set searchMap
    fetch('/json/searchMap.json').then((response) =>
      response.json().then((buildings) => dispatch(setSearchMap(buildings))),
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
      url += `${floor.buildingCode}-${floor.level}/${selectedRoom.id}`;
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
    const renderClerkIcon = () => {
      if (isMobile) {
        return (
          <div className="fixed bottom-10 right-2">
            <UserButton />
          </div>
        );
      } else {
        return (
          <div className="fixed right-2 top-2">
            <UserButton />
          </div>
        );
      }
    };

    return (
      <>
        {renderClerkIcon()}
        <div className="fixed bottom-16 right-3">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://docs.google.com/document/d/1mirPykjHd0catOj0PShZEil6EsoF1HgQW02tOO2ZnWs/edit#heading=h.j3w4ch974od3"
          >
            <Image alt="Question Mark" src={questionMarkIcon} height={45} />
          </a>
        </div>
        {isMobile && (
          <div className="fixed bottom-16 right-2 size-10 cursor-pointer rounded-full bg-black">
            <Image alt="Schedule" src={scheduleIcon} />
          </div>
        )}
      </>
    );
  };

  return (
    <main className="relative h-screen">
      <div className="absolute z-10">
        <ToolBar
          map={mapRef.current}
          userPosition={{
            x: points[points.length - 1][0],
            y: points[points.length - 1][1],
          }}
        />

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

      <MapDisplay mapRef={mapRef} points={points} />
    </main>
  );
};

export default Page;
