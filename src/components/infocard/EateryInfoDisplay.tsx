import React, { ReactElement } from 'react';

import { EateryInfo, LocationState, Room, SearchRoom } from '@/types';

interface Props {
  room: Room | SearchRoom;
  title: ReactElement;
  eateryInfo: EateryInfo | undefined | null;
}

// reason for two dictionaries: https://tailwindcss.com/docs/content-configuration#class-detection-in-depth
// "Don’t construct class names dynamically"
const textColors: Record<LocationState, string> = {
  OPEN: 'text-[#31B777]',
  CLOSED: 'text-[#dd3c18]',
  CLOSED_LONG_TERM: 'text-[#dd3c18]',
  OPENS_SOON: 'text-[#3BB9CA]',
  CLOSES_SOON: 'text-[#FFBD59]',
};

const bgColors: Record<LocationState, string> = {
  OPEN: 'bg-[#19b875]',
  CLOSED: 'bg-[#dd3c18]',
  CLOSED_LONG_TERM: 'bg-[#dd3c18]',
  OPENS_SOON: 'bg-[#3BB9CA]',
  CLOSES_SOON: 'bg-[#FFBD59]',
};

const EateryInfoDisplay = ({ room, title, eateryInfo }: Props) => {
  if (!eateryInfo) {
    return (
      <div className="ml-3 mt-2 flex justify-between">
        <h3>{room.alias || room.name}</h3>
      </div>
    );
  }

  const locationState = eateryInfo.locationState;

  const renderStatusCircle = () => {
    const changesSoon =
      locationState == 'CLOSES_SOON' || locationState == 'OPENS_SOON';
    const bgColor = bgColors[locationState];

    return (
      <div
        className={
          `${bgColor} h-2 w-2 rounded-full ` +
          (changesSoon ? 'animate-blinking' : 'opacity-100')
        }
      />
    );
  };

  const renderLocationTimeInfo = () => {
    const textColor = textColors[locationState];

    return (
      <div className="flex items-center justify-between">
        <p className="text-[--color-gray]">
          {room.floor.buildingCode} {room.name}
        </p>
        <div className="flex items-center gap-2">
          {renderStatusCircle()}
          <p className={`${textColor}`}>{eateryInfo.statusMsg}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 pb-3 pt-2 text-left font-[500]">
      {title}
      {renderLocationTimeInfo()}
      <p className="mt-2 leading-4">{eateryInfo.shortDescription}</p>
    </div>
  );
};

export default EateryInfoDisplay;
