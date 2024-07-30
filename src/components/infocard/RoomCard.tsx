import React from 'react';
import Image from 'next/image';
import { Room } from '@/types';
import ButtonsRow from './ButtonsRow';
import { useAppSelector } from '@/lib/hooks';
import RoomSchedule from './RoomSchedule';

interface Props {
  room: Room;
}

const RoomCard = ({ room }: Props) => {
  const roomImageList = useAppSelector((state) => state.ui.roomImageList);

  const renderRoomImage = () => {
    const buildingCode = room.floor.split('-')[0];

    // the default image is the building image
    // but get the room image if it exists
    let url = `/assets/location_images/building_room_images/${buildingCode}/${buildingCode}.jpg`;
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
