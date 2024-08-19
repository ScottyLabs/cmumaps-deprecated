// import elevatorIcon from '@icons/path/elevator.svg';
import endIcon from '@icons/path/end.svg';
import startIcon from '@icons/path/start.svg';
import { Annotation, Coordinate, Polyline } from 'mapkit-react';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
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
      const path: Node[] = recommendedPath[selectedPathName].path;
      const displayPath = [];
      const displayRestPath = [];
      let count = 0;
      for (let i = 1; i < path.length; i++) {
        if (path[i - 1].floor != path[i].floor) {
          count++;
          if (count == curFloorIndex) {
            displayPath.push(path[i - 1].coordinate);
          }
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
            strokeOpacity={0.7}
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
            points={recommendedPath[pathName].path.map(
              (n: Node) => n.coordinate,
            )}
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
      const path: Node[] = recommendedPath[selectedPathName].path;

      const iconInfos: { coordinate: Coordinate; icon: StaticImport }[] = [];

      iconInfos.push({ coordinate: path[0].coordinate, icon: startIcon });
      iconInfos.push({ coordinate: path.at(-1).coordinate, icon: endIcon });

      // for (const node of path) {
      //   for (const neighbor of Object.values(node.neighbors)) {
      //     if (neighbor.toFloorInfo) {
      //       iconInfos.push({ coordinate: node.coordinate, icon: elevatorIcon });
      //     }
      //   }
      // }

      return (
        <>
          {iconInfos.map((iconInfo, index) => (
            <Annotation
              key={index}
              latitude={iconInfo.coordinate.latitude}
              longitude={iconInfo.coordinate.longitude}
            >
              <Image src={iconInfo.icon} alt="Icon" height={40} />
            </Annotation>
          ))}
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
