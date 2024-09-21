import restroomIcon from '@icons/quick_search/restroom.svg';
import corridorIcon from '@icons/search_results/corridor.svg';
import diningIcon from '@icons/search_results/dining.svg';
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
  dining: diningIcon,
  food: foodIcon,
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
  const isSelected = room.id === selectedRoom?.id;

  return (
    <div
      className={`flex items-center justify-center rounded ${isSelected ? 'size-10' : 'size-5'} `}
      style={{ background: roomColors.primary }}
      title={room.type}
    >
      <Image
        alt={'Room Pin'}
        src={hasGraphic ? icon : pinIcon}
        height={isSelected ? 20 : 10}
      />
    </div>
  );
}
