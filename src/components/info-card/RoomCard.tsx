import { useAppSelector } from '@/lib/hooks';
import { getImageURL } from '@/util/data/idToNames';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { renderButtonsRowHelper } from './displayUtils';
import { Room } from '@/types';

interface Props {
  room: Room;
}

const RoomCard = ({ room }: Props) => {
  let building = useAppSelector((state) => state.ui.selectedBuilding);
  building = useAppSelector((state) => state.ui.focusedBuilding);
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    getImageURL(building?.code || '', room?.name || null).then((res) => {
      setImageURL(res);
    });
  }, [building, room]);

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
    return renderButtonsRowHelper(<></>);
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
