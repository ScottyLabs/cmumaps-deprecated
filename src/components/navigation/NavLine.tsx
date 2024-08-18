import endIcon from '@icons/path/end.svg';
import startIcon from '@icons/path/start.svg';
import { Annotation, Polyline } from 'mapkit-react';
import Image from 'next/image';

import React from 'react';

import { Node } from '@/app/api/findPath/route';
import { useAppSelector } from '@/lib/hooks';

const NavLine = () => {
  const recommendedPath = useAppSelector((state) => state.nav.recommendedPath);
  const selectedPathName = useAppSelector(
    (state) => state.nav.selectedPathName,
  );
  const startedNavigation = useAppSelector(
    (state) => state.nav.startedNavigation,
  );
  const curFloorIndex = useAppSelector((state) => state.nav.curFloorIndex);

  const renderPath = () => {
    if (startedNavigation) {
      const path: Node[] = recommendedPath[selectedPathName];
      const displayPath = [];
      const displayRestPath = [];
      let count = 0;
      for (let i = 1; i < path.length; i++) {
        if (path[i - 1].floor != path[i].floor) {
          count++;
        }
        if (count == curFloorIndex) {
          displayPath.push(path[i].coordinate);
        } else if (count > curFloorIndex) {
          displayRestPath.push(path[i - 1].coordinate);
        }
      }
      displayRestPath.push(path.at(-1).coordinate);

      return (
        <>
          <Polyline
            selected={true}
            points={displayPath}
            enabled={true}
            strokeColor="blue"
            strokeOpacity={0.9}
            lineWidth={5}
          />
          <Polyline
            selected={true}
            points={displayRestPath}
            enabled={true}
            strokeColor="blue"
            strokeOpacity={0.9}
            lineWidth={5}
            lineDash={[10, 10]}
          />
        </>
      );
    } else {
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
    }
  };

  const renderIcon = () => {
    if (recommendedPath && selectedPathName) {
      const path: Node[] = recommendedPath[selectedPathName];
      return (
        <>
          <Annotation
            latitude={path[0].coordinate.latitude}
            longitude={path[0].coordinate.longitude}
          >
            <Image src={startIcon} alt="Start Icon" height={40} />
          </Annotation>
          <Annotation
            latitude={path.at(-1).coordinate.latitude}
            longitude={path.at(-1).coordinate.longitude}
          >
            <Image src={endIcon} alt="End Icon" height={40} />
          </Annotation>
        </>
      );
    }
  };

  return (
    <>
      {renderPath()}
      {renderIcon()}
    </>
  );
};

export default NavLine;
