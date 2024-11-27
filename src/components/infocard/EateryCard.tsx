import React from 'react';
import { ImSpoonKnife } from 'react-icons/im';

import { useAppSelector } from '@/lib/hooks';
import { Room } from '@/types';
import { getEateryId } from '@/util/eateryUtils';

import ButtonsRow, { renderMiddleButtonHelper } from './ButtonsRow';
import EateryInfoDisplay from './EateryInfoDisplay';
import InfoCardImage from './InfoCardImage';

interface Props {
  room: Room;
  initSnapPoint: (number) => void;
}

const Eaterycard = ({ room, initSnapPoint }: Props) => {
  const eateryData = useAppSelector((state) => state.data.eateryData);

  if (!eateryData) {
    return;
  }

  const eateryInfo = eateryData[getEateryId(room)];

  const renderEateryImage = () => {
    if (eateryInfo) {
      const eateryName = eateryInfo.name
        .toLowerCase()
        .split(' ')
        .join('-')
        .replace('é', 'e');
      const url = `/assets/location_images/eatery_images/${eateryName}.jpg`;

      return <InfoCardImage url={url} alt={`${eateryName} Image`} />;
    }
  };

  const renderButtonsRow = () => {
    const renderMiddleButton = () => {
      if (!eateryInfo) {
        return <></>;
      }

      const icon = <ImSpoonKnife className="size-3.5" />;

      return renderMiddleButtonHelper('Menu', icon, eateryInfo.url);
    };

    return <ButtonsRow middleButton={renderMiddleButton()} />;
  };

  const renderInfo = () => {
    const renderTitle = () => {
      return <h2 className="font-bold">{room.alias}</h2>;
    };

    return (
      <EateryInfoDisplay
        room={room}
        title={renderTitle()}
        eateryInfo={eateryInfo}
      />
    );
  };

  initSnapPoint(340);

  return (
    // <CardWrapper snapPoint={340}>
    <>
      {renderEateryImage()}
      {renderInfo()}
      {renderButtonsRow()}
    </>
    // </CardWrapper>
  );
};

export default Eaterycard;
