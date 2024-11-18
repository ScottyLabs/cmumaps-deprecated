import { Annotation, Coordinate } from 'mapkit-react';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import { getShuttleRoutesOverlays, shuttlePathToOverlay } from './ShuttleUtils';

interface IconInfo {
  coordinate: Coordinate;
  icon: StaticImport;
  className?: string;
}
interface Props {
  map: mapkit.Map;
}

const ShuttleLine = ({ map }: Props) => {
  const dispatch = useAppDispatch();

  const shuttlePath = useAppSelector((state) => state.nav.shuttlePath);

  const [pathOverlay, setPathOverlay] = useState<mapkit.Overlay[]>([]);

  // no icons for now
  const iconInfos: IconInfo[] = [];

  // calculate the pathOverlay
  useEffect(() => {
    if (!shuttlePath) {
      getShuttleRoutesOverlays().then((res) => setPathOverlay(res));
    } else {
      setPathOverlay(shuttlePathToOverlay(shuttlePath));
    }
  }, [shuttlePath]);

  // render the polylines so they stay on top
  useEffect(() => {
    if (pathOverlay) {
      map.addOverlays(pathOverlay);
    }

    return () => {
      if (pathOverlay) {
        map.removeOverlays(pathOverlay);
      }
    };
  }, [map, map.region, pathOverlay, dispatch]);

  return iconInfos.map((iconInfo, index) => (
    <Annotation
      key={index}
      latitude={iconInfo.coordinate.latitude}
      longitude={iconInfo.coordinate.longitude}
      displayPriority={'required'}
    >
      <Image
        src={iconInfo.icon}
        alt="Icon"
        height={40}
        className={iconInfo.className}
      />
    </Annotation>
  ));
};

export default ShuttleLine;
