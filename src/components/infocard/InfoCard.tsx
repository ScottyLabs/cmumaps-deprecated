import React from 'react';

import { useAppSelector } from '@/lib/hooks';

import BuildingCard from './BuildingCard';
import CardWrapper from './CardWrapper';
import EateryCard from './EateryCard';
import RoomCard from './RoomCard';

interface Props {
  map: mapkit.Map | null;
}

const InfoCard = ({ map }: Props) => {
  const room = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.selectedBuilding);

  if (room) {
    if (room.type == 'food') {
      return (
        <CardWrapper snapPoint={0.42}>
          <EateryCard room={room} />
        </CardWrapper>
      );
    } else {
      return (
        <CardWrapper snapPoint={0.35}>
          <RoomCard room={room} />
        </CardWrapper>
      );
    }
  } else if (building) {
    return (
      <CardWrapper snapPoint={0.52}>
        <BuildingCard map={map} building={building} />
      </CardWrapper>
    );
  } else {
    return <></>;
  }
};

export default InfoCard;
