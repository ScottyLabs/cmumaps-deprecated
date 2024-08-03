'use client';

import { UserButton } from '@clerk/nextjs';
import Head from 'next/head';

import React, { useEffect, useRef, useState } from 'react';
import { getSelectorsByUserAgent } from 'react-device-detect';

import FloorSwitcher from '@/components/buildings/FloorSwitcher';
import MapDisplay from '@/components/buildings/MapDisplay';
import InfoCard from '@/components/infocard/InfoCard';
import NavCard from '@/components/navigation/NavCard';
import SearchBar from '@/components/searchbar/SearchBar';
import { addFloorToMap, setBuildings } from '@/lib/features/dataSlice';
import { setIsMobile, setRoomImageList } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, ID, Room } from '@/types';

const points = [[40.44249719447571, -79.94314319195851]];

interface Props {
  searchParams: {
    userAgent?: string;
  };
}

/**
 * The main page of the CMU Map website.
 */
const Page = ({ searchParams }: Props) => {
  const dispatch = useAppDispatch();

  const mapRef = useRef<mapkit.Map | null>(null);

  const [showRoomNames, setShowRoomNames] = useState(false);
  const focusedBuilding = useAppSelector((state) => state.ui.focusedBuilding);
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);

  // determine the device type
  const userAgent = searchParams.userAgent || '';
  const { isMobile } = getSelectorsByUserAgent(userAgent);
  useEffect(() => {
    const { isMobile } = getSelectorsByUserAgent(userAgent);
    dispatch(setIsMobile(isMobile));
  }, [userAgent, dispatch]);

  // loads the list of images of the rooms
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

  // Load the buidling and floor data
  useEffect(() => {
    const getBuildings = async () => {
      // set buildings
      const response = await fetch('/json/buildings.json');
      const buildings: Building[] = await response.json();
      dispatch(setBuildings(buildings));

      // set floors
      const promises = buildings
        .map((building) =>
          building.floors.map(async (floor) => {
            // only loads GHC, WEH, and CUC for now
            if (!['GHC', 'WEH', 'CUC'].includes(building.code)) {
              return [null, null];
            }

            if (building.code == 'CUC' && floor.level !== '2') {
              return [null, null];
            }

            const outlineResponse = await fetch(
              `/json/${building.code}/${building.code}-${floor.level}-outline.json`,
            );
            const outlineJson = await outlineResponse.json();

            const rooms: Record<ID, Room> = outlineJson['rooms'];

            for (const roomId in rooms) {
              rooms[roomId]['id'] = roomId;
              rooms[roomId]['floor'] = floor;
            }

            return [`${building.code}-${floor.level}`, outlineJson];
          }),
        )
        .flat(2);

      Promise.all(promises).then((responses) => {
        responses.forEach(([code, floorPlan]) => {
          if (code) {
            dispatch(addFloorToMap([code, floorPlan]));
          }
        });
      });
    };

    getBuildings();
  }, [dispatch]);

  const currentFloorName = focusedFloor?.level;

  // Compute the current page title
  let title = '';
  if (focusedBuilding) {
    title += focusedBuilding.name;
    if (currentFloorName) {
      title += ` ${currentFloorName}`;
    }
    title += ' — ';
  }
  title += 'CMU Map';

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
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Interactive map of the CMU campus" />
      </Head>
      <main className="relative h-screen">
        <div className="absolute z-10">
          {!isNavOpen && <InfoCard />}
          {isNavOpen && <NavCard />}

          {focusedBuilding && (
            <FloorSwitcher
              building={focusedBuilding}
              focusedFloor={focusedFloor}
            />
          )}

          <SearchBar
            mapRef={mapRef.current}
            userPosition={{
              x: points[points.length - 1][0],
              y: points[points.length - 1][1],
            }}
          />

          {renderClerkIcon()}
        </div>

        <MapDisplay
          mapRef={mapRef}
          points={points}
          setShowRoomNames={setShowRoomNames}
          showRoomNames={showRoomNames}
        />
      </main>
    </>
  );
};

export default Page;
