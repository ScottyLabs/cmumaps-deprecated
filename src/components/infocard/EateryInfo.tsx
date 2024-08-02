import React from 'react';

import { Room } from '@/types';
import {
  IReadOnlyExtendedLocation,
  LocationState,
} from '@/util/cmueats/types/locationTypes';

interface Props {
  room: Room;
  eatingData: IReadOnlyExtendedLocation | null;
}

const EateryInfo = ({ room, eatingData }: Props) => {
  if (!eatingData) {
    return <div className="ml-3 mt-2 font-bold"> {room.aliases[0]}</div>;
  }

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

  const renderStatusCircle = () => (
    <div
      className={
        `${bgColor} h-3 w-3 rounded-full ` +
        (changesSoon ? 'animate-blinking' : 'opacity-100')
      }
    />
  );

  return (
    <>
      <div className="mx-3 mt-2">
        <p className="font-bold">{eatingData.name}</p>
        <div className="flex items-center justify-between">
          <p className={textColor}>{eatingData.statusMsg}</p>
          {renderStatusCircle()}
        </div>
      </div>
      <div className="ml-3 mt-2 text-sm">{eatingData.shortDescription}</div>
    </>
  );
};

export default EateryInfo;
