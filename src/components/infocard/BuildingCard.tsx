import React, { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import { claimRoom } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Building, EateryInfo, SearchRoom } from '@/types';

import { zoomOnSearchRoom } from '../buildings/mapUtils';
import ButtonsRow from './ButtonsRow';
import EateryInfoDisplay from './EateryInfoDisplay';
import InfoCardImage from './InfoCardImage';

interface Props {
  map: mapkit.Map | null;
  building: Building;
}

const BuildingCard = ({ map, building }: Props) => {
  const dispatch = useAppDispatch();

  const isMobile = useAppSelector((state) => state.ui.isMobile);

  const searchMap = useAppSelector((state) => state.data.searchMap);
  const buildings = useAppSelector((state) => state.data.buildings);
  const eateryData = useAppSelector((state) => state.data.eateryData);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);

  const [eatingData, setEatingData] = useState<
    [SearchRoom, EateryInfo | null][]
  >([]);

  // get eatery data
  useEffect(() => {
    const getEateries = () => {
      return building.floors
        .map((floorLevel) => {
          // remove this later!!!
          if (
            !searchMap[`${building.code}`] ||
            !searchMap[`${building.code}`][floorLevel]
          ) {
            return [];
          }
          const rooms = searchMap[`${building.code}`][`${floorLevel}`];
          return rooms.filter((room) => room.type == 'food');
        })
        .flat();
    };

    const eateries = getEateries();

    const newEatingData: [SearchRoom, EateryInfo | null][] = eateries.map(
      (eatery) => {
        if (eatery.aliases[0]) {
          const data = eateryData[eatery.aliases[0].toUpperCase()];
          return [eatery, data];
        } else {
          return [eatery, null];
        }
      },
    );

    setEatingData(newEatingData);
  }, [building.code, building.floors, eateryData, searchMap]);

  const renderBuildingImage = () => {
    const url = `/assets/location_images/building_room_images/${building.code}/${building.code}.jpg`;

    return <InfoCardImage url={url} alt={`${building.name} Image`} />;
  };

  const renderButtonsRow = () => {
    return <ButtonsRow middleButton={<></>} />;
  };

  const renderEateryCarousel = () => {
    const renderTitle = (eatery: SearchRoom) => {
      return <h3> {eatery.alias}</h3>;
    };

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
            {eatingData.map(([eatery, eateryInfo]) => (
              <div
                key={eatery.id}
                className="cursor-pointer rounded border p-1"
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
            ))}
          </Carousel>
        </div>
      );
    } else {
      const handleClick = (eatery: SearchRoom) => () => {
        dispatch(claimRoom(eatery));
        zoomOnSearchRoom(map, eatery, buildings, floorPlanMap, dispatch);
      };

      return (
        <div className="mx-2 mb-3 max-h-96 space-y-3 overflow-y-auto">
          {eatingData.map(([eatery, eateryInfo]) => (
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
