/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import React, { useRef, useState } from 'react';
import Head from 'next/head';
import styles from '@/styles/Home.module.css';

import { AbsoluteCoordinate, Building, FloorMap, Room } from '../../types';

import { useIsDesktop } from '../../hooks/useWindowDimensions';

import getFloorIndexAtOrdinal, {
  getFloorCenter,
  positionOnMap,
} from '../../components/building-display/FloorPlanOverlay';
import prefersReducedMotion from '../../util/prefersReducedMotion';
import { UserButton } from '@clerk/nextjs';
// import { Door } from "api/findPath";
import Toolbar from '../../components/searchbar/Toolbar';
import MapDisplay from '@/components/building-display/MapDisplay';
import { Coordinate } from 'mapkit-react';

const points = [[40.44249719447571, -79.94314319195851]];

/**
 * The main page of the CMU Map website.
 */
export default function Home({ params }: { params: { slug: string } }) {
  const mapRef = useRef<mapkit.Map | null>(null);

  const [buildings, setBuildings] = useState<Building[] | null>(null);

  const [showFloor, setShowFloor] = useState(false);
  const [showRoomNames, setShowRoomNames] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [buildingAndRoom, setBuildingAndRoom] = useState<{
    building: Building | null;
    room: Room | null;
  }>({ building: null, room: null });

  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [floorOrdinal, setFloorOrdinal] = useState<number | null>(null);

  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [navSRoom, setNavSRoom] = useState<Room | undefined>(undefined);
  const [navERoom, setNavERoom] = useState<Room | undefined>(undefined);
  const [recommendedPath, setRecommendedPath] = useState<Door[] | null>(null);

  const isDesktop = useIsDesktop();

  const [floors, setFloors] = useState<FloorMap>({});

  const showBuilding = (newBuilding: Building | null, updateMap: boolean) => {
    setActiveBuilding(newBuilding);
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
    setFloorOrdinal((currentFloorOrdinal) =>
      currentFloorOrdinal === null && newBuilding.floors.length > 0
        ? newBuilding.floors.find(
            (floor) => floor.name === newBuilding.defaultFloor,
          )!.ordinal
        : currentFloorOrdinal,
    );
  };

  const currentFloorName =
    floorOrdinal !== null &&
    activeBuilding?.floors[getFloorIndexAtOrdinal(activeBuilding, floorOrdinal)]
      ?.name;

  // Compute the current page title
  let title = '';
  if (activeBuilding) {
    title += activeBuilding.name;
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
        <h1 className="visually-hidden">CMU Map</h1>
        <Toolbar
          buildings={buildings}
          floorMap={floors}
          activeBuilding={activeBuilding}
          floorOrdinal={floorOrdinal}
          setFloorOrdinal={setFloorOrdinal}
          isSearchOpen={isSearchOpen}
          onSetIsSearchOpen={setIsSearchOpen}
          onSelectBuilding={(building) => {
            setFloorOrdinal(null);
            showBuilding(building, true);
            setIsCardOpen(true);
            setBuildingAndRoom({ building, room: null });
          }}
          onSelectRoom={(room, building, floor) => {
            setFloorOrdinal(floor.ordinal);
            setActiveBuilding(building);
            setSelectedRoom(room);

            const { placement, rooms } =
              floors[`${building.code}-${floor.name}`]!;
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

            setIsCardOpen(true);
            setBuildingAndRoom({ building, room });
          }}
          buildingAndRoom={buildingAndRoom}
          isCardOpen={isCardOpen}
          userPosition={{
            x: points[points.length - 1][0],
            y: points[points.length - 1][1],
          }}
          setNavERoom={setNavERoom}
          setNavSRoom={setNavSRoom}
          setIsCardOpen={setIsCardOpen}
          navERoom={navERoom}
          navSRoom={navSRoom}
          isNavOpen={isNavOpen}
          setIsNavOpen={setIsNavOpen}
          setRecommendedPath={setRecommendedPath}
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
          <div
            style={{
              position: 'fixed',
              zIndex: '100',
              right: '0',
              height: '10%',
              padding: '20px',
            }}
          >
            <UserButton></UserButton>
          </div>

          <MapDisplay
            params={params}
            mapRef={mapRef}
            buildings={buildings}
            points={points}
            setActiveBuilding={setActiveBuilding}
            setShowFloor={setShowFloor}
            setShowRoomNames={setShowRoomNames}
            setFloorOrdinal={setFloorOrdinal}
            buildingAndRoom={buildingAndRoom}
            activeBuilding={activeBuilding}
            currentFloorName={currentFloorName}
            setSelectedRoom={setSelectedRoom}
            setBuildingAndRoom={setBuildingAndRoom}
            setIsCardOpen={setIsCardOpen}
            showBuilding={showBuilding}
            setBuildings={setBuildings}
            setFloors={setFloors}
            recommendedPath={recommendedPath}
            showFloor={showFloor}
            setIsSearchOpen={setIsSearchOpen}
            isCardOpen={isCardOpen}
            floorOrdinal={floorOrdinal}
            floors={floors}
            showRoomNames={showRoomNames}
            isNavOpen={isNavOpen}
            setNavSRoom={setNavSRoom}
          />
        </div>
      </main>
    </>
  );
}
