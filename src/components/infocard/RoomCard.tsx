import { useEffect, useState } from 'react';
import { ImSpoonKnife } from 'react-icons/im';

import { getDbRoomExists } from '@/lib/apiRoutes';
import { useAppSelector } from '@/lib/hooks';
import { Room } from '@/types';

import ButtonsRow, { renderMiddleButtonHelper } from './ButtonsRow';
import InfoCardImage from './InfoCardImage';
import RoomSchedule from './RoomSchedule';

interface Props {
  room: Room;
}

const RoomCard = ({ room }: Props) => {
  const buildings = useAppSelector((state) => state.data.buildings);
  const availableRoomImages = useAppSelector(
    (state) => state.data.availableRoomImages,
  );

  const [hasSchedule, setHasSchedule] = useState<boolean | null>(null);

  useEffect(() => {
    getDbRoomExists(room).then((response) => setHasSchedule(response));
  }, [room]);

  if (!buildings || hasSchedule === null) {
    return;
  }

  const renderRoomImage = () => {
    const buildingCode = room.floor.buildingCode;

    // the default image is the building image
    let url = `/assets/location_images/building_room_images/${buildingCode}/${buildingCode}.jpg`;

    // but get the room image if it exists
    if (availableRoomImages[buildingCode].includes(room.name + '.jpg')) {
      url = `/assets/location_images/building_room_images/${buildingCode}/${room.name}.jpg`;
    }

    return <InfoCardImage url={url} alt={room.name} />;
  };

  const renderRoomTitle = () => {
    const getText = () => {
      if (room.alias) {
        return room.alias;
      }

      if (
        room.type == 'restroom' ||
        room.type == 'stairs' ||
        room.type == 'elevator'
      ) {
        return room.type;
      }
      return `${buildings[room.floor.buildingCode].name} ${room.name}`;
    };

    if (hasSchedule) {
      return <h2 className="ml-3 mt-2">{getText()}</h2>;
    } else {
      return (
        <div className="ml-3 mt-2">
          <h2>{getText()}</h2>
          <p className="text-[--color-gray]">No Room Schedule Available</p>
        </div>
      );
    }
  };

  const renderButtonsRow = () => {
    const renderMiddleButton = () => {
      if (hasSchedule) {
        const icon = <ImSpoonKnife className="size-3.5" />;

        return renderMiddleButtonHelper(
          'Reserve Room',
          icon,
          'https://25live.collegenet.com/pro/cmu#!/home/event/form',
        );
      } else {
        return <></>;
      }
    };

    return <ButtonsRow middleButton={renderMiddleButton()} />;
  };

  return (
    <div>
      {renderRoomImage()}
      {renderRoomTitle()}
      {renderButtonsRow()}
      {hasSchedule && <RoomSchedule />}
    </div>
  );
};

export default RoomCard;
