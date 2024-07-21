import React, { ReactElement } from 'react';
import { useAppSelector } from '@/lib/hooks';
import BuildingCard from './BuildingCard';
import EateryCard from './EateryCard';
import RoomCard from './RoomCard';
import CardWrapper from './CardWrapper';

export default function InfoCard(): ReactElement {
  const room = useAppSelector((state) => state.ui.selectedRoom);
  const building = useAppSelector((state) => state.ui.focusedBuilding);

  if (room) {
    if (room.type == 'dining') {
      return (
        <CardWrapper snapPoint={0.35}>
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
      <CardWrapper snapPoint={0.5}>
        <BuildingCard building={building} />
      </CardWrapper>
    );
  }

  return <></>;
}
