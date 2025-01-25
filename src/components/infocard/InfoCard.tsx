import React from 'react';

import { useAppSelector } from '@/lib/hooks';

import BuildingCard from './BuildingCard';
import EateryCard from './EateryCard';
import RoomCard from './RoomCard';

interface Props {
  map: mapkit.Map | null;
  initSnapPoint?: (number) => void;
  setCardVisibility?: (boolean) => void;
}

const InfoCard = ({ map, initSnapPoint, setCardVisibility }: Props) => {
  const room = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.selectedBuilding);

  if (room) {
    setCardVisibility?.(true);
    if (room.type == 'Food') {
      return <EateryCard room={room} initSnapPoint={initSnapPoint} />;
    } else {
      return <RoomCard initSnapPoint={initSnapPoint} room={room} />;
    }
  } else if (building) {
    setCardVisibility?.(true);
    return (
      <BuildingCard
        initSnapPoint={initSnapPoint}
        map={map}
        building={building}
      />
    );
  } else {
    setCardVisibility?.(true);
    return <></>;
  }
};

export default InfoCard;
