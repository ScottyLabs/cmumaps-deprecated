import Image from 'next/image';

import React, { useEffect, useState } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
// import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import { claimRoom } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, Room } from '@/types';
import { getEatingData } from '@/util/cmueats/getEatingData';
import { IReadOnlyExtendedLocation } from '@/util/cmueats/types/locationTypes';

import ButtonsRow from './ButtonsRow';
import EateryInfo from './EateryInfo';

interface Props {
  building: Building;
}

const BuildingCard = ({ building }: Props) => {
  const dispatch = useAppDispatch();

  const floorMap = useAppSelector((state) => state.data.floorMap);

  const [eatingData, setEatingData] = useState<
    [Room, IReadOnlyExtendedLocation | null][]
  >([]);

  useEffect(() => {
    const getEateries = () => {
      return building.floors
        .map((floor) => {
          // remove this later!!!
          if (!floorMap[`${building.code}-${floor.level}`]) {
            return [];
          }
          const rooms = floorMap[`${building.code}-${floor.level}`].rooms;
          // return Object.values(rooms).filter((room) => room.type == 'dining');
          return Object.values(rooms).filter(
            (room) =>
              room.aliases[0] == 'Revolution Noodle' ||
              room.aliases[0] == 'Schatz Dining Room' ||
              room.aliases[0] == 'Au Bon Pain at Skibo Café',
          );
        })
        .flat();
    };

    const fetchEatingData = async () => {
      const eateries = getEateries();

      const newEatingData: [Room, IReadOnlyExtendedLocation | null][] =
        await Promise.all(
          eateries.map(async (eatery) => {
            const data = await getEatingData(eatery.aliases[0]);
            return [eatery, data];
          }),
        );

      setEatingData(newEatingData);
    };

    fetchEatingData();
  }, [building.code, building.floors, floorMap]);

  const renderBuildingImage = () => {
    const url = `/assets/location_images/building_room_images/${building.code}/${building.code}.jpg`;

    return (
      <div className="relative h-36">
        <Image
          className="object-cover"
          fill={true}
          alt="Room Image"
          src={url}
          sizes="100vw"
        />
      </div>
    );
  };

  const renderButtonsRow = () => {
    const renderMiddleButton = () => (
      <button
        type="button"
        className="flex rounded-lg bg-[#1e86ff] px-2 py-1 text-white"
      >
        <HiMagnifyingGlass className="mr-2" />
        <p className="my-0 text-xs">Find rooms</p>
      </button>
    );

    return <ButtonsRow middleButton={renderMiddleButton()} />;
  };

  // const renderEateryCarousel = () => {
  //   const renderEateryCard = (name: string) => {
  //     return (
  //       <div className="h-28 w-[calc(100vw-64px)] rounded-xl border border-[#dddddd] bg-white p-3">
  //         {name}
  //       </div>
  //     );
  //   };

  //   const responsive = {
  //     superLargeDesktop: {
  //       breakpoint: { max: 4000, min: 3000 },
  //       items: 5,
  //     },
  //     desktop: {
  //       breakpoint: { max: 3000, min: 1024 },
  //       items: 3,
  //     },
  //     tablet: {
  //       breakpoint: { max: 1024, min: 464 },
  //       items: 2,
  //     },
  //     mobile: {
  //       breakpoint: { max: 464, min: 0 },
  //       items: 1,
  //       partialVisibilityGutter: 30,
  //     },
  //   };

  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const CustomDot = ({ onClick, active }: any) => {
  //     return (
  //       <button
  //         className={
  //           'h-2 w-2 rounded-full ' +
  //           `${active ? 'bg-[#8e8e8e]' : 'bg-[#f1f1f1]'}`
  //         }
  //         onClick={() => onClick()}
  //       ></button>
  //     );
  //   };

  //   return (
  //     <div className="flex-column flex gap-2.5 pl-4">
  //       <p className="my-0 font-medium">Eateries nearby</p>
  //       <Carousel
  //         responsive={responsive}
  //         partialVisible
  //         showDots
  //         removeArrowOnDeviceType={['tablet', 'mobile']}
  //         containerClass="!items-start h-[8.5rem]"
  //         sliderClass=""
  //         dotListClass="flex flex-row gap-2"
  //         customDot={<CustomDot />}
  //       >
  //         <div className="carousel-item active">
  //           {renderEateryCard('Eatery 1')}
  //         </div>
  //         <div className="carousel-item active">
  //           {renderEateryCard('Eatery 2')}
  //         </div>
  //         <div className="carousel-item active">
  //           {renderEateryCard('Eatery 3')}
  //         </div>
  //       </Carousel>
  //     </div>
  //   );
  // };

  const renderEateryCarousel = () => {
    return (
      <div className="mx-2 mb-3 space-y-3">
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
  };

  return (
    <div>
      {renderBuildingImage()}
      <h2 className="ml-3 mt-2">{building.name}</h2>
      {renderButtonsRow()}
      {renderEateryCarousel()}
    </div>
  );
};

export default BuildingCard;
