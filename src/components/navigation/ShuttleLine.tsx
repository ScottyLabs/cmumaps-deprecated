import { Annotation } from 'mapkit-react';

import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import { getShuttleRoutesOverlays, shuttlePathToOverlay } from './ShuttleUtils';

interface Props {
  map: mapkit.Map;
}

const ShuttleLine = ({ map }: Props) => {
  const dispatch = useAppDispatch();

  const shuttlePath = useAppSelector((state) => state.nav.shuttlePath);

  const [pathOverlay, setPathOverlay] = useState<mapkit.Overlay[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number>(-1);

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

  console.log(hoverIndex);

  return shuttlePath?.routeStops.map((routeStop, index) => (
    <Annotation
      key={index}
      latitude={routeStop.coordinate.latitude}
      longitude={routeStop.coordinate.longitude}
    >
      <div
        onMouseEnter={() => setHoverIndex(index)}
        onMouseLeave={() => setHoverIndex(-1)}
        className={hoverIndex === index ? '' : 'opacity-0'}
      >
        <p>{routeStop.name}</p>
      </div>
    </Annotation>
  ));
};

export default ShuttleLine;
