import React, { useMemo, useState, useEffect, ReactElement } from 'react';
import { Building, Floor, FloorMap, Room } from '@/types';
// import styles from '@/styles/InfoCard.module.css';
import simplify from '@/util/simplify';
import WebsiteList from './WebsiteList';
import {
  getAvailabilityData,
  getImageURL,
  getEatingData,
} from '@/util/data/idToNames';
// import clsx from 'clsx';
import EateryCard from './eaterycard';
import NavBar from '../navigation/NavBar';
import AvailabilitySection from './AvailabilitySection';
import { useAppSelector } from '@/lib/hooks';

type WeekAvailability =
  | { [key: string]: [value: string] }[]
  | Record<string, never>;

export default function InfoCard(): ReactElement {
  const room = useAppSelector((state) => state.ui.selectedRoom);
  let building = useAppSelector((state) => state.ui.selectedBuilding);
  const isCardOpen = !!(room || building); // Card is open iff room is selected, or building is selected

  // But we need the focused building, which is the same as selected building if selected building exists
  building = useAppSelector((state) => state.ui.focusedBuilding);

  const [imageURL, setImageURL] = useState('');
  const [availabilityData, setAvailabilityData] = useState({});
  const [eatingData, setEatingData] = useState({});
  const [websiteData, setWebsiteData] = useState([]);

  useEffect(() => {
    getImageURL(building?.code || '', room?.name || null).then((res) => {
      setImageURL(res);
    });

    if (room && building) {
      getAvailabilityData(building.code, room.name).then((res) => {
        if (res) {
          setAvailabilityData(res);
        } else {
          setAvailabilityData({});
        }
      });
    } else {
      setAvailabilityData({});
    }

    if (room?.alias) {
      getEatingData(room?.alias).then((res) => {
        console.log(res);
        setEatingData(res);
      });
    } else {
      setEatingData({});
    }
  }, [building, room]);

  function availabilityApplicable(avail: WeekAvailability) {
    if (Object.keys(avail).length) {
      return <AvailabilitySection availability={avail} />;
    }
    return;
  }
  function eatingApplicable(eatData: any) {
    if (eatData && Object.keys(eatData).length) {
      return <EateryCard location={eatData} />;
    }
    return;
  }
  return (
    <div
      className={
        // clsx(
        //   styles['info-card'],
        //   isCardOpen && styles['info-card-open'],
        // )
        'absolute left-0 top-auto z-[101] w-full rounded-lg md:bottom-[150px] md:top-0 md:w-[var(--search-width-desktop)] ' +
        'p-[var(--main-ui-padding)] py-[calc(calc(var(--main-ui-padding)+var(--search-box-height)+var(--main-ui-padding)))]' +
        'transition-transform duration-[var(--search-transition-duration)] ease-in-out motion-reduce:transition-none' +
        `${isCardOpen ? 'motion-reduce:pointer-events-none motion-reduce:transform-none' : 'translate-y-[100vh]'}`
      }
    >
      <div className="pointer-events-auto relative max-h-[800px] w-[100%] rounded-[8px] bg-[#929292] bg-opacity-20 p-2 backdrop-blur-sm">
        {imageURL && (
          <img
            className="relative h-[194px] w-[100%] rounded-lg object-cover"
            alt="Room Image"
            src={imageURL}
          />
        )}

        <NavBar room={room} />

        <div
          className="mb-1 mt-1 opacity-90"
          style={{ zIndex: 102, pointerEvents: 'all', borderRadius: '8px' }}
        >
          {availabilityApplicable(availabilityData)}
          {eatingApplicable(eatingData)}
        </div>
      </div>
    </div>
  );
}
