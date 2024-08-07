import {
  FeatureVisibility,
  Map,
  MapType,
  PointOfInterestCategory,
} from 'mapkit-react';

import React from 'react';

import {
  deselectBuilding,
  releaseRoom,
  setFocusedFloor,
  setIsSearchOpen,
  setShowFloor,
  setShowRoomNames,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building } from '@/types';
import { isInPolygonCoordinates } from '@/util/geometry';

import useMapPosition from '../../hooks/useMapPosition';
import NavLine from '../navigation/NavLine';
import BuildingShape from './BuildingShape';
import FloorPlanOverlay from './FloorPlanOverlay';
import { getBuildingDefaultFloorToFocus } from './mapUtils';

interface MapDisplayProps {
  mapRef: React.RefObject<mapkit.Map | null>;
  points: number[][];
}

//#region Constants
const THRESHOLD_DENSITY_TO_SHOW_FLOORS = 200_000;
const THRESHOLD_DENSITY_TO_SHOW_ROOMS = 750_000;

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
  const showFloor = useAppSelector((state) => state.ui.showFloor);

  // React to pan/zoom events
  const { onRegionChangeStart, onRegionChangeEnd } = useMapPosition(
    (region, density) => {
      if (!buildings) {
        return;
      }

      const newShowFloors = density >= THRESHOLD_DENSITY_TO_SHOW_FLOORS;
      dispatch(setShowFloor(newShowFloors));
      dispatch(setShowRoomNames(density >= THRESHOLD_DENSITY_TO_SHOW_ROOMS));

      // there is no focused floor if we are not showing floors
      if (!newShowFloors) {
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
            dispatch(
              setFocusedFloor(getBuildingDefaultFloorToFocus(centerBuilding)),
            );

            // // we should also show the building card when focus on the center buidling
            // dispatch(
            //   claimBuilding(getBuildingDefaultFloorToFocus(centerBuilding)),
            // );
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
          <BuildingShape
            key={building.code}
            building={building}
            showFloor={showFloor}
          />
        ))}

      {focusedFloor && <FloorPlanOverlay />}

      <NavLine />
    </Map>
  );
};

export default MapDisplay;
