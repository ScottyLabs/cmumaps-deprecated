import React, { ReactElement } from 'react';

import { EateryInfo, LocationState, Room, SearchRoom } from '@/types';

interface Props {
  room: Room | SearchRoom;
  title: ReactElement;
  eateryInfo: EateryInfo | undefined | null;
}

const EateryInfoDisplay = ({ room, title, eateryInfo }: Props) => {
  if (!eateryInfo) {
    return (
      <div className="ml-3 mt-2 flex justify-between">
        <h3>{room.alias || room.name}</h3>
      </div>
    );
  }

  // reason for two dictionaries: https://tailwindcss.com/docs/content-configuration#class-detection-in-depth
  // "Don’t construct class names dynamically"
  const textColors: Record<LocationState, string> = {
    OPEN: 'text-[#31B777]',
    CLOSED: 'text-[#dd3c18]',
    CLOSED_LONG_TERM: 'text-[#dd3c18]',
    OPENS_SOON: 'text-[#f6cc5d]',
    CLOSES_SOON: 'text-[#f3f65d]',
  };

  const bgColors: Record<LocationState, string> = {
    OPEN: 'bg-[#19b875]',
    CLOSED: 'bg-[#dd3c18]',
    CLOSED_LONG_TERM: 'bg-[#dd3c18]',
    OPENS_SOON: 'bg-[#f6cc5d]',
    CLOSES_SOON: 'bg-[#f3f65d]',
  };

  const locationState = eateryInfo.locationState;

  const textColor = textColors[locationState];
  const bgColor = bgColors[locationState];

  const changesSoon =
    locationState == 'CLOSES_SOON' || locationState == 'OPENS_SOON';

  const renderStatusCircle = () => (
    <div
      className={
        `${bgColor} h-2 w-2 rounded-full ` +
        (changesSoon ? 'animate-blinking' : 'opacity-100')
      }
    />
  );

  const renderLocationTimeInfo = () => {
    return (
      <div className="flex items-center justify-between">
        <p className="text-[--color-gray]">{room.name}</p>
        <div className="flex items-center gap-2">
          {renderStatusCircle()}
          <p className={`${textColor}`}>{eateryInfo.statusMsg}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 pb-3 pt-2 font-[500]">
      {title}
      {renderLocationTimeInfo()}
      <p className="mt-2 leading-4">{eateryInfo.shortDescription}</p>
    </div>
  );
};

export default EateryInfoDisplay;
