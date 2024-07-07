import React, { useMemo, useState, useEffect, ReactElement } from 'react';
import { Building, Floor, FloorMap, Room } from '@/types';
import styles from '@/styles/InfoCard.module.css';
import simplify from '@/util/simplify';
import WebsiteList from './WebsiteList';
import {
  getAvailabilityData,
  getImageURL,
  getEatingData,
  getBuildingWebsites,
} from '@/util/data/idToNames';
import clsx from 'clsx';
import EateryCard from './eaterycard';
import NavBar from '../navigation/NavBar';
import AvailabilitySection from './AvailabilitySection';
import { useAppSelector } from '@/lib/hooks';

type WeekAvailability =
  | { [key: string]: [value: string] }[]
  | Record<string, never>;

export interface InfoCardProps {
  setIsNavOpen: (n: boolean) => void;
}

export default function InfoCard({
  setIsNavOpen,
}: InfoCardProps): ReactElement {
  const room = useAppSelector((state) => state.ui.selectedRoom);
  let building = useAppSelector((state) => state.ui.selectedBuilding);
  const isCardOpen = !!(room || building);
  building = useAppSelector((state) => state.ui.focusedBuilding);
  const [imageURL, setImageURL] = useState('');
  const [availabilityData, setAvailabilityData] = useState({});
  const [eatingData, setEatingData] = useState({});
  const [websiteData, setWebsiteData] = useState([]);
  const [background, setBackground] = useState('#fff');
  const [name, setName] = useState('');

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
          setBackground('#fff');
        }
      });
    } else {
      setAvailabilityData({});
      setBackground('#fff');
    }

    setName(
      room
        ? room?.alias
          ? ' ' + room.alias
          : ' ' + building?.code + ' ' + room?.name
        : ' ' + building?.name || 'Building not found',
    );
    if (room?.alias) {
      getEatingData(room?.alias).then((res) => {
        console.log(res);
        setEatingData(res);
      });
    } else {
      setEatingData({});
    }

    if (!room) {
      getBuildingWebsites(building?.code).then((res) => setWebsiteData(res));
    } else {
      setWebsiteData([]);
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
  function websitesApplicable(websiteData: any) {
    if (websiteData && websiteData.length) {
      return <WebsiteList websiteList={websiteData} />;
    }
    return;
  }
  return (
    <div
      id="thisthing"
      className={clsx(
        styles['info-card'],
        isCardOpen && styles['info-card-open'],
      )}
    >
      <div className="pointer-events-auto relative max-h-[800px] w-[100%] rounded-[8px] bg-[#929292] bg-opacity-20 p-2 backdrop-blur-sm">
        {imageURL && (
          <img
            className="relative h-[194px] w-[100%] rounded-lg object-cover"
            alt="Room Image"
            src={imageURL}
          />
        )}

        <NavBar room={room} setIsNavOpen={setIsNavOpen} />

        <div
          className="mb-1 mt-1 opacity-90"
          style={{ zIndex: 102, pointerEvents: 'all', borderRadius: '8px' }}
        >
          {availabilityApplicable(availabilityData)}
          {eatingApplicable(eatingData)}
          {websitesApplicable(websiteData)}
        </div>
      </div>
    </div>
  );
}
