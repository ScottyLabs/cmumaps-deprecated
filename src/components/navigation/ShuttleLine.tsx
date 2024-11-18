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
  const hoveredShuttleStopIndex = useAppSelector(
    (state) => state.nav.hoveredShuttleStopIndex,
  );

  const [pathOverlay, setPathOverlay] = useState<mapkit.Overlay[]>([]);

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

  return shuttlePath?.routeStops.map((routeStop, index) => (
    <Annotation
      key={index}
      latitude={routeStop.coordinate.latitude}
      longitude={routeStop.coordinate.longitude}
      visible={index == hoveredShuttleStopIndex}
    >
      <p>{routeStop.name}</p>
    </Annotation>
  ));
};

export default ShuttleLine;
