import Image from 'next/image';

import React, { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import { claimRoom } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, SearchRoom } from '@/types';
import { getEatingData } from '@/util/cmueats/getEatingData';
import { IReadOnlyExtendedLocation } from '@/util/cmueats/types/locationTypes';

import ButtonsRow from './ButtonsRow';
import EateryInfo from './EateryInfo';
import searchIcon from '/public/assets/icons/search.svg';

interface Props {
  building: Building;
}

const BuildingCard = ({ building }: Props) => {
  const dispatch = useAppDispatch();

  const isMobile = useAppSelector((state) => state.ui.isMobile);
  const floorMap = useAppSelector((state) => state.data.searchMap);

  const [eatingData, setEatingData] = useState<
    [SearchRoom, IReadOnlyExtendedLocation | null][]
  >([]);

  useEffect(() => {
    const getEateries = () => {
      return building.floors
        .map((floorLevel) => {
          // remove this later!!!
          if (
            !floorMap[`${building.code}`] ||
            !floorMap[`${building.code}`][floorLevel]
          ) {
            return [];
          }
          const rooms = floorMap[`${building.code}`][`${floorLevel}`];
          return rooms.filter((room) => room.type == 'dining');
        })
        .flat();
    };

    const fetchEatingData = async () => {
      const eateries = getEateries();

      const newEatingData: [SearchRoom, IReadOnlyExtendedLocation | null][] =
        await Promise.all(
          eateries.map(async (eatery) => {
            if (eatery.aliases[0]) {
              const data = await getEatingData(eatery.aliases[0]);
              return [eatery, data];
            } else {
              return [eatery, null];
            }
          }),
        );

      setEatingData(newEatingData);
    };

    fetchEatingData();
  }, [building.code, building.floors, floorMap]);

  const renderBuildingImage = () => {
    const url = `/assets/location_images/building_room_images/${building.code}/${building.code}.jpg`;

    return (
      <div className="relative h-36 object-cover">
        <Image
          src={url}
          alt={building.name + ' image'}
          fill={true}
          sizes="99vw"
        />
      </div>
    );
  };

  const renderButtonsRow = () => {
    const renderMiddleButton = () => (
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg bg-[#1e86ff] px-3 py-1 text-white"
      >
        <Image alt="Search Icon" src={searchIcon} className="size-3.5" />
        <p>Find rooms</p>
      </button>
    );

    return <ButtonsRow middleButton={renderMiddleButton()} />;
  };

  const renderEateryCarousel = () => {
    if (isMobile) {
      const responsive = {
        superLargeDesktop: {
          breakpoint: { max: 4000, min: 3000 },
          items: 5,
        },
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 3,
        },
        tablet: {
          breakpoint: { max: 1024, min: 464 },
          items: 2,
        },
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 1,
          partialVisibilityGutter: 30,
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const CustomDot = ({ onClick, active }: any) => {
        return (
          <button
            className={
              'h-2 w-2 rounded-full ' +
              `${active ? 'bg-[#8e8e8e]' : 'bg-[#f1f1f1]'}`
            }
            onClick={() => onClick()}
          ></button>
        );
      };

      return (
        <div className="mb-1 ml-2">
          <p className="my-0 font-medium">Eateries nearby</p>
          <Carousel
            responsive={responsive}
            showDots
            arrows={false}
            dotListClass="gap-2"
            customDot={<CustomDot />}
          >
            {eatingData.map(([eatery, eatingData]) => (
              <div
                key={eatery.id}
                className="cursor-pointer rounded border p-1"
                onClick={() => dispatch(claimRoom(eatery))}
              >
                <div className="carousel-item active">
                  <EateryInfo room={eatery} eatingData={eatingData} />
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      );
    } else {
      return (
        <div className="mx-2 mb-3 space-y-3 overflow-y-scroll">
          {eatingData.map(([eatery, eatingData]) => (
            <div
              key={eatery.id}
              className="cursor-pointer rounded border p-1"
              onClick={() => dispatch(claimRoom(eatery))}
            >
              <EateryInfo room={eatery} eatingData={eatingData} />
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <>
      {renderBuildingImage()}
      <h2 className="ml-3 mt-2">{building.name}</h2>
      {renderButtonsRow()}
      {renderEateryCarousel()}
    </>
  );
};

export default BuildingCard;
