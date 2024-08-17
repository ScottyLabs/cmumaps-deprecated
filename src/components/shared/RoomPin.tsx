import restroomIcon from '@icons/quick_search/restroom.svg';
import corridorIcon from '@icons/search_results/corridor.svg';
import elevatorIcon from '@icons/search_results/elevator.svg';
import foodIcon from '@icons/search_results/food.svg';
import pinIcon from '@icons/search_results/pin.svg';
import stairsIcon from '@icons/search_results/stairs.svg';
import studyIcon from '@icons/search_results/study.svg';
import Image from 'next/image';

import React from 'react';

import { useAppSelector } from '@/lib/hooks';
import { Room, SearchRoom, getRoomTypeDetails } from '@/types';

const icons: { [type: string]: SVGElement } = {
  elevator: elevatorIcon,
  corridor: corridorIcon,
  dining: foodIcon,
  stairs: stairsIcon,
  library: studyIcon,
  restroom: restroomIcon,
  classroom: studyIcon,
  parking: pinIcon,
  studio: pinIcon,
  vestibule: pinIcon,
  auditorium: pinIcon,
  sport: pinIcon,
  workshop: pinIcon,
  store: pinIcon,
};

interface RoomPinProps {
  room: Room | SearchRoom;
}

export function hasIcon(room: Room | SearchRoom) {
  return room.type in icons;
}

/**
 * The marker displayed for identifying the type of a room.
 * Visible on the map and in the search results.
 */
export default function RoomPin({ room }: RoomPinProps) {
  const icon = icons[room.type] ?? null;
  const hasGraphic = icon !== null;
  const roomColors = getRoomTypeDetails(room.type);
  const selectedRoom = useAppSelector((state) => state.ui.selectedRoom);
  const selected = room.id === selectedRoom?.id;
  return (
    <div
      className={
        'flex ' +
        (selected ? 'h-10 w-10' : 'h-5 w-5') +
        ' items-center justify-center rounded'
      }
      style={{ background: selected ? 'red' : roomColors.primary }}
      title={room.type}
    >
      <Image
        alt={'Room Pin Alt Placeholder'}
        className={selected ? 'size-10' : 'size-3'}
        src={hasGraphic ? icon : pinIcon}
      />
    </div>
  );
}
