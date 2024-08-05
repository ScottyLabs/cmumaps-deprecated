import { Polyline } from 'mapkit-react';

import React from 'react';

import { Node } from '@/app/api/findPath/route';
import { useAppSelector } from '@/lib/hooks';

import { positionOnMap } from '../buildings/mapUtils';

const NavLine = () => {
  const recommendedPath = useAppSelector((state) => state.nav.recommendedPath);
  const focusedFloor = useAppSelector((state) => state.ui.focusedFloor);
  return (
    recommendedPath &&
    recommendedPath.length && ( // This will be its own component at some point
      <Polyline
        selected={true}
        points={(recommendedPath || []).map((n: Node) => n.coordinate)}
        enabled={true}
        strokeColor={'red'}
        strokeOpacity={1}
        lineWidth={5}
      ></Polyline>
    )
  );
};

export default NavLine;
