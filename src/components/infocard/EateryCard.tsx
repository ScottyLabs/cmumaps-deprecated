import React, { useEffect, useState } from 'react';
import { ImSpoonKnife } from 'react-icons/im';

import { Room } from '@/types';
import { getEatingData } from '@/util/cmueats/getEatingData';
import { IReadOnlyExtendedLocation } from '@/util/cmueats/types/locationTypes';

import ButtonsRow, { renderMiddleButtonHelper } from './ButtonsRow';
import EateryInfo from './EateryInfo';
import InfoCardImage from './InfoCardImage';

interface Props {
  room: Room;
}

const Eaterycard = ({ room }: Props) => {
  const [eatingData, setEatingData] =
    useState<IReadOnlyExtendedLocation | null>(null);

  useEffect(() => {
    const fetchEatingData = async () => {
      const newEatingData = await getEatingData(room.alias);
      setEatingData(newEatingData);
    };
    fetchEatingData();
  }, [room.alias]);

  const renderEateryImage = () => {
    if (eatingData) {
      const eateryName = eatingData.name
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
      if (!eatingData) {
        return <></>;
      }

      const icon = <ImSpoonKnife className="size-3.5" />;

      return renderMiddleButtonHelper('Menu', icon, eatingData.url);
    };

    return <ButtonsRow middleButton={renderMiddleButton()} />;
  };

  const renderInfo = () => {
    const renderTitle = () => {
      return <h2 className="font-bold">{room.alias}</h2>;
    };

    return (
      <EateryInfo room={room} title={renderTitle()} eatingData={eatingData} />
    );
  };

  return (
    <div>
      {renderEateryImage()}
      {renderInfo()}
      {renderButtonsRow()}
    </div>
  );
};

export default Eaterycard;
