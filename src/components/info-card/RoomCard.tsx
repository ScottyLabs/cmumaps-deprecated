import { getAvailabilityData, getImageURL } from '@/util/data/idToNames';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Room } from '@/types';
import ButtonsRow from './ButtonsRow';

// function availabilityApplicable(avail: WeekAvailability) {
//   if (Object.keys(avail).length) {
//     return <AvailabilitySection availability={avail} />;
//   }
//   return;
// }

// type WeekAvailability =
// | { [key: string]: [value: string] }[]
// | Record<string, never>;

interface Props {
  room: Room;
}

const RoomCard = ({ room }: Props) => {
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    getImageURL(room.floor, room?.name || null).then((res) => {
      setImageURL(res);
    });
  }, [room]);

  const renderRoomImage = () => {
    return (
      <div className="relative h-36 w-full">
        <Image
          className="object-cover"
          fill={true}
          alt="Room Image"
          src={imageURL}
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
