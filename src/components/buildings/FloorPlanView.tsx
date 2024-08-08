import { Position } from 'geojson';
import { Annotation, Coordinate, Polygon } from 'mapkit-react';

import React from 'react';

import { claimRoom, releaseRoom } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { FloorPlan, getRoomTypeDetails, Room } from '@/types';

import RoomPin, { hasIcon } from './RoomPin';
import { positionOnMap } from './mapUtils';

interface Props {
  floorPlan: FloorPlan;
}

export const getFloorCenter = (rooms: Room[]): Position => {
  let points: Position[] = Object.values(rooms).flatMap((room: Room) =>
    room.polygon.coordinates.flat(),
  );

  points = points.filter((e) => e !== undefined);

  const allX = points.map((p) => p[0]);
  const allY = points.map((p) => p[1]);

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  return [(minX + maxX) / 2, (minY + maxY) / 2];
};

const FloorPlanView = ({ floorPlan }: Props) => {
  const dispatch = useAppDispatch();

  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const showRoomNames = useAppSelector((state) => state.ui.showRoomNames);

  const { placement, rooms } = floorPlan;

  // Compute the center position of the bounding box of the current floor
  // (Will be used as the rotation center)
  const center = getFloorCenter(Object.values(rooms));

  const convertToMap = (absolute: Position): Coordinate =>
    positionOnMap(absolute, placement, center);

  return Object.entries(rooms).map(([roomId, room]) => {
    const pointsSrc = room.polygon.coordinates.map((shape) =>
      shape.map(convertToMap),
    );

    const roomColors = getRoomTypeDetails(room.type);

    const roomCenter = [room.labelPosition.x, room.labelPosition.y];

    const labelPos = convertToMap(roomCenter);

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
          points={[...pointsSrc]}
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

        <Annotation
          latitude={labelPos.latitude}
          longitude={labelPos.longitude}
          onSelect={() => dispatch(claimRoom(room))}
          onDeselect={() => dispatch(releaseRoom(room))}
          visible={showRoomNames || showIcon}
        >
          <div className={`relative width-[${iconSize}] height-[${iconSize}] `}>
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
      </div>
    );
  });
};

export default FloorPlanView;
