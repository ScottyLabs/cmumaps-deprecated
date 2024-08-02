import {
  Coordinate,
  FeatureVisibility,
  Map,
  MapType,
  PointOfInterestCategory,
  Polyline,
} from 'mapkit-react';

import React, { useEffect, useMemo, useState } from 'react';
import { isDesktop } from 'react-device-detect';

import { node } from '@/app/api/findPath/route';
import { addFloorToMap, setBuildings } from '@/lib/features/dataSlice';
import {
  claimRoom,
  focusBuilding,
  setFocusedFloor,
  setIsSearchOpen,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate, Building, FloorMap, Room } from '@/types';
import { isInPolygonCoordinates } from '@/util/geometry';
import prefersReducedMotion from '@/util/prefersReducedMotion';

import useMapPosition from '../../hooks/useMapPosition';
import BuildingShape from './BuildingShape';
import FloorPlanOverlay, {
  getFloorCenter,
  positionOnMap,
} from './FloorPlanOverlay';

interface MapDisplayProps {
  mapRef: React.RefObject<mapkit.Map | null>;
  points: number[][];
  setShowRoomNames: (show: boolean) => void;
  showRoomNames: boolean;
}

const MapDisplay = ({
  mapRef,
  setShowRoomNames,
  showRoomNames,
}: MapDisplayProps) => {
  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const recommendedPath = useAppSelector((state) => state.nav.recommendedPath);
  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const floors = useAppSelector((state) => state.data.floorMap);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const focusedBuilding = useAppSelector((state) => state.ui.focusedBuilding);

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [showFloor, setShowFloor] = useState<boolean>(false);

  function zoomOnObject(points: Coordinate[]) {
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
  }

  const showBuilding = (newBuilding: Building | null, updateMap: boolean) => {
    dispatch(focusBuilding(newBuilding));
    if (newBuilding === null) {
      return;
    }

    if (updateMap) {
      // Updates viewbox based on OSM shape
      const points: Coordinate[] = newBuilding.shapes.flat();

      zoomOnObject(points);

      setShowFloor(true);
      setShowRoomNames(false);
    }
    // If no floor set, find default floor and set it to that
    if (!updateMap && !focusedFloor && newBuilding.floors.length > 0) {
      const floorLevel = newBuilding.defaultFloor;
      dispatch(
        setFocusedFloor({
          buildingCode: newBuilding.code,
          level: floorLevel,
        }),
      );
    }
  };

  const showRoom = (
    newRoom: Room,
    newBuilding: Building | null,
    convertToMap: (absolute: AbsoluteCoordinate) => Coordinate,
    updateMap: boolean,
  ) => {
    if (newBuilding === null) {
      return;
    }

    if (updateMap) {
      const points: AbsoluteCoordinate[] = newRoom.polygon.coordinates.flat();
      const coords: Coordinate[] = points.map((p) => convertToMap(p));
      zoomOnObject(coords);

      setShowFloor(true);
      setShowRoomNames(true);
    }
  };

  const zoomOnDefaultBuilding = (
    newBuildings: Building[],
    newFloors: FloorMap | null,
  ) => {
    // Gets from URL and sets the default building and floor and room

    // Make sure that both buildings and the map are loaded
    if (!newBuildings || !mapRef.current) {
      return;
    }

    // Get defaults from URL
    const [_, floor, roomid] = (window?.location?.pathname || '').split('/');
    const r = new RegExp('-|#');
    let [buildingCode, floorLevel] = floor.toUpperCase().split(r);
    console.log(
      'searchme',
      window?.location?.pathname,
      buildingCode,
      floorLevel,
      roomid,
    );
    // If building is not found, do nothing
    const building: Building | undefined = newBuildings.find(
      (b) => b.code === buildingCode,
    );
    if (!building) {
      window.history.pushState({}, '', window.location.origin);
      return;
    }

    // If floor is not specified, set it to the default floor
    if (!floorLevel) {
      floorLevel = building.defaultFloor.split('-')[1];
    }

    console.log('searchme1', floorLevel);
    dispatch(
      setFocusedFloor({ buildingCode: building.code, level: floorLevel }),
    );
    dispatch(focusBuilding(building));

    if (newFloors) {
      const floor = building.floors.find(({ name }) => name == floorLevel)!; // .find({ level } => level == floorLevel)! once replace file format
      const floorPlan = newFloors[`${building.code}-${floor.name}`];

      const { rooms, placement } = floorPlan;
      // Compute the center position of the bounding box of the current floor
      // (Will be used as the rotation center)
      const center: AbsoluteCoordinate | undefined = getFloorCenter(rooms);
      const convertToMap = (absolute: AbsoluteCoordinate): Coordinate =>
        positionOnMap(absolute, placement, center);

      // If we also have the room in the URL, focus on that
      if (floorPlan && roomid) {
        const room = floorPlan.rooms.find((room: Room) => room.id === roomid);
        room && dispatch(claimRoom(room));
        room && showRoom(room, building, convertToMap, true);
      } else {
        // Otherwise, zoom on the just the building
        showBuilding(building, true);
      }
    } else {
      showBuilding(building, true);
    }
  };

  // Update the URL from the current floor
  useEffect(() => {
    if (!buildings) {
      return;
    }

    let url = window.location.origin + '/';
    if (selectedRoom) {
      console.log(selectedRoom);
      url += `${selectedRoom.floor}/${selectedRoom.id}`;
    } else if (focusedBuilding) {
      url += `${focusedBuilding.code}`;

      if (focusedFloor) {
        url += `-${focusedFloor.level}`;
      }
    }
    window.history.pushState({}, '', url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom, focusedBuilding, focusedFloor]);

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
            // only loads GHC and WEH for now
            if (!['GHC', 'WEH'].includes(building.code)) {
              return [null, null];
            }
            const outlineResponse = await fetch(
              `/json/${building.code}/${building.code}-${floor.level}-outline.json`,
            );
            const outlineJson = await outlineResponse.json();

            for (const roomId in outlineJson['rooms']) {
              outlineJson['rooms'][roomId]['id'] = roomId;
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

  const cameraBoundary = useMemo(
    () => ({
      centerLatitude: 40.44533940432823,
      centerLongitude: -79.9457060010195,
      latitudeDelta: 0.009258427149788417,
      longitudeDelta: 0.014410141520116326,
    }),
    [],
  );

  const initialRegion = useMemo(
    () => ({
      centerLatitude: 40.444,
      centerLongitude: -79.945,
      latitudeDelta: 0.006337455593801167,
      longitudeDelta: 0.011960061265583022,
    }),
    [],
  );

  // React to pan/zoom events
  const { onRegionChangeStart, onRegionChangeEnd } = useMapPosition(
    (region, density) => {
      if (!buildings) {
        return;
      }

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
        dispatch(focusBuilding(null));
        console.log('searchme2', null);
        dispatch(setFocusedFloor(null));
      }
    },
    mapRef,
    initialRegion,
  );

  // render functions
  const renderBuildings = () =>
    buildings.map((building) => (
      <BuildingShape
        key={building.code}
        building={building}
        showName={!showFloor}
      />
    ));

  const renderFloors = () =>
    showFloor &&
    !!buildings &&
    !!floors &&
    buildings.flatMap((building: Building) =>
      building.floors.map((floor: { name: string; ordinal: number }) => {
        if (floor.name !== focusedFloor?.level) {
          // TODO: update this after update nicolas export
          return null;
        }

        const code = `${building.code}-${floor.name}`;
        if (code.substring(0, 3) != 'GHC' && code.substring(0, 3) != 'WEH') {
          return null;
        }
        const floorPlan = floors[code];
        return (
          floorPlan && (
            <FloorPlanOverlay
              key={code}
              floorPlan={floorPlan}
              showRoomNames={showRoomNames}
              isBackground={building.code !== focusedBuilding?.code}
            />
          )
        );
      }),
    );

  return (
    <Map
      ref={mapRef}
      token={process.env.NEXT_PUBLIC_MAPKITJS_TOKEN || ''}
      initialRegion={initialRegion}
      includedPOICategories={[PointOfInterestCategory.Restaurant]}
      cameraBoundary={cameraBoundary}
      minCameraDistance={100}
      maxCameraDistance={1500}
      showsUserLocationControl
      mapType={MapType.MutedStandard}
      paddingBottom={isDesktop ? 0 : 72}
      paddingLeft={4}
      paddingRight={4}
      paddingTop={10}
      showsZoomControl={isDesktop}
      showsCompass={
        isDesktop ? FeatureVisibility.Adaptive : FeatureVisibility.Hidden
      }
      allowWheelToZoom
      onLoad={() => {
        zoomOnDefaultBuilding(buildings, null);
        setMapLoaded(true);
      }}
      onRegionChangeStart={onRegionChangeStart}
      onRegionChangeEnd={onRegionChangeEnd}
      onClick={() => dispatch(setIsSearchOpen(false))}
    >
      {renderBuildings()}

      {renderFloors()}

      {recommendedPath && ( // This will be its own component at some point
        <Polyline
          points={(recommendedPath || []).map((n: node) =>
            positionOnMap(
              [n.pos.x, n.pos.y],
              {
                center: {
                  latitude: 40.44367399601104,
                  longitude: -79.94452069407168,
                },
                scale: 5.85,
                angle: 254,
              },
              [332.58, 327.18],
            ),
          )}
          selected={false}
          enabled={true}
          strokeColor={'red'}
          strokeOpacity={1}
          lineWidth={5}
        ></Polyline>
      )}
    </Map>
  );
};

export default MapDisplay;
