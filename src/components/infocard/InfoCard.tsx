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

  const initSP =
    initSnapPoint ||
    (() => {
      null;
    });
  const setCV =
    setCardVisibility ||
    (() => {
      null;
    });

  if (room) {
    setCV(true);
    if (room.type == 'Food') {
      return <EateryCard room={room} initSnapPoint={initSP} />;
    } else {
      return <RoomCard initSnapPoint={initSP} room={room} />;
    }
  } else if (building) {
    setCV(true);
    return (
      <BuildingCard initSnapPoint={initSP} map={map} building={building} />
    );
  } else {
    setCV(false);
    return <></>;
  }
};

export default InfoCard;
