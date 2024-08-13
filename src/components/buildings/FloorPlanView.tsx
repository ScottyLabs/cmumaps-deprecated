import { Annotation, Polygon } from 'mapkit-react';

import React from 'react';

import { claimRoom, releaseRoom } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Floor, FloorPlan, getRoomTypeDetails } from '@/types';

import RoomPin, { hasIcon } from '../shared/RoomPin';

interface Props {
  floor: Floor;
  floorPlanMap: Record<string, Record<string, FloorPlan>>;
}

const FloorPlanView = ({ floor, floorPlanMap }: Props) => {
  const floorPlan = floorPlanMap?.[floor.buildingCode]?.[floor.level];
  const dispatch = useAppDispatch();

  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const showRoomNames = useAppSelector((state) => state.ui.showRoomNames);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  if (!floorPlan) {
    return <></>;
  }
  return Object.entries(floorPlan).map(([roomId, room]) => {
    const roomColors = getRoomTypeDetails(room.type);

    // const opacity = isBackground ? 0.7 : 1;
    const opacity = 1;

    const showIcon = hasIcon(room) || selectedRoom?.id === roomId;

    const gutter = selectedRoom?.id === roomId ? 20 : 4;
    const iconSize = selectedRoom?.id === roomId ? 20 : showIcon ? 20 : 10;
    const labelHeight = 24;
    const labelOffset = {
      left: iconSize + gutter,
      top: (iconSize - labelHeight) / 2,
    };

    return (
      <div key={room.id}>
        <Polygon
          points={room.coordinates}
          selected={selectedRoom?.id === roomId}
          enabled={true}
          fillColor={roomColors.background}
          fillOpacity={opacity}
          strokeColor={
            selectedRoom?.id === roomId ? '#f7efc3' : roomColors.border
          }
          strokeOpacity={opacity}
          lineWidth={selectedRoom?.id === roomId ? 5 : 1}
          onSelect={() => dispatch(claimRoom(room))}
          onDeselect={() => dispatch(releaseRoom(room))}
          fillRule="nonzero"
        />

        {focusedFloor.buildingCode == floor.buildingCode &&
          focusedFloor.level == floor.level && (
            <Annotation
              latitude={room.labelPosition.latitude}
              longitude={room.labelPosition.longitude}
              onSelect={() => dispatch(claimRoom(room))}
              onDeselect={() => dispatch(releaseRoom(room))}
              visible={showRoomNames || showIcon}
            >
              <div
                className={`relative width-[${iconSize}] height-[${iconSize}] `}
              >
                <RoomPin room={{ ...room, id: roomId }} />
                {(showRoomNames || room.alias) && (
                  <div
                    className={`flex-1 flex-col justify-center height-[${labelHeight}] absolute left-[${labelOffset.left}] top-[${labelOffset.top}] text-sm leading-[1.1] tracking-wide`}
                  >
                    {showRoomNames && <div>{room.name}</div>}
                    {room.alias && <div>{room.alias}</div>}
                  </div>
                )}
              </div>
            </Annotation>
          )}
      </div>
    );
  });
};

export default FloorPlanView;
