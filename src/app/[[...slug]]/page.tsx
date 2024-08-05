'use client';

import { UserButton } from '@clerk/nextjs';

import React, { useEffect, useRef } from 'react';
import { getSelectorsByUserAgent } from 'react-device-detect';

import FloorSwitcher from '@/components/buildings/FloorSwitcher';
import MapDisplay from '@/components/buildings/MapDisplay';
import InfoCard from '@/components/infocard/InfoCard';
import NavCard from '@/components/navigation/NavCard';
import SearchBar from '@/components/searchbar/SearchBar';
import { addFloorToSearchMap, setBuildings } from '@/lib/features/dataSlice';
import { setIsMobile, setRoomImageList } from '@/lib/features/uiSlice';
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
  const dispatch = useAppDispatch();

  const mapRef = useRef<mapkit.Map | null>(null);

  const buildings = useAppSelector((state) => state.data.buildings);
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const isMobile = useAppSelector((state) => state.ui.isMobile);
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);

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
          building.floors.map(async (floor) => {
            // only loads GHC, WEH, and NSH for now
            if (!['GHC', 'WEH', 'NSH'].includes(building.code)) {
              return [null, null, null];
            }

            if (building.code == 'CUC' && floor.level !== '2') {
              return [null, null, null];
            }

            const outlineResponse = await fetch(
              `/json/${building.code}/${building.code}-${floor.level}-outline.json`,
            );
            const outlineJson = await outlineResponse.json();

            const searchRooms = outlineJson['rooms'];

            for (const roomId in searchRooms) {
              searchRooms[roomId]['id'] = roomId;
              delete searchRooms[roomId]['polygon'];
              delete searchRooms[roomId]['labelPosition'];
            }

            return [building.code, floor.level, searchRooms];
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

  // update the page title
  useEffect(() => {
    let title = '';
    if (focusedFloor) {
      title += buildings[focusedFloor.buildingCode].name;
      title += ` ${focusedFloor.level}`;
      title += ' — ';
    }
    title += 'CMU Maps';
    document.title = title;
  }, [buildings, focusedFloor, focusedFloor?.level]);

  // update the url
  useEffect(() => {
    let url = window.location.origin + '/';
    if (selectedRoom) {
      url += `${selectedRoom.floor}/${selectedRoom.id}`;
    } else if (focusedFloor) {
      url += `${focusedFloor.buildingCode}`;

      if (focusedFloor) {
        url += `-${focusedFloor.level}`;
      }
    }
    window.history.pushState({}, '', url);
  }, [selectedRoom, focusedFloor]);

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

      <MapDisplay params={params} mapRef={mapRef} points={points} />
    </main>
  );
};

export default Page;
