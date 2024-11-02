import React from 'react';

import { useAppSelector } from '@/lib/hooks';

import BuildingCard from './BuildingCard';
import EateryCard from './EateryCard';
import RoomCard from './RoomCard';

interface Props {
  map: mapkit.Map | null;
}

const InfoCard = ({ map }: Props) => {
  const room = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.selectedBuilding);

  if (room) {
    if (room.type == 'Food') {
      return <EateryCard room={room} />;
    } else {
      return <RoomCard room={room} />;
    }
  } else if (building) {
    return <BuildingCard map={map} building={building} />;
  } else {
    return <></>;
  }
};

export default InfoCard;
