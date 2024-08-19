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
  const searchMap = useAppSelector((state) => state.data.searchMap);

  if (room) {
    if (room.type == 'food') {
      return (
        <CardWrapper snapPoint={340}>
          <EateryCard room={room} />
        </CardWrapper>
      );
    } else {
      return (
        <CardWrapper snapPoint={300}>
          <RoomCard room={room} />
        </CardWrapper>
      );
    }
  } else if (building) {
    const eateries = building.floors
      .map((floorLevel) => {
        if (
          !searchMap[`${building.code}`] ||
          !searchMap[`${building.code}`][floorLevel]
        ) {
          return [];
        }
        const rooms = searchMap[`${building.code}`][`${floorLevel}`];
        return rooms.filter((room) => room.type == 'food');
      })
      .flat();

    return (
      <CardWrapper snapPoint={eateries.length > 0 ? 440 : 275}>
        <BuildingCard map={map} building={building} eateries={eateries} />
      </CardWrapper>
    );
  } else {
    return <></>;
  }
};

export default InfoCard;
