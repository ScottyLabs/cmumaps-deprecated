import { Room } from '@/types';
import { getEatingData } from '@/util/data/idToNames';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  IReadOnlyExtendedLocation,
  LocationState,
} from '@/util/cmueats/types/locationTypes';
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
      const colors: Record<LocationState, string> = {
        [LocationState.OPEN]: '#19b875',
        [LocationState.CLOSED]: '#dd3c18',
        [LocationState.CLOSED_LONG_TERM]: '#dd3c18',
        [LocationState.OPENS_SOON]: '#f6cc5d',
        [LocationState.CLOSES_SOON]: '#f3f65d',
      };

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

      const color = colors[getLocationState()];

      console.log(`bg-[${color}]`);

      return (
        <>
          <div className="mx-3 mt-2">
            <p className="font-bold">{eatingData.name}</p>
            <div className="flex items-center justify-between">
              <p className={`text-[${color}]`}>{eatingData.statusMsg}</p>
              <div
                className={
                  `h-3 w-3 rounded-full bg-[${color}] ` +
                  (eatingData.changesSoon ? 'animate-blinking' : 'opacity-100')
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
      {eatingData && renderEateryImage()}
      {renderInfo()}
      {renderButtonsRow()}
    </div>
  );
};

export default Eaterycard;
