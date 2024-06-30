import React, { useEffect, useMemo, useState } from 'react';
import BuildingShape from '../../components/building-display/BuildingShape';
import FloorPlanOverlay, {
  getFloorCenter,
  positionOnMap,
} from '../../components/building-display/FloorPlanOverlay';
import useMapPosition from '../../hooks/useMapPosition';
import { isInPolygonCoordinates } from '../../geometry';

import {
  Coordinate,
  FeatureVisibility,
  Map,
  MapType,
  PointOfInterestCategory,
  Polyline,
} from 'mapkit-react';
import { useIsDesktop } from '@/hooks/useWindowDimensions';
import prefersReducedMotion from '@/util/prefersReducedMotion';
import { AbsoluteCoordinate, Building, Export, Floor, Room } from '@/types';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { openCard, toggleCard } from '@/lib/features/ui/uiSlice';

/**
 * The JSON file at this address contains all the map data used by the project.
 */
const exportFile = 'https://nicolapps.github.io/cmumap-data-mirror/export.json';

function min(x, y) {
  return x <= y ? x : y;
}
function max(x, y) {
  return x >= y ? x : y;
}

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

const MapDisplay = ({
  params,
  mapRef,
  buildings,
  points,
  setActiveBuilding,
  setShowFloor,
  setShowRoomNames,
  setFloorOrdinal,
  buildingAndRoom,
  activeBuilding,
  currentFloorName,
  setSelectedRoom,
  setBuildingAndRoom,
  showBuilding,
  setBuildings,
  setFloors,
  recommendedPath,
  showFloor,
  setIsSearchOpen,
  floorOrdinal,
  floors,
  showRoomNames,
  isNavOpen,
  setNavSRoom,
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  const isCardOpen = useAppSelector((state) => state.ui.isCardOpen);
  const dispatch = useAppDispatch();

  let currentBlueDot: undefined | mapkit.Overlay = undefined;

  function error(err) {
    console.error(`ERROR(${err.code}): ${err.message}`);
  }

  useEffect(() => {
    if (!mapLoaded) {
      return;
    }
    const style = new mapkit.Style({
      lineWidth: 2, // 2 CSS pixels.
      strokeColor: '#999',
      fillColor: 'blue',
    });
    navigator.geolocation.watchPosition(
      (pos) => {
        if (currentBlueDot) {
          mapRef.current?.removeOverlay(currentBlueDot);
        }
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
    console.log('searchme', newBuildings, newFloors, mapRef.current);
    if (!newBuildings || !mapRef.current) {
      return;
    }
    const r = new RegExp('-|#');
    // Handle the URL
    const [buildingCode, floorName] = (params.slug?.[0] ?? '')
      .toUpperCase()
      .split(r);

    const roomid = params.slug?.[1];

    const building: Building | null =
      buildingCode && newBuildings.find((b) => b.code === buildingCode)!;
    if (newFloors && roomid && floorName && building) {
      const floor = building.floors.find(({ name }) => name === floorName)!;
      const floorPlan = newFloors[`${building.code}-${floor.name}`];

      const { rooms, placement } = floorPlan;
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
        dispatch(openCard());
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
      //   window.history.pushState({}, '', window.location.pathname);
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
    if (!buildings) {
      return;
    }

    let url = '/';
    if (activeBuilding) {
      url += `${activeBuilding.code}`;
    }
    if (currentFloorName) {
      url += `-${currentFloorName}`;
    }
    if (buildingAndRoom.room) {
      url += `/${buildingAndRoom.room.id}`;
    }
    // window.history.pushState({}, '', url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingAndRoom, activeBuilding, currentFloorName]);

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
        setActiveBuilding(null);
        setFloorOrdinal(null);
      }
    },
    mapRef,
    initialRegion,
  );

  const isDesktop = useIsDesktop();

  return (
    <Map
      ref={mapRef}
      // token={process.env.NEXT_PUBLIC_MAPKITJS_TOKEN!}
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
      showsZoomControl={!!isDesktop}
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
    >
      {recommendedPath && (
        <Polyline
          points={recommendedPath?.map((door) => door.pos)}
          selected={false}
          enabled={true}
          strokeColor={'red'}
          strokeOpacity={1}
          lineWidth={5}
        ></Polyline>
      )}
      {buildings &&
        buildings.map((building) => (
          <BuildingShape
            key={building.code}
            building={building}
            showName={!showFloor}
            toggleCard={(
              b: Building,
              r: Room | null,
              selectOrDeselect: boolean,
            ) => {
              /* Right now, the effect of this logic is that if you click on a pin,
               * you can change what room you've selected by clicking on other pins,
               * and deselect by clicking on a room body.
               * If you click on a body, you enter the same loop, but you can exit
               * by clicking on a pin
               * You can always exit by clicking outside
               */
              if (selectOrDeselect) {
                setIsSearchOpen(false);
              }
              if (buildingAndRoom.building != b) {
                dispatch(openCard());
                setBuildingAndRoom({
                  building: b || activeBuilding,
                  room: null,
                });
              } else if (!selectOrDeselect) {
                dispatch(toggleCard());
              }
            }}
          />
        ))}

      {showFloor &&
        buildings &&
        buildings.flatMap((building: Building) =>
          building.floors.map((floor: Floor) => {
            if (floor.ordinal !== floorOrdinal) {
              return null;
            }

            const code = `${building.code}-${floor.name}`;
            const floorPlan = floors[code];

            return (
              floorPlan && (
                <FloorPlanOverlay
                  key={code}
                  floorPlan={floorPlan}
                  showRoomNames={showRoomNames}
                  isBackground={building.code !== activeBuilding?.code}
                  toggleCard={(
                    b: Building,
                    r: Room,
                    selectOrDeselect: boolean,
                  ) => {
                    if (isNavOpen && r) {
                      setNavSRoom(r);
                    }

                    /* Right now, the effect of this logic is that if you click on a pin,
                     * you can change what room you've selected by clicking on other pins,
                     * and deselect by clicking on a room body.
                     * If you click on a body, you enter the same loop, but you can exit
                     * by clicking on a pin
                     * You can always exit by clicking outside
                     */

                    if (selectOrDeselect) {
                      setIsSearchOpen(false);
                    }
                    if (buildingAndRoom.room != r) {
                      dispatch(openCard());
                      setBuildingAndRoom({
                        building: b || activeBuilding,
                        room: r,
                      });
                    } else if (!selectOrDeselect) {
                      dispatch(toggleCard());
                    }
                  }}
                  recommendedPath={recommendedPath}
                  buildingAndRoom={buildingAndRoom}
                />
              )
            );
          }),
        )}
    </Map>
  );
};

export default MapDisplay;
