import {
  Coordinate,
  FeatureVisibility,
  Map,
  MapType,
  PointOfInterestCategory,
} from 'mapkit-react';

import React, { useEffect, useMemo, useState } from 'react';

import {
  claimBuilding,
  claimRoom,
  setFocusedFloor,
  setIsSearchOpen,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AbsoluteCoordinate, Building, BuildingCode, Room } from '@/types';
import { isInPolygonCoordinates } from '@/util/geometry';

import useMapPosition from '../../hooks/useMapPosition';
import NavLine from '../navigation/NavLine';
import BuildingShape from './BuildingShape';
import FloorPlanOverlay, { getFloorCenter } from './FloorPlanOverlay';
import { getBuildingDefaultFloorToFocus, zoomOnObject } from './mapUtils';

interface MapDisplayProps {
  params: {
    slug?: string[];
  };
  mapRef: React.RefObject<mapkit.Map | null>;
  points: number[][];
}

const MapDisplay = ({ params, mapRef }: MapDisplayProps) => {
  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const selectedBuilding = useAppSelector((state) => state.ui.selectedBuilding);
  const isMobile = useAppSelector((state) => state.ui.isMobile);

  const [showFloor, setShowFloor] = useState<boolean>(false);
  const [showRoomNames, setShowRoomNames] = useState(false);

  const showBuilding = (newBuilding: Building | null, updateMap: boolean) => {
    // dispatch(focusBuilding(newBuilding));
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

  // zoom on the selected building
  useEffect(() => {
    if (selectedBuilding) {
      zoomOnObject(mapRef, selectedBuilding?.shapes.flat());
    }
  }, [mapRef, selectedBuilding]);

  const zoomOnDefaultBuilding = (
    newBuildings: Record<BuildingCode, Building>,
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
    let [buildingCode, floorLevel]: [BuildingCode, any] = floor
      .toUpperCase()
      .split(r);
    console.log(
      'searchme',
      window?.location?.pathname,
      buildingCode,
      floorLevel,
      roomid,
    );
    // If building is not found, do nothing
    const building: Building | undefined = newBuildings[buildingCode];

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
    // dispatch(focusBuilding(building));

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
      const newShowFloors = density >= 200_000;
      setShowFloor(newShowFloors);
      setShowRoomNames(density >= 750_000);

      // if not show floor then set focused floor to null
      if (!newShowFloors) {
        dispatch(setFocusedFloor(null));
      }
      // if show floor then show the default floor of the centered building
      else {
        const center = {
          latitude: region.centerLatitude,
          longitude: region.centerLongitude,
        };

        const centerBuilding =
          Object.values(buildings).find(
            (building: Building) =>
              building.hitbox &&
              isInPolygonCoordinates(building.hitbox, center),
          ) ?? null;

        if (centerBuilding) {
          // only focus on the default floor of the center building if
          // either no floor is selected or we are focusing on a different building
          if (
            !focusedFloor ||
            buildings[focusedFloor.buildingCode].code != centerBuilding.code
          ) {
            dispatch(
              setFocusedFloor(getBuildingDefaultFloorToFocus(centerBuilding)),
            );
          }
        }
      }
    },
    mapRef,
    initialRegion,
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
      paddingBottom={isMobile ? 72 : 0}
      paddingLeft={4}
      paddingRight={4}
      paddingTop={10}
      showsZoomControl={!isMobile}
      showsCompass={
        isMobile ? FeatureVisibility.Hidden : FeatureVisibility.Adaptive
      }
      allowWheelToZoom
      onRegionChangeStart={onRegionChangeStart}
      onRegionChangeEnd={onRegionChangeEnd}
      onClick={() => dispatch(setIsSearchOpen(false))}
    >
      {buildings &&
        Object.values(buildings).map((building) => (
          <BuildingShape
            key={building.code}
            building={building}
            showName={!showFloor}
          />
        ))}

      {focusedFloor && <FloorPlanOverlay showRoomNames={showRoomNames} />}

      <NavLine />
    </Map>
  );
};

export default MapDisplay;
