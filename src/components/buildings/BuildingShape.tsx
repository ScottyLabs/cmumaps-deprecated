import { Annotation, Polygon } from 'mapkit-react';

import React from 'react';

import {
  setChoosingRoomMode,
  setEndLocation,
  setStartLocation,
} from '@/lib/features/navSlice';
import { selectBuilding, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building } from '@/types';

import Roundel from '../shared/Roundel';
import { zoomOnObject } from './mapUtils';

interface BuildingShapeProps {
  map: mapkit.Map;
  building: Building;
}

const buildingCodeToShapeFillColor = {
  MOE: '#fde047',
  STE: '#307454',
  MUD: '#6900a9',
  MOR: '#FED97B',
  DON: '#0025a9',

  FBA: '#F28B5F',

  SCO: '#a90000',
  WEL: '#a90000',
  BOS: '#a90000',
  MCG: '#a90000',
  HEN: '#a90000',

  HAM: '#6C1515',
  ROS1: '#6C1515',
  ROS2: '#6C1515',
  ROS3: '#6C1515',
  SPT: '#6C1515',
  WOO: '#6C1515',
  MMA: '#6C1515',

  ROF: '#ae12bc',
  FCL: '#ae12bc',

  FAF: '#89177D',
  NVL: '#89177D',
  FIF: '#89177D',
  MC: '#89177D',
  HIL: '#89177D',
  CLY: '#89177D',

  WWG: '#2A2D4B',
  RES: '#2A2D4B',
};

/**
 * The shape of a building on the map.
 */
export default function BuildingShape({ map, building }: BuildingShapeProps) {
  const dispatch = useAppDispatch();
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const selectedBuilding = useAppSelector((state) => state.ui.selectedBuilding);
  const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
  );
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);

  const renderBuildingPolygon = () => {
    const isSelected = selectedBuilding?.code == building.code;

    const getStrokeColor = () => {
      const selectedStrokeColor = '#FFBD59';
      const notSelectedColor = '#6b7280';

      if (isSelected) {
        return selectedStrokeColor;
      } else {
        return notSelectedColor;
      }
    };

    const getFillColor = () => {
      const noFloorPlanFillColor = '#6b7280';
      const academicBuildingFillColor = '#9ca3af';

      if (buildingCodeToShapeFillColor[building.code]) {
        return buildingCodeToShapeFillColor[building.code];
      } else if (building.floors.length == 0) {
        return noFloorPlanFillColor;
      } else {
        return academicBuildingFillColor;
      }
    };

    const getFillOpacity = () => {
      if (buildingCodeToShapeFillColor[building.code]) {
        if (isSelected) {
          return 1;
        } else {
          return 0.8;
        }
      } else {
        if (isSelected) {
          return 1;
        } else {
          return 0.6;
        }
      }
    };

    return (
      <Polygon
        key={building.code}
        points={building.shapes}
        fillColor={getFillColor()}
        fillOpacity={getFillOpacity()}
        strokeColor={getStrokeColor()}
        lineWidth={isSelected ? 3 : 1}
        enabled={false}
      />
    );
  };

  const renderRoundel = () => {
    return (
      (!focusedFloor || building.floors.length === 0) && (
        <div className="translate-y-1/2 cursor-pointer">
          <Annotation
            latitude={building.labelPosition.latitude}
            longitude={building.labelPosition.longitude}
          >
            <div
              className="translate-y-1/2 cursor-pointer"
              onClick={(e) => {
                if (isNavOpen && !choosingRoomMode) {
                  return;
                }

                // zoom on building if click on building already selected
                if (selectedBuilding?.code == building.code) {
                  zoomOnObject(map, building.shapes.flat());
                }

                if (choosingRoomMode == 'start') {
                  dispatch(setStartLocation(building));
                  dispatch(setIsSearchOpen(false));
                  dispatch(setChoosingRoomMode(null));
                } else if (choosingRoomMode == 'end') {
                  dispatch(setEndLocation(building));
                  dispatch(setIsSearchOpen(false));
                  dispatch(setChoosingRoomMode(null));
                } else {
                  dispatch(selectBuilding(building));
                  e.stopPropagation();
                }
              }}
            >
              <Roundel code={building.code} />
            </div>
          </Annotation>
        </div>
      )
    );
  };

  return (
    <>
      {renderBuildingPolygon()}
      {renderRoundel()}
    </>
  );
}
