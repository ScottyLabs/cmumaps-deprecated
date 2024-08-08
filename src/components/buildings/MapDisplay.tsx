import {
  Coordinate,
  FeatureVisibility,
  Map,
  MapType,
  PointOfInterestCategory,
} from 'mapkit-react';

import React, { useState } from 'react';

import {
  deselectBuilding,
  releaseRoom,
  setFocusedFloor,
  setIsSearchOpen,
  setShowRoomNames,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building } from '@/types';
import { isInPolygonCoordinates } from '@/util/geometry';

import useMapPosition from '../../hooks/useMapPosition';
import NavLine from '../navigation/NavLine';
import BuildingShape from './BuildingShape';
import FloorPlanOverlay from './FloorPlanOverlay';

interface MapDisplayProps {
  mapRef: React.RefObject<mapkit.Map | null>;
  points: number[][];
}

//#region Constants
const THRESHOLD_DENSITY_TO_SHOW_FLOORS = 200_000;
const THRESHOLD_DENSITY_TO_SHOW_ROOMS = 600_000;

const cameraBoundary = {
  centerLatitude: 40.44533940432823,
  centerLongitude: -79.9457060010195,
  latitudeDelta: 0.009258427149788417,
  longitudeDelta: 0.014410141520116326,
};

const initialRegion = {
  centerLatitude: 40.444,
  centerLongitude: -79.945,
  latitudeDelta: 0.006337455593801167,
  longitudeDelta: 0.011960061265583022,
};
//#endregion

const MapDisplay = ({ mapRef }: MapDisplayProps) => {
  const dispatch = useAppDispatch();

  const buildings = useAppSelector((state) => state.data.buildings);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const isMobile = useAppSelector((state) => state.ui.isMobile);

  const [visibleBuildings, setVisibleBuildings] = useState<Building[]>([]);

  // React to pan/zoom events
  const { onRegionChangeStart, onRegionChangeEnd } = useMapPosition(
    (region, density) => {
      if (!buildings) {
        return;
      }
      const boundingBox = {
        minLatitude: region.centerLatitude - region.latitudeDelta / 2,
        maxLatitude: region.centerLatitude + region.latitudeDelta / 2,
        minLongitude: region.centerLongitude - region.longitudeDelta / 2,
        maxLongitude: region.centerLongitude + region.longitudeDelta / 2,
      };

      const buildingsToFocus = Object.values(buildings).filter((building) => {
        const [buildingLats, buildingLongs] = building.shapes[0].reduce(
          (acc: [number[], number[]], point: Coordinate) => {
            acc[0].push(point.latitude);
            acc[1].push(point.longitude);
            return acc;
          },
          [[], []],
        );
        const isInLat = (value: number) =>
          value >= boundingBox.minLatitude && value <= boundingBox.maxLatitude;
        const isInLong = (value: number) =>
          value >= boundingBox.minLongitude &&
          value <= boundingBox.maxLongitude;
        const anyLatIn =
          isInLat(Math.min(...buildingLats)) ||
          isInLat(Math.max(...buildingLats));
        const anyLongIn =
          isInLong(Math.min(...buildingLongs)) ||
          isInLong(Math.max(...buildingLongs));
        return anyLatIn && anyLongIn;
      });

      setVisibleBuildings(buildingsToFocus);

      const showFloor = density >= THRESHOLD_DENSITY_TO_SHOW_FLOORS;
      dispatch(setShowRoomNames(density >= THRESHOLD_DENSITY_TO_SHOW_ROOMS));

      // there is no focused floor if we are not showing floors
      if (!showFloor) {
        dispatch(setFocusedFloor(null));
      }
      // if we are showing floor, we will show the default floor of the centered building
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
            const newFocusFloor = {
              buildingCode: centerBuilding.code,
              level: centerBuilding.defaultFloor,
            };

            dispatch(setFocusedFloor(newFocusFloor));
          }
        }
      }
    },
    mapRef,
    initialRegion,
  );

  // DO NOT DELETE THIS MYSTERIOUS CODE IT HELPS THE PINS TO LOAD FASTER
  // The working theory on why this works is that without any annotations, mapkit deletes the annotation layer
  // so when we want to conjure the pins, we need to create a new annotation layer, which takes ~3s for no apparent reason
  const handleLoad = () => {
    if (!mapRef.current) {
      return;
    }

    const randomCoordinate = new mapkit.Coordinate(40.444, -79.945);
    const pinOptions = {
      url: {
        1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Blank_square.svg/2048px-Blank_square.svg.png',
      },
      size: { width: 0, height: 0 },
    };
    const pinAnnotation = new mapkit.ImageAnnotation(
      randomCoordinate,
      pinOptions,
    );
    mapRef.current?.addAnnotation(pinAnnotation);
  };

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
      onClick={() => {
        dispatch(setIsSearchOpen(false));
        dispatch(deselectBuilding());
        dispatch(releaseRoom(null));
      }}
      onLoad={handleLoad}
    >
      {buildings &&
        Object.values(buildings).map((building) => (
          <BuildingShape key={building.code} building={building} />
        ))}

      {focusedFloor && <FloorPlanOverlay visibleBuildings={visibleBuildings} />}

      <NavLine />
    </Map>
  );
};

export default MapDisplay;
