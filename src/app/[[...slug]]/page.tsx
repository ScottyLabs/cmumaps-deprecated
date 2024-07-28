'use client';

import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

import { UserButton } from '@clerk/nextjs';
import MapDisplay from '@/components/buildings/MapDisplay';
import FloorSwitcher, {
  getFloorIndexAtOrdinal,
} from '@/components/buildings/FloorSwitcher';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setFloorOrdinal, setRoomImageList } from '@/lib/features/uiSlice';
import SearchBar from '@/components/searchbar/SearchBar';
import InfoCard from '@/components/infocard/InfoCard';
import NavCard from '@/components/navigation/NavCard';

const points = [[40.44249719447571, -79.94314319195851]];

/**
 * The main page of the CMU Map website.
 */
export default function Home({ params }: { params: { slug: string } }) {
  const dispatch = useAppDispatch();

  const mapRef = useRef<mapkit.Map | null>(null);

  const [showFloor, setShowFloor] = useState(false);
  const [showRoomNames, setShowRoomNames] = useState(false);
  const floorOrdinal = useAppSelector((state) => state.ui.floorOrdinal);
  const focusedBuilding = useAppSelector((state) => state.ui.focusedBuilding);
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);

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

  const currentFloorName =
    floorOrdinal !== null &&
    focusedBuilding?.floors[
      getFloorIndexAtOrdinal(focusedBuilding, floorOrdinal)
    ]?.name;

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

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Interactive map of the CMU campus" />
      </Head>
      <main className="relative h-screen">
        <div className="absolute z-10">
          <h1 className="hidden">CMU Map</h1>

          {!isNavOpen && <InfoCard />}
          {isNavOpen && <NavCard />}

          {focusedBuilding && !!floorOrdinal && (
            <FloorSwitcher building={focusedBuilding} ordinal={floorOrdinal} />
          )}

          <SearchBar
            mapRef={mapRef.current}
            userPosition={[
              points[points.length - 1][0],
              points[points.length - 1][1],
            ]}
          />

          <div className="fixed right-2 top-2">
            <UserButton />
          </div>
        </div>

        <MapDisplay
          params={params}
          mapRef={mapRef}
          points={points}
          setShowFloor={setShowFloor}
          setShowRoomNames={setShowRoomNames}
          setFloorOrdinal={setFloorOrdinal}
          currentFloorName={currentFloorName}
          showFloor={showFloor}
          floorOrdinal={floorOrdinal}
          showRoomNames={showRoomNames}
        />
      </main>
    </>
  );
}
