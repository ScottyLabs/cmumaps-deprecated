import { Annotation, Polyline } from 'mapkit-react';

import React, { useEffect } from 'react';

import { Node } from '@/app/api/findPath/route';
import { setUserPosition } from '@/lib/features/navSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

const NavLine = () => {
  const dispatch = useAppDispatch();

  const recommendedPath = useAppSelector((state) => state.nav.recommendedPath);
  const userPosition = useAppSelector((state) => state.nav.userPosition);

  // navigator.geolocation.watchPosition((pos)=>{
  //   if (currentBlueDot) mapRef.current?.removeOverlay(currentBlueDot)
  //   points.push([pos.coords.latitude, pos.coords.longitude])
  //   const coord = new mapkit.Coordinate(pos.coords.latitude, pos.coords.longitude);

  //     let circle = new mapkit.CircleOverlay(
  //       coord,
  //       max(min(20, pos.coords.accuracy), 30)
  //     );
  //     style.fillOpacity = min((pos.coords.altitude - 200) / 100, .5);
  //     circle.style = style;
  //     currentBlueDot = mapRef.current?.addOverlay(circle);
  //   },
  //   error,
  //   options
  // );
  useEffect(() => {
    setTimeout(() => {
      navigator?.geolocation?.getCurrentPosition((pos) => {
        const coord = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        dispatch(setUserPosition(coord));
      });
    }, 500);
  }, []);

  return (
    <>
      {userPosition && (
        <Annotation
          latitude={userPosition.latitude}
          longitude={userPosition.longitude}
        >
          <div>YOU ARE HERE</div>
        </Annotation>
      )}
      {recommendedPath && recommendedPath.length && (
        <Polyline
          selected={true}
          points={(recommendedPath || []).map((n: Node) => n.coordinate)}
          enabled={true}
          strokeColor={'red'}
          strokeOpacity={1}
          lineWidth={5}
        ></Polyline>
      )}
    </>
  );
};

export default NavLine;
