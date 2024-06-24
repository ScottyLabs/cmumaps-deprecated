'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import {
  Coordinate,
  FeatureVisibility,
  Map,
  MapType,
  PointOfInterestCategory,
  Polyline,
} from 'mapkit-react';
import {
  AbsoluteCoordinate,
  Building,
  Export,
  Floor,
  FloorMap,
  Room,
} from '@/types';
import BuildingShape from '@/components/BuildingShape';
import FloorPlanOverlay, {
  getFloorCenter,
  positionOnMap,
} from '@/components/FloorPlanOverlay';
import { useIsDesktop } from '@/hooks/useWindowDimensions';

import useMapPosition from '@/hooks/useMapPosition';
import { isInPolygonCoordinates } from '@/geometry';
import { getFloorIndexAtOrdinal } from '@/components/FloorSwitcher';
// import { useRouter } from 'next/router';
import Toolbar from '@/components/searchbar/Toolbar';
import prefersReducedMotion from '@/util/prefersReducedMotion';
import { UserButton } from '@clerk/nextjs';
import { Door } from './api/findPath';
import { Placement } from '../types';

/**
 * The JSON file at this address contains all the map data used by the project.
 */
const exportFile = 'https://nicolapps.github.io/cmumap-data-mirror/export.json';

/**
 * The main page of the CMU Map website.
 */
export default function Home() {
  function min(x, y) {
    return x <= y ? x : y;
  }
  function max(x, y) {
    return x >= y ? x : y;
  }
  // const router = useRouter();
  const mapRef = useRef<mapkit.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const points = [[40.44249719447571, -79.94314319195851]];
  function error(err) {
    console.error(`ERROR(${err.code}): ${err.message}`);
  }
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  let currentBlueDot: undefined | mapkit.Overlay = undefined;
  useEffect(() => {
    if (!mapLoaded) return;
    const style = new mapkit.Style({
      lineWidth: 2, // 2 CSS pixels.
      strokeColor: '#999',
      fillColor: 'blue',
    });
    navigator.geolocation.watchPosition(
      (pos) => {
        if (currentBlueDot) mapRef.current?.removeOverlay(currentBlueDot);
        points.push([pos.coords.latitude, pos.coords.longitude]);
        const coord = new mapkit.Coordinate(
          pos.coords.latitude,
          pos.coords.longitude,
        );

        const circle = new mapkit.CircleOverlay(
          coord,
          max(min(20, pos.coords.accuracy), 30),
        );
        style.fillOpacity = min((pos.coords.altitude - 200) / 100, 0.5);
        circle.style = style;
        currentBlueDot = mapRef.current?.addOverlay(circle);
      },
      error,
      options,
    );
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          points.push([pos.coords.latitude, pos.coords.longitude]);
          const coord = new mapkit.Coordinate(
            pos.coords.latitude,
            pos.coords.longitude,
          );

          const circle = new mapkit.CircleOverlay(coord, 2);
          circle.style = style;
          mapRef.current?.addOverlay(circle);
        },
        error,
        options,
      );
    }, 500);
  }, [mapLoaded]);

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

  const currentFloorName =
    floorOrdinal !== null &&
    activeBuilding?.floors[getFloorIndexAtOrdinal(activeBuilding, floorOrdinal)]
      ?.name;

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

  const showRoom = (
    newRoom: Room,
    newBuilding: Building | null,
    convertToMap,
    updateMap: boolean,
  ) => {
    setActiveBuilding(newBuilding);
    if (newBuilding === null) {
      return;
    }

    if (updateMap) {
      const points: AbsoluteCoordinate[] = newRoom.shapes.flat();
      const coords: Coordinate[] = points.map((p) => convertToMap(p));
      const allLat = coords.map((c) => c.latitude);
      const allLon = coords.map((c) => c.longitude);

      console.log(allLat, allLon);

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
  };

  const zoomOnDefaultBuilding = (
    newBuildings: Building[] | null,
    newFloors: Floor[] | null,
  ) => {
    // Make sure that both buildings and the map are loaded
    if (!newBuildings || !mapRef.current) return;
    const r = new RegExp('-|#');
    // Handle the URL
    const [buildingCode, floorName] = (router.query?.slug?.[0] ?? '')
      .toUpperCase()
      .split(r);

    const roomid = router.query?.slug?.[1];

    const building: Building | null =
      buildingCode && newBuildings.find((b) => b.code === buildingCode)!;
    if (newFloors && roomid && floorName && building) {
      const floor = building.floors.find(({ name }) => name === floorName)!;
      const floorPlan = newFloors[`${building.code}-${floor.name}`];

      const { rooms, placement } = floorPlan;
      console.log(rooms, placement);
      // Compute the center position of the bounding box of the current floor
      // (Will be used as the rotation center)
      const center: AbsoluteCoordinate | undefined = getFloorCenter(rooms);
      const convertToMap = (absolute: AbsoluteCoordinate): Coordinate =>
        positionOnMap(absolute, placement, center);

      if (floor) {
        setFloorOrdinal(floor.ordinal);
      }
      if (floorPlan && roomid) {
        const room = floorPlan.rooms.find((room) => room.id === roomid);
        showRoom(room, building, convertToMap, true);
        setSelectedRoom(room);
        setBuildingAndRoom({ building, room });
        setIsCardOpen(true);
      } else {
        showBuilding(building, true);
      }
    } else if (building) {
      const floor = building.floors.find(({ name }) => name === floorName)!;
      if (floor) {
        setFloorOrdinal(floor.ordinal);
      } else {
        setFloorOrdinal(0);
      }
      showBuilding(building, true);
    } else {
      // Redirect to the default page
      router.push('/', undefined, { shallow: true });
    }
  };
  // Load the data from the API
  useEffect(() => {
    fetch(exportFile)
      .then((r) => r.json())
      .then((response: Export) => {
        setBuildings(response.buildings);
        setFloors(response.floors);

        zoomOnDefaultBuilding(response.buildings, response.floors);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the URL from the current floor
  useEffect(() => {
    if (!buildings) return;

    let url = '/';
    if (activeBuilding) url += `${activeBuilding.code}`;
    if (currentFloorName) url += `-${currentFloorName}`;
    if (buildingAndRoom.room) url += `/${buildingAndRoom.room.id}`;

    router.push(url, undefined, {
      shallow: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingAndRoom, activeBuilding, currentFloorName]);

  const initialRegion = useMemo(
    () => ({
      centerLatitude: 40.444,
      centerLongitude: -79.945,
      latitudeDelta: 0.006337455593801167,
      longitudeDelta: 0.011960061265583022,
    }),
    [],
  );

  const cameraBoundary = useMemo(
    () => ({
      centerLatitude: 40.44533940432823,
      centerLongitude: -79.9457060010195,
      latitudeDelta: 0.009258427149788417,
      longitudeDelta: 0.014410141520116326,
    }),
    [],
  );

  // React to pan/zoom events
  const { onRegionChangeStart, onRegionChangeEnd } = useMapPosition(
    (region, density) => {
      if (!buildings) return;

      const newShowFloors = density >= 200_000;
      setShowFloor(newShowFloors);
      setShowRoomNames(density >= 750_000);

      if (newShowFloors) {
        const center = {
          latitude: region.centerLatitude,
          longitude: region.centerLongitude,
        };
        const centerBuilding =
          buildings.find(
            (building: Building) =>
              building.hitbox &&
              isInPolygonCoordinates(building.hitbox, center),
          ) ?? null;

        showBuilding(centerBuilding, false);
      } else {
        setActiveBuilding(null);
        setFloorOrdinal(null);
      }
    },
    mapRef,
    initialRegion,
  );

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
      <main className={styles.main}>
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
        </div>
      </main>
    </>
  );
}

// Disable Next.js server-side rendering
// export async function getServerSideProps() {
//   return {
//     props: {},
//   };
// }
