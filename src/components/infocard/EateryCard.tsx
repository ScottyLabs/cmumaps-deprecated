import Image from 'next/image';

import React, { useEffect, useState } from 'react';
import { ImSpoonKnife } from 'react-icons/im';

import { Room } from '@/types';
import { getEatingData } from '@/util/cmueats/getEatingData';
import { IReadOnlyExtendedLocation } from '@/util/cmueats/types/locationTypes';

import ButtonsRow from './ButtonsRow';
import EateryInfo from './EateryInfo';

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
  }, [room.aliases]);

  const renderEateryImage = () => {
    if (eatingData) {
      const eateryName = eatingData.name
        .toLowerCase()
        .split(' ')
        .join('-')
        .replace('é', 'e');
      const url = `/assets/location_images/eatery_images/${eateryName}.jpg`;

      return (
        <div className="relative h-36 w-full">
          <Image
            className="object-cover"
            fill={true}
            alt="Room Image"
            src={url}
          />
        </div>
      );
    }
  };

  const renderButtonsRow = () => {
    const renderMiddleButton = () => {
      if (!eatingData) {
        return <></>;
      }

      return (
        <a href={eatingData.url} target="_blank" rel="noreferrer">
          <button
            type="button"
            className="flex rounded-lg bg-[#1e86ff] px-2 py-1 text-white"
          >
            <ImSpoonKnife className="mr-2" />
            <p className="text-xs">Menu</p>
          </button>
        </a>
      );
    };

    return <ButtonsRow middleButton={renderMiddleButton()} />;
  };

  return (
    <div>
      {renderEateryImage()}
      <EateryInfo room={room} eatingData={eatingData} />
      {renderButtonsRow()}
    </div>
  );
};

export default Eaterycard;
