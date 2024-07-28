import React, { useState, useEffect } from 'react';
import { getImageURL } from '@/util/data/idToNames';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import Image from 'next/image';
import ButtonsRow from './ButtonsRow';
import { Building } from '@/types';

interface Props {
  building: Building;
}

const BuildingCard = ({ building }: Props) => {
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    getImageURL(building.code, null).then((res) => {
      setImageURL(res);
    });
  }, [building]);

  const renderBuildingImage = () => {
    return (
      <div className="relative h-36 w-full">
        <Image
          className="object-cover"
          fill={true}
          alt="Room Image"
          src={imageURL}
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

  const renderEateryCarousel = () => {
    const renderEateryCard = (name: string) => {
      return (
        <div className="h-28 w-[calc(100vw-64px)] rounded-xl border border-[#dddddd] bg-white p-3">
          {name}
        </div>
      );
    };

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
      <div className="flex-column flex gap-2.5 pl-4">
        <p className="my-0 font-medium">Eateries nearby</p>
        <Carousel
          responsive={responsive}
          partialVisible
          showDots
          removeArrowOnDeviceType={['tablet', 'mobile']}
          containerClass="!items-start h-[8.5rem]"
          sliderClass=""
          dotListClass="flex flex-row gap-2"
          customDot={<CustomDot />}
        >
          <div className="carousel-item active">
            {renderEateryCard('Eatery 1')}
          </div>
          <div className="carousel-item active">
            {renderEateryCard('Eatery 2')}
          </div>
          <div className="carousel-item active">
            {renderEateryCard('Eatery 3')}
          </div>
        </Carousel>
      </div>
    );
  };

  return (
    <div>
      {imageURL && renderBuildingImage()}
      <div className="ml-3 mt-2 font-bold">{building.name}</div>
      {renderButtonsRow()}
      {renderEateryCarousel()}
    </div>
  );
};

export default BuildingCard;
