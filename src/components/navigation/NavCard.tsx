import alternativeIcon from '@icons/nav/alternative.svg';
import fastestIcon from '@icons/nav/fastest.svg';
import swapIcon from '@icons/nav/swap.svg';
import endIcon from '@icons/path/end.svg';
import startIcon from '@icons/path/start.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

import React, { ReactElement, useEffect } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { toast } from 'react-toastify';

import {
  setChoosingRoomMode,
  setSelectedPathName,
  setEndLocation,
  setIsNavOpen,
  setRecommendedPath,
  setStartLocation,
  setStartedNavigation,
  setCurFloorIndex,
} from '@/lib/features/navSlice';
import { setIsSearchOpen } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, Room } from '@/types';

import CardWrapper from '../infocard/CardWrapper';
import NavDirections from './NavDirections';

const pathNameToIcon = {
  fastest: fastestIcon,
  other: alternativeIcon,
};

export default function NavCard(): ReactElement {
  const dispatch = useAppDispatch();

  const startLocation = useAppSelector((state) => state.nav.startLocation);
  const endLocation = useAppSelector((state) => state.nav.endLocation);
  const recommendedPath = useAppSelector((state) => state.nav.recommendedPath);
  const selectedPathName = useAppSelector(
    (state) => state.nav.selectedPathName,
  );
  const startedNavigation = useAppSelector(
    (state) => state.nav.startedNavigation,
  );

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
          if (j.fastest.error) {
            toast.error('Sorry, we are not able to find a path :(');
          } else if (j.other.error) {
            dispatch(setRecommendedPath({ fastest: j.fastest }));
          } else {
            dispatch(setRecommendedPath(j));
            dispatch(setSelectedPathName(Object.keys(j)[0]));
          }
        });
    }
  }, [startLocation, endLocation, dispatch]);

  const renderTop = () => {
    return (
      <div className="flex items-center gap-1 py-2">
        <IoIosArrowBack
          size={20}
          className="cursor-pointer text-gray-500"
          onClick={() => {
            dispatch(setRecommendedPath(null));
            dispatch(setIsNavOpen(false));
          }}
        />
        <h1 className="font-bold">Navigation</h1>
      </div>
    );
  };

  const renderRoomInput = (
    navLocation: Room | Building | null,
    placeHolder: string,
    icon: StaticImport,
    handleClick: () => void,
  ) => {
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
      <div className="flex w-fit items-center gap-2 border p-1">
        <Image src={icon} alt="icon" height={20} />
        <button
          className="w-72 text-left"
          onClick={() => {
            handleClick();
            dispatch(setIsSearchOpen(true));
          }}
        >
          {renderText()}
        </button>
      </div>
    );
  };

  const renderStartRoomInput = () => {
    const placeHolder = 'Choose your starting location...';

    const handleClick = () => {
      dispatch(setChoosingRoomMode('start'));
    };

    return renderRoomInput(startLocation, placeHolder, startIcon, handleClick);
  };

  const renderEndRoomInput = () => {
    const placeHolder = 'Choose your destination...';

    const handleClick = () => {
      dispatch(setChoosingRoomMode('end'));
    };

    return renderRoomInput(endLocation, placeHolder, endIcon, handleClick);
  };

  const renderPathInfo = (pathName: string) => {
    return (
      <div key={pathName} className="flex w-full justify-center">
        <button
          className={`w-[22.5rem] rounded-lg border py-2 ${pathName == selectedPathName ? 'bg-[#1e86ff] text-white' : 'text-gray-600'}`}
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
                  className={`text-lg ${pathName == selectedPathName ? 'text-gray-800"' : 'text-gray-600'}`}
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
    const renderGoButton = () => {
      return (
        <div className="flex w-full justify-center">
          <button
            className="btn-shadow w-[22.5rem] rounded-lg bg-[#31B777] py-2"
            onClick={() => dispatch(setStartedNavigation(true))}
          >
            <p className="text-white">GO</p>
          </button>
        </div>
      );
    };

    const renderCancelButton = () => {
      return (
        <div className="flex w-full justify-center">
          <button
            className="btn-shadow w-[22.5rem] rounded-lg bg-[#c41230] py-2"
            onClick={() => {
              dispatch(setCurFloorIndex(0));
              dispatch(setStartedNavigation(false));
            }}
          >
            <p className="text-white">Cancel</p>
          </button>
        </div>
      );
    };

    return (
      <>
        {!startedNavigation ? renderGoButton() : renderCancelButton()}
        {!startedNavigation ? (
          renderPathWrapper()
        ) : (
          <NavDirections path={recommendedPath[selectedPathName]} />
        )}
      </>
    );
  };

  const renderSwapButton = () => {
    return (
      <button
        onClick={() => {
          dispatch(setStartLocation(endLocation));
          dispatch(setEndLocation(startLocation));
        }}
      >
        <Image src={swapIcon} alt="Swap Icon" />
      </button>
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
          {renderSwapButton()}
        </div>
        {!!startLocation &&
          !!endLocation &&
          !!recommendedPath &&
          renderNavInfo()}
      </div>
    </CardWrapper>
  );
}
