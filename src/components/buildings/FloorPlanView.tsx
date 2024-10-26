import { Room } from '@prisma/client';
import { Annotation, Polygon } from 'mapkit-react';

import React from 'react';

import {
  setChoosingRoomMode,
  setEndLocation,
  setStartLocation,
} from '@/lib/features/navSlice';
import { selectRoom, setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Floor, FloorPlan, getRoomTypeDetails } from '@/types';

import RoomPin, { hasIcon } from '../shared/RoomPin';

interface Props {
  floor: Floor;
  floorPlan: FloorPlan;
}

const FloorPlanView = ({ floor, floorPlan }: Props) => {
  const dispatch = useAppDispatch();

  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const showRoomNames = useAppSelector((state) => state.ui.showRoomNames);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  const choosingRoomMode = useAppSelector(
    (state) => state.nav.choosingRoomMode,
  );
  const isNavOpen = useAppSelector((state) => state.nav.isNavOpen);

  if (!floorPlan) {
    return <></>;
  }

  const handleSelectRoom = (room: Room) => () => {
    if (isNavOpen && !choosingRoomMode) {
      return;
    }

    if (choosingRoomMode == 'start') {
      dispatch(setStartLocation(room));
      dispatch(setIsSearchOpen(false));
      dispatch(setChoosingRoomMode(null));
    } else if (choosingRoomMode == 'end') {
      dispatch(setEndLocation(room));
      dispatch(setIsSearchOpen(false));
      dispatch(setChoosingRoomMode(null));
    } else {
      dispatch(selectRoom(room));
    }
  };

  return Object.entries(floorPlan).map(([roomId, room]) => {
    const roomColors = getRoomTypeDetails(room.type);

    const isSelected = selectedRoom?.id === roomId;

    const showIcon = hasIcon(room) || isSelected;

    return (
      <div key={room.id}>
        <Polygon
          points={room.coordinates}
          selected={isSelected}
          enabled={true}
          fillColor={roomColors.background}
          fillOpacity={1}
          strokeColor={isSelected ? '#FFBD59' : roomColors.border}
          strokeOpacity={1}
          lineWidth={isSelected ? 5 : 1}
          onSelect={handleSelectRoom(room)}
          fillRule="nonzero"
        />

        {focusedFloor?.buildingCode == floor.buildingCode &&
          focusedFloor.level == floor.level &&
          !isSelected && (
            <Annotation
              latitude={room.labelPosition.latitude}
              longitude={room.labelPosition.longitude}
              visible={showRoomNames || showIcon}
              displayPriority={'low'}
            >
              <div
                className="flex flex-col items-center"
                onClick={(e) => {
                  handleSelectRoom(room)();
                  e.stopPropagation();
                }}
              >
                <RoomPin room={{ ...room, id: roomId }} />
                {(showRoomNames || room.alias) && (
                  <div
                    className={
                      'text-center text-sm font-bold leading-[1.1] tracking-wide'
                    }
                  >
                    {showRoomNames && <p>{room.name}</p>}
                    {room.alias && (
                      <p className="w-16 text-wrap italic">{room.alias}</p>
                    )}
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
