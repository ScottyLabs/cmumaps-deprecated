import { Annotation, Coordinate, Polygon } from 'mapkit-react';

import React, { useMemo, useRef } from 'react';

import { claimRoom, releaseRoom } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  AbsoluteCoordinate,
  FloorPlan,
  getRoomTypeDetails,
  Placement,
  Room,
} from '@/types';
import { latitudeRatio, longitudeRatio, rotate } from '@/util/geometry';

import styles from '../../styles/FloorPlanOverlay.module.css';
import RoomPin, { hasIcon } from './RoomPin';

export function getFloorCenter(rooms: Room[]): AbsoluteCoordinate | undefined {
  if (!rooms) {
    return undefined;
  }

  let points: AbsoluteCoordinate[] = Object.values(rooms).flatMap(
    (room: Room) => room?.polygon?.coordinates.flat(),
  );
  points = points.filter((e) => e !== undefined);

  const allX = points.map((p) => p[0]);
  const allY = points.map((p) => p[1]);

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

export function positionOnMap(
  absolute: AbsoluteCoordinate,
  placement: Placement | null,
  center: AbsoluteCoordinate | undefined,
) {
  if (placement === null) {
    throw new Error('No active placement');
  }
  if (!center) {
    throw new Error('No center');
  }
  const [absoluteY, absoluteX] = rotate(
    absolute[0] - center[0],
    absolute[1] - center[1],
    placement.angle,
  );
  return {
    latitude:
      absoluteY / latitudeRatio / placement.scale + placement.center.latitude,
    longitude:
      absoluteX / longitudeRatio / placement.scale + placement.center.longitude,
  };
}

interface FloorPlanOverlayProps {
  floorPlan: FloorPlan;
  showRoomNames: boolean;
  isBackground: boolean;
}

/**
 * The contents of a floor displayed on the map.
 */
export default function FloorPlanOverlay({
  floorPlan,
  showRoomNames,
  isBackground,
}: FloorPlanOverlayProps) {
  const { placement, rooms } = floorPlan;

  // Compute the center position of the bounding box of the current floor
  // (Will be used as the rotation center)
  const center: AbsoluteCoordinate | undefined = useMemo(
    () => getFloorCenter(rooms),
    [rooms],
  );
  const convertToMap = (absolute: AbsoluteCoordinate): Coordinate =>
    positionOnMap(absolute, placement, center);
  const dispatch = useAppDispatch();
  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);

  return (
    <>
      {Object.entries(rooms).map((entry) => {
        const id: string = entry[0];
        const room: Room = { ...entry[1], id };

        // Turn on for CMUShits.com
        // if (room.type != "restroom" && room.type != "corridor")
        //   return;

        const pointsSrcAbs = room?.polygon?.coordinates.map((shape) =>
          shape.filter((e) => !!e),
        );

        if (!pointsSrcAbs) {
          return;
        }
        room.labelPosition = [room.labelPosition?.x, room.labelPosition?.y];
        const roomCenter = room.labelPosition || [
          pointsSrcAbs[0].reduce((a, b) => a + b[0], 0) /
            pointsSrcAbs[0].length,
          pointsSrcAbs[0].reduce((a, b) => a + b[1], 0) /
            pointsSrcAbs[0].length,
        ];

        const pointsSrc = pointsSrcAbs.map((shape) => shape.map(convertToMap));

        const roomColors = getRoomTypeDetails(room.type);

        const labelPos = convertToMap(roomCenter);

        const opacity = isBackground ? 0.7 : 1;

        const showIcon = hasIcon(room) || selectedRoom?.id === id;

        const gutter = selectedRoom?.id === id ? 20 : 4;
        const iconSize = selectedRoom?.id === id ? 20 : showIcon ? 20 : 10;
        const labelHeight = 24;
        const labelOffset = {
          left: iconSize + gutter,
          top: (iconSize - labelHeight) / 2,
        };

        return (
          <React.Fragment key={room.name}>
            <Polygon
              points={[...pointsSrc]}
              selected={selectedRoom?.id === id}
              enabled={true}
              fillColor={roomColors.background}
              fillOpacity={opacity}
              strokeColor={
                selectedRoom?.id === id ? '#f7efc3' : roomColors.border
              }
              strokeOpacity={opacity}
              lineWidth={selectedRoom?.id === id ? 5 : 1}
              onSelect={() => dispatch(claimRoom(room))}
              onDeselect={() => dispatch(releaseRoom(room))}
              fillRule="nonzero"
            />

            {!isBackground && (showRoomNames || showIcon) && (
              <Annotation
                latitude={labelPos.latitude}
                longitude={labelPos.longitude}
                onSelect={() => dispatch(claimRoom(room))}
                onDeselect={() => dispatch(releaseRoom(room))}
              >
                <div
                  className={`relative width-[${iconSize}] height-[${iconSize}]`}
                >
                  <RoomPin room={room} />
                  {(showRoomNames || room.alias) && (
                    <div
                      className={`flex-1 flex-col justify-center height-[${labelHeight}] absolute left-[${labelOffset.left}] top-[${labelOffset.top}] text-sm leading-[1.1] tracking-wide`}
                    >
                      {showRoomNames && (
                        <div className={styles['room-number']}>{room.name}</div>
                      )}
                      {room.alias && <div>{room.alias}</div>}
                    </div>
                  )}
                </div>
              </Annotation>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
