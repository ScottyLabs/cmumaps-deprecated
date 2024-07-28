import React from 'react';
import Image from 'next/image';
import { Room } from '@/types';
import ButtonsRow from './ButtonsRow';
import { useAppSelector } from '@/lib/hooks';

interface Props {
  room: Room;
}

const RoomCard = ({ room }: Props) => {
  const roomImageList = useAppSelector((state) => state.ui.roomImageList);

  const renderRoomImage = () => {
    const url = `/assets/location_images/building_room_images/${room.floor}/${room.name}.jpg`;

    console.log(roomImageList);

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
    </div>
  );
};

export default RoomCard;
