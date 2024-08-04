import { Polyline } from 'mapkit-react';

import React from 'react';

import { node } from '@/app/api/findPath/route';
import { useAppSelector } from '@/lib/hooks';

import { positionOnMap } from '../buildings/mapUtils';

const NavLine = () => {
  const recommendedPath = useAppSelector((state) => state.nav.recommendedPath);

  return (
    recommendedPath && ( // This will be its own component at some point
      <Polyline
        points={(recommendedPath || []).map((n: node) =>
          positionOnMap(
            [n.pos.x, n.pos.y],
            {
              center: {
                latitude: 40.44367399601104,
                longitude: -79.94452069407168,
              },
              scale: 5.85,
              angle: 254,
            },
            [332.58, 327.18],
          ),
        )}
        selected={false}
        enabled={true}
        strokeColor={'red'}
        strokeOpacity={1}
        lineWidth={5}
      ></Polyline>
    )
  );
};

export default NavLine;
