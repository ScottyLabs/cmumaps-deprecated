import alternativeIcon from '@icons/nav/alternative.svg';
import fastestIcon from '@icons/nav/fastest.svg';
import swapIcon from '@icons/nav/swap.svg';
import Image from 'next/image';

import React, { ReactElement, useEffect } from 'react';
import { IoIosArrowBack } from 'react-icons/io';

import { Node } from '@/app/api/findPath/route';
import {
  setChoosingRoomMode,
  setSelectedPathName,
  setEndLocation,
  setIsNavOpen,
  setRecommendedPath,
  setStartLocation,
} from '@/lib/features/navSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, Room } from '@/types';

import CardWrapper from '../infocard/CardWrapper';

const pathNameToIcon = {
  fastest: fastestIcon,
  other: alternativeIcon,
};

export default function NavCard(): ReactElement {
  const dispatch = useAppDispatch();

  const startLocation = useAppSelector((state) => state.nav.startLocation);
  const endLocation = useAppSelector((state) => state.nav.endLocation);
  const recommendedPath = useAppSelector((state) => state.nav.recommendedPath);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const displayPathName = useAppSelector((state) => state.nav.selectedPathName);

  // calculate path from start to end
  useEffect(() => {
    if (startLocation && endLocation) {
      fetch('/api/findPath', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rooms: [startLocation, endLocation] }),
      })
        .then((r) => {
          try {
            return r.json();
          } catch {
            return [];
          }
        })
        .then((j) => {
          dispatch(setRecommendedPath(j));
        });
    }
  }, [startLocation, endLocation, dispatch]);

  const renderTop = () => {
    return (
      <div className="flex items-center gap-1 py-2">
        <IoIosArrowBack
          size={20}
          className="cursor-pointer text-gray-500"
          onClick={() => dispatch(setIsNavOpen(false))}
        />
        <h1 className="font-bold">Navigation</h1>
      </div>
    );
  };

  const renderRoomInput = (
    navLocation: Room | Building | null,
    placeHolder: string,
    circleColor: string,
    handleClick: () => void,
  ) => {
    const renderCircle = () => {
      return <div className={`h-5 w-5 rounded-full ${circleColor}`} />;
    };

    const renderText = () => {
      if (navLocation) {
        if ('floor' in navLocation) {
          if (navLocation.alias) {
            return <p>{navLocation.alias}</p>;
          }

          return (
            <p>{navLocation.floor?.buildingCode + ' ' + navLocation.name}</p>
          );
        } else {
          return <p>{navLocation.name}</p>;
        }
      } else {
        return <p className="text-[gray]">{placeHolder}</p>;
      }
    };

    return (
      <div className="flex w-fit gap-2 border p-1">
        {renderCircle()}
        <button className="w-72 text-left" onClick={handleClick}>
          {renderText()}
        </button>
      </div>
    );
  };

  const renderStartRoomInput = () => {
    const placeHolder = 'Choose your starting location...';
    const circleColor = 'bg-green-700';

    const handleClick = () => {
      dispatch(setChoosingRoomMode('start'));
    };

    return renderRoomInput(
      startLocation,
      placeHolder,
      circleColor,
      handleClick,
    );
  };

  const renderEndRoomInput = () => {
    const placeHolder = 'Choose your destination...';
    const circleColor = 'bg-red-700';

    const handleClick = () => {
      dispatch(setChoosingRoomMode('end'));
    };

    return renderRoomInput(endLocation, placeHolder, circleColor, handleClick);
  };

  const renderDirections = (path: Node[]) => {
    if (path) {
      const passedByRooms: Room[] = [];
      for (const node of path) {
        if (!passedByRooms.at(-1) || node.roomId != passedByRooms.at(-1).id) {
          const floorArr = node.floor.split('-');
          const buildingCode = floorArr[0];
          const level = floorArr[1];
          passedByRooms.push(floorPlanMap[buildingCode][level][node.roomId]);
        }
      }

      return passedByRooms.map((room) => {
        if (room.name) {
          return <p key={room.id}>{room.name}</p>;
        }
      });
    }
  };

  const renderPathInfo = (pathName: string) => {
    return (
      <div key={pathName} className="flex w-full justify-center">
        <button
          className={`w-[22.5rem] rounded-lg border py-2 ${pathName == displayPathName ? 'bg-[#1e86ff] text-white' : 'text-gray-600'}`}
          onClick={() => dispatch(setSelectedPathName(pathName))}
        >
          <div className="mx-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={pathNameToIcon[pathName]}
                alt="Nav Path Icon"
                height={40}
              />
              <div>
                <p
                  className={`text-lg ${pathName == displayPathName ? 'text-gray-800"' : 'text-gray-600'}`}
                >
                  {pathName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p>Time Placeholder</p>
              <p>Distance Placeholder</p>
            </div>
          </div>
        </button>
      </div>
    );
  };

  const renderPathWrapper = () => {
    return (
      <div className="my-2 space-y-2">
        {Object.keys(recommendedPath).map((pathName) =>
          renderPathInfo(pathName),
        )}
      </div>
    );
  };

  const renderNavInfo = () => {
    return (
      <>
        <div className="flex w-full justify-center">
          <button className="btn-shadow w-[22.5rem] rounded-lg bg-[#31B777] py-2">
            <p className="text-white">GO</p>
          </button>
        </div>

        {renderPathWrapper()}
      </>
    );
  };

  return (
    <CardWrapper snapPoint={0.5}>
      <div>
        {renderTop()}
        <div className="flex gap-2">
          <div className="space-y-2 pb-2 pl-4">
            {renderStartRoomInput()}
            {renderEndRoomInput()}
          </div>
          <button
            onClick={() => {
              dispatch(setStartLocation(endLocation));
              dispatch(setEndLocation(startLocation));
            }}
          >
            <Image src={swapIcon} alt="Swap Icon" />
          </button>
        </div>
        {!!startLocation &&
          !!endLocation &&
          !!recommendedPath &&
          renderNavInfo()}
      </div>
    </CardWrapper>
  );
}
