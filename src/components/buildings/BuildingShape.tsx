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
        onSelect={() => {
          if (!showFloor) {
            dispatch(selectBuilding(building));
          }
        }}
        onDeselect={() => dispatch(selectBuilding(null))}
      />
    );
  };

  const renderRoundel = () => {
    return (
      (!showFloor || building.floors.length === 0) && (
        <Annotation
          latitude={building.labelPosition.latitude}
          longitude={building.labelPosition.longitude}
          onSelect={() => dispatch(selectBuilding(building))}
          onDeselect={() => dispatch(selectBuilding(null))}
        >
          <div className="translate-y-1/2 scale-[0.8]">
            <Roundel code={building.code} />
          </div>
        </Annotation>
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
