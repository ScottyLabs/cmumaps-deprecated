'use client';

import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

import React, { useEffect, useRef } from 'react';
import { getSelectorsByUserAgent } from 'react-device-detect';

import FloorSwitcher from '@/components/buildings/FloorSwitcher';
import MapDisplay from '@/components/buildings/MapDisplay';
import { zoomOnObject } from '@/components/buildings/mapUtils';
import InfoCard from '@/components/infocard/InfoCard';
import NavCard from '@/components/navigation/NavCard';
import SearchBar from '@/components/searchbar/SearchBar';
import { addFloorToSearchMap, setBuildings } from '@/lib/features/dataSlice';
import {
  claimBuilding,
  setFocusedFloor,
  setIsMobile,
  setRoomImageList,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building } from '@/types';

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
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const isMobile = useAppSelector((state) => state.ui.isMobile);
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const selectedBuilding = useAppSelector((state) => state.ui.selectedBuilding);

  useEffect(() => {
    // extract data from the url
    if (buildings && params.slug && params.slug.length > 0) {
      // first slug is the building code
      const code = params.slug[0];
      if (code.includes('-')) {
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

        dispatch(claimBuilding(building));
        zoomOnObject(mapRef, building.shapes.flat());
        dispatch(setFocusedFloor({ buildingCode, level: floorLevel }));
      } else {
        const buildingCode = code;
        dispatch(claimBuilding(buildings[buildingCode]));
      }
    }
  }, [buildings, dispatch, params.slug, router]);

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

      dispatch(setRoomImageList(roomImageList));
    };
    getRoomImageList();
  }, [dispatch]);

  // load the buidling and floor data
  useEffect(() => {
    if (!dispatch) {
      return;
    }

    const getBuildings = async () => {
      // set buildings
      const response = await fetch('/json/buildings.json');
      const buildings: Building[] = await response.json();
      dispatch(setBuildings(buildings));

      // set floors
      const promises = Object.values(buildings)
        .map((building) =>
          building.floors.map(async (floorLevel) => {
            // only loads GHC, WEH, and NSH for now
            if (!['GHC', 'WEH', 'NSH'].includes(building.code)) {
              return [null, null, null];
            }

            if (building.code == 'CUC' && floorLevel !== '2') {
              return [null, null, null];
            }

            const outlineResponse = await fetch(
              `/json/${building.code}/${building.code}-${floorLevel}-outline.json`,
            );
            const outlineJson = await outlineResponse.json();

            const searchRooms = outlineJson['rooms'];

            for (const roomId in searchRooms) {
              searchRooms[roomId]['id'] = roomId;
              delete searchRooms[roomId]['polygon'];
            }

            return [building.code, floorLevel, searchRooms];
          }),
        )
        .flat(2);

      Promise.all(promises).then((responses) => {
        responses.forEach(([buildingCode, floorLevel, searchRooms]) => {
          if (buildingCode) {
            dispatch(
              addFloorToSearchMap([buildingCode, floorLevel, searchRooms]),
            );
          }
        });
      });
    };

    getBuildings();
  }, [dispatch]);

  //#region Update the Page Title
  // update the page title - building
  useEffect(() => {
    if (selectedBuilding) {
      const title = `${selectedBuilding.name} - CMU Maps`;
      document.title = title;
    }
  }, [buildings, selectedBuilding]);

  // update the page title - floor
  useEffect(() => {
    if (buildings && focusedFloor) {
      const buildingCode = buildings[focusedFloor.buildingCode].code;
      const title = `${buildingCode} Floor ${focusedFloor.level} - CMU Maps`;
      document.title = title;
    }
  }, [buildings, focusedFloor, focusedFloor?.level]);

  //#endregion

  // update the URL
  useEffect(() => {
    if (selectedRoom) {
      let url = window.location.origin + '/';
      url += `${selectedRoom.floor}/${selectedRoom.id}`;
      window.history.pushState({}, '', url);
    } else if (focusedFloor) {
      let url = window.location.origin + '/';
      url += `${focusedFloor.buildingCode}`;
      url += `-${focusedFloor.level}`;
      window.history.pushState({}, '', url);
    } else if (selectedBuilding) {
      const url = window.location.origin + '/' + selectedBuilding.code;
      window.history.pushState({}, '', url);
    }
    // use window instead of the next router to prevent rezooming in
  }, [selectedRoom, focusedFloor, selectedBuilding]);

  const renderClerkIcon = () => {
    if (isMobile) {
      return (
        <div className="fixed right-2 bottom-10">
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
    <main className="relative h-screen">
      <div className="absolute z-10">
        {!isNavOpen && !isSearchOpen && <InfoCard />}
        {isNavOpen && <NavCard />}

        {focusedFloor && <FloorSwitcher focusedFloor={focusedFloor} />}

        <SearchBar
          mapRef={mapRef.current}
          userPosition={{
            x: points[points.length - 1][0],
            y: points[points.length - 1][1],
          }}
        />

        {renderClerkIcon()}
      </div>

      <MapDisplay mapRef={mapRef} points={points} />
    </main>
  );
};

export default Page;
