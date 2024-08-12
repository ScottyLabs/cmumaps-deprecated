import { Annotation, Polygon } from 'mapkit-react';

import React from 'react';

import { selectBuilding } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building } from '@/types';

import Roundel from '../shared/Roundel';

interface BuildingShapeProps {
  building: Building;
}

const buildingCodeToShapeFillColor = {
  MOE: '#fde047',
};

/**
 * The shape of a building on the map.
 */
export default function BuildingShape({ building }: BuildingShapeProps) {
  const dispatch = useAppDispatch();
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const selectedBuilding = useAppSelector((state) => state.ui.selectedBuilding);

  const renderBuildingPolygon = () => {
    const getStrokeColor = () => {
      if (selectedBuilding?.code == building.code) {
        return '#fde047';
      } else if (building.floors.length > 0) {
        return '#6b7280';
      } else {
        return '#374151';
      }
    };

    const getFillColor = () => {
      if (buildingCodeToShapeFillColor[building.code]) {
        return buildingCodeToShapeFillColor[building.code];
      } else if (building.floors.length == 0) {
        return '#6b7280';
      } else {
        return '#9ca3af';
      }
    };

    return (
      <Polygon
        key={building.code}
        points={building.shapes}
        fillColor={getFillColor()}
        fillOpacity={1}
        strokeColor={getStrokeColor()}
        enabled={false}
      />
    );
  };

  const renderRoundel = () => {
    return (
      (!focusedFloor || building.floors.length === 0) && (
        <div
          className="translate-y-1/2 cursor-pointer"
          onClick={(e) => {
            dispatch(selectBuilding(building));
            e.stopPropagation();
          }}
        >
          <Annotation
            latitude={building.labelPosition.latitude}
            longitude={building.labelPosition.longitude}
          >
            <div
              className="translate-y-1/2 cursor-pointer"
              onClick={(e) => {
                dispatch(selectBuilding(building));
                e.stopPropagation();
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
