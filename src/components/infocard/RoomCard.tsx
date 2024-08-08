import { useAppSelector } from '@/lib/hooks';
import { Room } from '@/types';

import ButtonsRow from './ButtonsRow';
import InfoCardImage from './InfoCardImage';
import RoomSchedule from './RoomSchedule';

interface Props {
  room: Room;
}

const RoomCard = ({ room }: Props) => {
  const buildings = useAppSelector((state) => state.data.buildings);
  const roomImageList = useAppSelector((state) => state.ui.roomImageList);

  if (!buildings) {
    return;
  }

  const renderRoomImage = () => {
    const buildingCode = room.floor.buildingCode;

    // the default image is the building image
    let url = `/assets/location_images/building_room_images/${buildingCode}/${buildingCode}.jpg`;

    // but get the room image if it exists
    if (roomImageList[buildingCode].includes(room.name + '.jpg')) {
      url = `/assets/location_images/building_room_images/${buildingCode}/${room.name}.jpg`;
    }

    return <InfoCardImage url={url} alt={room.name} />;
  };

  const renderButtonsRow = () => {
    return <ButtonsRow middleButton={<></>} />;
  };

  return (
    <div>
      {renderRoomImage()}
      <div className="ml-3 mt-2 font-bold">
        {buildings[room.floor.buildingCode].name} {room.name}
      </div>
      {renderButtonsRow()}
      <RoomSchedule />
    </div>
  );
};

export default RoomCard;
