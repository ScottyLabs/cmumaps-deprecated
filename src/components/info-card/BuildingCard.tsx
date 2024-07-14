import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetRef } from 'react-modal-sheet';
import Image from 'next/image';
import { getImageURL } from '@/util/data/idToNames';
import { useAppSelector } from '@/lib/hooks';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  ArrowUpOnSquareIcon,
} from '@heroicons/react/24/outline';

const BuildingCard = () => {
  const room = useAppSelector((state) => state.ui.selectedRoom);
  let building = useAppSelector((state) => state.ui.selectedBuilding);
  building = useAppSelector((state) => state.ui.focusedBuilding);
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    getImageURL(building?.code || '', room?.name || null).then((res) => {
      setImageURL(res);
    });
  }, [building, room]);

  interface CardProps {
    buttonName: string;
    buttonIcon: React.ReactElement;
    children: React.ReactElement;
  }

  const Card = ({ buttonName, buttonIcon, children }: CardProps) => {
    const [isOpen, setOpen] = useState(true);
    const ref = useRef<SheetRef>();
    const snapPoints = [0.5, 0.25, 0.1, 32];
    const snapTo = (i: number) => ref.current?.snapTo(i);

    useEffect(() => {
      if (!isOpen) {
        setOpen(true);
        snapTo(3);
      }
    }, [isOpen]);

    return (
      <Sheet
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        onOpenEnd={() => setOpen(true)}
        snapPoints={snapPoints}
      >
        <Sheet.Container className="!rounded-t-2xl">
          <Sheet.Header className="h-9" />
          <Sheet.Content>
            <Sheet.Scroller draggableAt="top">
              <div className="relative h-36 w-full">
                <Image
                  className="object-cover"
                  fill={true}
                  alt="Room Image"
                  src={imageURL}
                />
              </div>
              <div className="flex-column flex gap-3 py-3">
                <div className="mx-3 flex h-7 flex-row items-stretch justify-start gap-2.5">
                  <button
                    type="button"
                    className="flex h-full w-fit flex-row items-center gap-1.5 rounded-lg bg-[#56b57b] px-2 py-1 text-white"
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                    <p className="mb-0 text-xs">Directions</p>
                    <p className="mb-0 ml-2 text-xs font-light">5 min</p>
                  </button>
                  <button
                    type="button"
                    className="flex h-full w-fit flex-row items-center rounded-lg bg-[#1e86ff] px-2 py-1 text-white"
                  >
                    {buttonIcon}
                    <p className="my-0 text-xs">{buttonName}</p>
                  </button>
                  <button
                    type="button"
                    className="ml-auto flex size-7 items-center justify-center rounded-full bg-[#b5b5b5]"
                  >
                    <ArrowUpOnSquareIcon className="h-4 w-4 stroke-white" />
                  </button>
                </div>
                {children}
              </div>
            </Sheet.Scroller>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    );
  };

  const Eatery = ({ name }: { name: string }) => {
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
    <Card
      buttonName="Find rooms"
      buttonIcon={<MagnifyingGlassIcon className="mr-2 h-4 w-4 stroke-white" />}
    >
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
            <Eatery name="Eatery 1" />
          </div>
          <div className="carousel-item active">
            <Eatery name="Eatery 2" />
          </div>
          <div className="carousel-item active">
            <Eatery name="Eatery 3" />
          </div>
        </Carousel>
      </div>
    </Card>
  );
};

export default BuildingCard;
