import { Polyline } from 'mapkit-react';

import React from 'react';

import { Node } from '@/app/api/findPath/route';
import { useAppSelector } from '@/lib/hooks';

const NavLine = () => {
  const recommendedPath = useAppSelector((state) => state.nav.recommendedPath);

  return (
    recommendedPath?.fastest &&
    !!recommendedPath.fastest.length && (
      <>
        <Polyline
          selected={true}
          points={(recommendedPath?.fastest || []).map(
            (n: Node) => n.coordinate,
          )}
          enabled={true}
          strokeColor={'red'}
          strokeOpacity={0.5}
          lineWidth={5}
        />
        <Polyline
          selected={true}
          points={(recommendedPath?.other || []).map((n: Node) => n.coordinate)}
          enabled={true}
          strokeColor={'blue'}
          strokeOpacity={0.5}
          lineWidth={5}
        />
      </>
    )
  );
};

export default NavLine;
