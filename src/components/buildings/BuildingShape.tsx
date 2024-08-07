import { Annotation, Polygon } from 'mapkit-react';

import React from 'react';

import { selectBuilding } from '@/lib/features/uiSlice';
import { useAppDispatch } from '@/lib/hooks';
import { Building } from '@/types';

import Roundel from '../shared/Roundel';

interface BuildingShapeProps {
  building: Building;
  showFloor: boolean;
}

/**
 * The shape of a building on the map.
 */
export default function BuildingShape({
  building,
  showFloor,
}: BuildingShapeProps) {
  const dispatch = useAppDispatch();

  const renderBuildingPolygon = () => {
    return (
      <Polygon
        key={building.code}
        points={building.shapes}
        fillColor={building.floors.length > 0 ? '#9ca3af' : '#6b7280'}
        fillOpacity={1}
        strokeColor={building.floors.length > 0 ? '#6b7280' : '#374151'}
      />
    );
  };

  const renderRoundel = () => {
    return (
      (!showFloor || building.floors.length === 0) && (
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
