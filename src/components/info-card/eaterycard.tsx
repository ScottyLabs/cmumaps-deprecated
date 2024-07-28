import { Room } from '@/types';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  IReadOnlyExtendedLocation,
  LocationState,
} from '@/util/cmueats/types/locationTypes';
import ButtonsRow from './ButtonsRow';
import { ImSpoonKnife } from 'react-icons/im';
import { getEatingData } from '@/util/cmueats/getEatingData';

interface Props {
  room: Room;
}

const Eaterycard = ({ room }: Props) => {
  const [eatingData, setEatingData] =
    useState<IReadOnlyExtendedLocation | null>();

  useEffect(() => {
    const fetchEatingData = async () => {
      const newEatingData = await getEatingData(room.alias);
      setEatingData(newEatingData);
    };
    fetchEatingData();
  }, [room.alias]);

  const renderEateryImage = () => {
    if (eatingData) {
      const eateryName = eatingData.name.toLowerCase().split(' ').join('_');
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

  const renderInfo = () => {
    if (eatingData) {
      const getLocationState = () => {
        if (eatingData.closedLongTerm) {
          return LocationState.CLOSED_LONG_TERM;
        }

        const isOpen =
          !eatingData.closedLongTerm &&
          eatingData.statusMsg.indexOf('Closes') != -1;

        if (isOpen) {
          if (eatingData.changesSoon) {
            return LocationState.CLOSES_SOON;
          } else {
            return LocationState.OPEN;
          }
        } else {
          if (eatingData.changesSoon) {
            return LocationState.OPENS_SOON;
          } else {
            return LocationState.CLOSED;
          }
        }
      };

      const locationState = getLocationState();

      // reason for two dictionaries: https://tailwindcss.com/docs/content-configuration#class-detection-in-depth
      // "Don’t construct class names dynamically"
      const textColors: Record<LocationState, string> = {
        [LocationState.OPEN]: 'text-[#19b875]',
        [LocationState.CLOSED]: 'text-[#dd3c18]',
        [LocationState.CLOSED_LONG_TERM]: 'text-[#dd3c18]',
        [LocationState.OPENS_SOON]: 'text-[#f6cc5d]',
        [LocationState.CLOSES_SOON]: 'text-[#f3f65d]',
      };

      const bgColors: Record<LocationState, string> = {
        [LocationState.OPEN]: 'bg-[#19b875]',
        [LocationState.CLOSED]: 'bg-[#dd3c18]',
        [LocationState.CLOSED_LONG_TERM]: 'bg-[#dd3c18]',
        [LocationState.OPENS_SOON]: 'bg-[#f6cc5d]',
        [LocationState.CLOSES_SOON]: 'bg-[#f3f65d]',
      };

      const textColor = textColors[locationState];
      const bgColor = bgColors[locationState];

      const changesSoon =
        locationState == LocationState.CLOSES_SOON ||
        locationState == LocationState.OPENS_SOON;

      return (
        <>
          <div className="mx-3 mt-2">
            <p className="font-bold">{eatingData.name}</p>
            <div className="flex items-center justify-between">
              <p className={textColor}>{eatingData.statusMsg}</p>
              <div
                className={
                  `${bgColor} h-3 w-3 rounded-full ` +
                  (changesSoon ? 'animate-blinking' : 'opacity-100')
                }
              ></div>
            </div>
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
      {renderEateryImage()}
      {renderInfo()}
      {renderButtonsRow()}
    </div>
  );
};

export default Eaterycard;
