/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import React, { useRef, useState } from 'react';
import Head from 'next/head';
import styles from '@/styles/Home.module.css';

import { AbsoluteCoordinate, Building } from '../../types';

import { useIsDesktop } from '../../hooks/useWindowDimensions';

import {
  getFloorCenter,
  positionOnMap,
} from '../../components/building-display/FloorPlanOverlay';
import prefersReducedMotion from '../../util/prefersReducedMotion';
import { UserButton } from '@clerk/nextjs';
import MapDisplay from '@/components/building-display/MapDisplay';
import { Coordinate } from 'mapkit-react';
import FloorSwitcher, {
  getFloorIndexAtOrdinal,
} from '@/components/building-display/FloorSwitcher';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { focusBuilding, setFloorOrdinal } from '@/lib/redux/uiSlice';
import SearchBar from '@/components/search-bar/SearchBar';
import InfoCard from '@/components/info-card/InfoCard';
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
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const floors = useAppSelector((state) => state.data.floorMap);
  const isDesktop = useIsDesktop();

  const focusedBuilding = useAppSelector((state) => state.ui.focusedBuilding);
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);

  const showBuilding = (newBuilding: Building | null, updateMap: boolean) => {
    dispatch(focusBuilding(newBuilding));
    if (newBuilding === null) {
      return;
    }

    if (updateMap) {
      const points: Coordinate[] = newBuilding.shapes.flat();
      const allLat = points.map((p) => p.latitude);
      const allLon = points.map((p) => p.longitude);

      mapRef.current?.setRegionAnimated(
        new mapkit.BoundingRegion(
          Math.max(...allLat),
          Math.max(...allLon),
          Math.min(...allLat),
          Math.min(...allLon),
        ).toCoordinateRegion(),
        !prefersReducedMotion(),
      );

      setShowFloor(true);
      setShowRoomNames(false);
    }
    dispatch(
      setFloorOrdinal(
        floorOrdinal === null && newBuilding.floors.length > 0
          ? newBuilding.floors.find(
              (floor) => floor.name === newBuilding.defaultFloor,
            )!.ordinal
          : floorOrdinal,
      ),
    );
  };

  const onSelectRoom = (room, building, floor) => {
    dispatch(setFloorOrdinal(floor.ordinal));

    const { placement, rooms } = floors[`${building.code}-${floor.name}`]!;
    const center = getFloorCenter(rooms);
    const points: Coordinate[] = room.shapes
      .flat()
      .map((point: AbsoluteCoordinate) =>
        positionOnMap(point, placement, center),
      );
    const allLat = points.map((p) => p.latitude);
    const allLon = points.map((p) => p.longitude);

    mapRef.current?.setRegionAnimated(
      new mapkit.BoundingRegion(
        Math.max(...allLat),
        Math.max(...allLon),
        Math.min(...allLat),
        Math.min(...allLon),
      ).toCoordinateRegion(),
      !prefersReducedMotion(),
    );

    setShowFloor(true);
    setShowRoomNames(true);
  };

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
        <h1 className="hidden">CMU Map</h1>

        {!isNavOpen && <InfoCard />}
        {isNavOpen && <NavCard />}
        {focusedBuilding && floorOrdinal && (
          <FloorSwitcher
            building={focusedBuilding}
            ordinal={floorOrdinal}
            isToolbarOpen={isSearchOpen}
          />
        )}

        <SearchBar
          onSelectRoom={onSelectRoom}
          userPosition={[
            points[points.length - 1][0],
            points[points.length - 1][1],
          ]}
        />

        <div
          className={styles['map-wrapper']}
          ref={(node) =>
            node &&
            (isSearchOpen && !isDesktop
              ? node.setAttribute('inert', '')
              : node.removeAttribute('inert'))
          }
        >
          {/* <div
            style={{
              position: 'fixed',
              zIndex: '100',
              right: '0',
              height: '10%',
              padding: '20px',
            }}
          >
            <UserButton></UserButton>
          </div> */}

          <MapDisplay
            params={params}
            mapRef={mapRef}
            points={points}
            setShowFloor={setShowFloor}
            setShowRoomNames={setShowRoomNames}
            setFloorOrdinal={setFloorOrdinal}
            currentFloorName={currentFloorName}
            showBuilding={showBuilding}
            showFloor={showFloor}
            floorOrdinal={floorOrdinal}
            showRoomNames={showRoomNames}
          />
        </div>
      </main>
    </>
  );
}
