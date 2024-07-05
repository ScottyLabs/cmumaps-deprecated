import { latitudeRatio, longitudeRatio, rotate } from '@/geometry';
import {
  AbsoluteCoordinate,
  FloorPlan,
  getRoomTypeDetails,
  Placement,
  Room,
} from '@/types';
import { Annotation, Coordinate, Polygon } from 'mapkit-react';
import React, { useMemo, useRef } from 'react';
import clsx from 'clsx';
import styles from '../../styles/FloorPlanOverlay.module.css';
import RoomPin, { hasIcon } from './RoomPin';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { claimRoom, releaseRoom } from '@/lib/features/ui/uiSlice';

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
  buildingAndRoom: any;
}

/**
 * The contents of a floor displayed on the map.
 */
export default function FloorPlanOverlay({
  floorPlan,
  showRoomNames,
  isBackground,
  buildingAndRoom,
}: FloorPlanOverlayProps) {
  const { rooms, placement } = floorPlan;

  // Compute the center position of the bounding box of the current floor
  // (Will be used as the rotation center)
  const center: AbsoluteCoordinate | undefined = useMemo(
    () => getFloorCenter(rooms),
    [rooms],
  );

  const convertToMap = (absolute: AbsoluteCoordinate): Coordinate =>
    positionOnMap(absolute, placement, center);
  const dispatch = useAppDispatch();
  const selectedRoomId = 'bcd7626a-1427-4e8b-a6b3-043753477156';

  return (
    <>
      {Object.entries(rooms).map((entry) => {
        const id: string = entry[0];
        const room: Room = entry[1];
        // Turn on for CMUShits.com
        // if (room.type != "restroom" && room.type != "corridor")
        //   return;

        const pointsSrc = room?.polygon?.coordinates[0].map(convertToMap);
        if (!pointsSrc) {
          return;
        }

        const roomColors = getRoomTypeDetails(room.type);

        const labelPos = convertToMap(room.labelPosition!);

        const opacity = isBackground ? 0.7 : 1;

        const showIcon = hasIcon(room) || selectedRoomId === id;

        return (
          <React.Fragment key={room.name}>
            <Polygon
              points={[...pointsSrc, pointsSrc[0]]}
              selected={selectedRoomId === id}
              enabled={true}
              fillColor={roomColors.background}
              fillOpacity={opacity}
              strokeColor={
                selectedRoomId === id ? '#f7efc3' : roomColors.border
              }
              strokeOpacity={opacity}
              lineWidth={selectedRoomId === id ? 5 : 1}
              onSelect={() => dispatch(claimRoom(room))}
              onDeselect={() => dispatch(releaseRoom(room))}
            />

            {!isBackground && (showRoomNames || showIcon) && (
              <Annotation
                latitude={labelPos.latitude}
                longitude={labelPos.longitude}
                onSelect={() => dispatch(claimRoom(room))}
                onDeselect={() => dispatch(releaseRoom(room))}
              >
                <div
                  className={
                    selectedRoomId !== id
                      ? styles.marker
                      : styles['marker-selected']
                  }
                >
                  <RoomPin room={room} selected={buildingAndRoom} />
                  {(showRoomNames || room.alias) && (
                    <div
                      className={clsx(
                        styles.label,
                        showIcon && styles['label-on-icon'],
                      )}
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
