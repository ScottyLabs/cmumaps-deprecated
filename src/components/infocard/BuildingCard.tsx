import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import { claimRoom } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, SearchRoom } from '@/types';
import { sortEateries } from '@/util/eateryUtils';

import { zoomOnRoom } from '../buildings/mapUtils';
import ButtonsRow from './ButtonsRow';
import EateryInfoDisplay from './EateryInfoDisplay';
import InfoCardImage from './InfoCardImage';

interface Props {
  map: mapkit.Map | null;
  building: Building;
  eateries: SearchRoom[];
}

const BuildingCard = ({ map, building, eateries }: Props) => {
  const dispatch = useAppDispatch();

  const isMobile = useAppSelector((state) => state.ui.isMobile);

  const buildings = useAppSelector((state) => state.data.buildings);
  const eateryData = useAppSelector((state) => state.data.eateryData);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);

  const renderBuildingImage = () => {
    const url = `/assets/location_images/building_room_images/${building.code}/${building.code}.jpg`;

    return <InfoCardImage url={url} alt={`${building.name} Image`} />;
  };

  const renderButtonsRow = () => {
    return <ButtonsRow middleButton={<></>} />;
  };

  const renderEateryCarousel = () => {
    if (!eateryData) {
      return;
    }

    const renderTitle = (eatery: SearchRoom) => {
      return <h3> {eatery.alias}</h3>;
    };

    if (eateries.length === 0) {
      return <></>;
    }

    sortEateries(eateries, eateryData);

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
          />
        );
      };

      return (
        <div className="mb-1">
          <p className="-mb-3 ml-3 text-base text-gray-500">Eateries nearby</p>
          <Carousel
            showDots
            responsive={responsive}
            arrows={false}
            containerClass="react-multi-carousel-list"
            dotListClass="gap-2"
            customDot={<CustomDot />}
          >
            {eateries.map((eatery) => {
              const eateryInfo = eateryData[eatery.alias.toUpperCase()];
              return (
                <div
                  key={eatery.id}
                  className="mx-3 cursor-pointer border"
                  onClick={() => dispatch(claimRoom(eatery))}
                >
                  <div className="carousel-item active">
                    <EateryInfoDisplay
                      room={eatery}
                      title={renderTitle(eatery)}
                      eateryInfo={eateryInfo}
                    />
                  </div>
                </div>
              );
            })}
          </Carousel>
        </div>
      );
    } else {
      const handleClick = (eatery: SearchRoom) => () => {
        dispatch(claimRoom(eatery));
        zoomOnRoom(
          map,
          eatery.id,
          eatery.floor,
          buildings,
          floorPlanMap,
          dispatch,
        );
      };

      return (
        <>
          <p className="mb-2 ml-3 text-base text-gray-500">Eateries nearby</p>
          <div className="max-h-96 space-y-3 overflow-y-auto px-2 pb-3">
            {eateries.map((eatery) => {
              const eateryInfo = eateryData[eatery.alias.toUpperCase()];

              return (
                <div
                  key={eatery.id}
                  className="cursor-pointer rounded border p-1"
                  onClick={handleClick(eatery)}
                >
                  <EateryInfoDisplay
                    room={eatery}
                    title={renderTitle(eatery)}
                    eateryInfo={eateryInfo}
                  />
                </div>
              );
            })}
          </div>
        </>
      );
    }
  };

  return (
    <>
      {renderBuildingImage()}
      <h2 className="ml-3 mt-2">
        {building.name} ({building.code})
      </h2>
      {renderButtonsRow()}
      {renderEateryCarousel()}
    </>
  );
};

export default BuildingCard;
