import shuttleIcon from '@icons/quick_search/shuttle.svg';
import { Annotation, Coordinate } from 'mapkit-react';
import Image from 'next/image';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import { getShuttleRoutesOverlays, shuttlePathToOverlay } from './ShuttleUtils';

interface Props {
  map: mapkit.Map;
}

const ShuttleLine = ({ map }: Props) => {
  const dispatch = useAppDispatch();

  const shuttlePath = useAppSelector((state) => state.nav.shuttlePath);
  const hoveredShuttleStopIndex = useAppSelector(
    (state) => state.nav.hoveredShuttleStopIndex,
  );

  const [pathOverlay, setPathOverlay] = useState<mapkit.Overlay[]>([]);
  const [shuttleLocation, setShuttleLocation] = useState<Coordinate | null>();

  const hasAlerted = useRef(false);

  // calculate the pathOverlay
  useEffect(() => {
    if (!shuttlePath) {
      getShuttleRoutesOverlays().then((res) => setPathOverlay(res));
    } else {
      // reset alert
      hasAlerted.current = false;

      setPathOverlay(shuttlePathToOverlay(shuttlePath));

      const getShuttleLocation = async () => {
        const response = await fetch('/api/getLiveShuttleGPS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            routeId: shuttlePath.routeId,
          }),
        });

        if (!response.ok) {
          toast.error('Shuttle Route not running!');
          setShuttleLocation(null);
          hasAlerted.current = true;
          return;
        }

        const body = await response.json();

        setShuttleLocation(body.location);
      };

      getShuttleLocation();

      // update shuttle location every 3 seconds
      const intervalId = setInterval(() => {
        if (!hasAlerted.current) {
          getShuttleLocation();
        }
      }, 3000);

      return () => clearInterval(intervalId);
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

  const displayShuttleLocation = () => {
    if (shuttleLocation) {
      return (
        <Annotation
          latitude={shuttleLocation.latitude}
          longitude={shuttleLocation.longitude}
        >
          <Image
            alt={'Shuttle Pin'}
            src={shuttleIcon}
            className="size-5 rounded-full bg-black p-2"
          />
        </Annotation>
      );
    }
  };

  return (
    <>
      {displayShuttleLocation()}
      {shuttlePath?.routeStops.map((routeStop, index) => (
        <Annotation
          key={index}
          latitude={routeStop.coordinate.latitude}
          longitude={routeStop.coordinate.longitude}
          visible={index == hoveredShuttleStopIndex}
        >
          <p>{routeStop.name}</p>
        </Annotation>
      ))}
    </>
  );
};

export default ShuttleLine;
