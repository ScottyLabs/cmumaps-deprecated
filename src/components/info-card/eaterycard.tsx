import { Room } from '@/types';
import { getEatingData, getImageURL } from '@/util/data/idToNames';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { IReadOnlyExtendedLocation } from '@/util/cmueats/types/locationTypes';
import ButtonsRow from './ButtonsRow';
import { ImSpoonKnife } from 'react-icons/im';

interface Props {
  room: Room;
}

const Eaterycard = ({ room }: Props) => {
  const [eatingData, setEatingData] =
    useState<IReadOnlyExtendedLocation | null>();

  const getEateryImageURL = () => {
    const eateryName = eatingData?.name.toLowerCase().split(' ').join('_');
    return `/assets/location_images/eatery_images/${eateryName}.jpg`;
  };

  useEffect(() => {
    const fetchEatingData = async () => {
      const newEatingData = await getEatingData(room.alias);
      setEatingData(newEatingData);
    };
    fetchEatingData();
  }, [room.alias]);

  const renderEateryImage = () => {
    return (
      <div className="relative h-36 w-full">
        <Image
          className="object-cover"
          fill={true}
          alt="Room Image"
          src={getEateryImageURL()}
        />
      </div>
    );
  };

  const renderInfo = () => {
    if (eatingData) {
      return (
        <>
          <div className="ml-3 mt-2">
            <p className="font-bold">{eatingData.name}</p>
            <p>{eatingData.statusMsg}</p>
          </div>
          <div className="ml-3 mt-2 text-sm">{eatingData.shortDescription}</div>
        </>
      );
    } else {
      return <div className="ml-3 mt-2 font-bold"> {room.alias}</div>;
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
      {eatingData && renderEateryImage()}
      {renderInfo()}
      {renderButtonsRow()}
    </div>
  );
};

export default Eaterycard;
