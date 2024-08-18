import { Polyline } from 'mapkit-react';

import React from 'react';

import { Node } from '@/app/api/findPath/route';
import { useAppSelector } from '@/lib/hooks';

interface Props {
  startedNavigation: boolean;
}

const NavLine = ({ startedNavigation }: Props) => {
  startedNavigation;

  const recommendedPath = useAppSelector((state) => state.nav.recommendedPath);
  const selectedPathName = useAppSelector(
    (state) => state.nav.selectedPathName,
  );

  return (
    recommendedPath &&
    Object.keys(recommendedPath).map((pathName) => (
      <Polyline
        key={pathName}
        selected={true}
        points={recommendedPath[pathName].map((n: Node) => n.coordinate)}
        enabled={true}
        strokeColor={selectedPathName == pathName ? 'blue' : 'gray'}
        strokeOpacity={selectedPathName == pathName ? 0.9 : 0.5}
        lineWidth={5}
      />
    ))
  );
};

export default NavLine;
