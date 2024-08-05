import Image from 'next/image';

import React from 'react';

import { useAppSelector } from '@/lib/hooks';
import { Room } from '@/types';

import ButtonsRow from './ButtonsRow';
import RoomSchedule from './RoomSchedule';

// import RoomSchedule from './RoomSchedule';

interface Props {
  room: Room;
}

const RoomCard = ({ room }: Props) => {
  const roomImageList = useAppSelector((state) => state.ui.roomImageList);

  const renderRoomImage = () => {
    const buildingCode = room.floor.buildingCode;

    // the default image is the building image
    let url = `/assets/location_images/building_room_images/${buildingCode}/${buildingCode}.jpg`;

    // but get the room image if it exists
    if (roomImageList[buildingCode].includes(room.name + '.jpg')) {
      url = `/assets/location_images/building_room_images/${buildingCode}/${room.name}.jpg`;
    }

    return (
      <div className="relative h-36 w-full">
        <Image
          className="object-cover"
          fill={true}
          alt="Room Image"
          src={url}
          sizes="100vw"
        />
      </div>
    );
  };

  const renderButtonsRow = () => {
    return <ButtonsRow middleButton={<></>} />;
  };

  return (
    <div>
      {renderRoomImage()}
      <div className="ml-3 mt-2 font-bold">{room.name}</div>
      <div className="ml-3 text-sm text-gray-400">
        No Room Schedule Available
      </div>
      {renderButtonsRow()}
      <RoomSchedule />
    </div>
  );
};

export default RoomCard;
