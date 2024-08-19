import elevatorIcon from '@icons/path/elevator.svg';
import endIcon from '@icons/path/end.svg';
import enterIcon from '@icons/path/enter-building.svg';
import exitIcon from '@icons/path/exit-building.svg';
import startIcon from '@icons/path/start.svg';
import { Annotation, Coordinate, Polyline } from 'mapkit-react';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

import React, { useEffect, useState } from 'react';

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

  const [curFloorPath, setCurFloorPath] = useState<Node[]>([]);
  const [restPath, setRestPath] = useState<Node[]>([]);

  useEffect(() => {
    if (startedNavigation) {
      const path: Node[] = recommendedPath[selectedPathName].path;
      const newCurFloorPath = [];
      const newRestPath = [];
      let count = 0;
      for (let i = 0; i < path.length; i++) {
        if (i != 0 && path[i - 1].floor != path[i].floor) {
          count++;
          if (count == curFloorIndex) {
            newCurFloorPath.push(path[i - 1]);
          }
        }

        if (count == curFloorIndex) {
          newCurFloorPath.push(path[i]);
        } else if (count > curFloorIndex) {
          newRestPath.push(path[i - 1]);
        }
      }
      newRestPath.push(path.at(-1));

      setCurFloorPath(newCurFloorPath);
      setRestPath(newRestPath);
    }
  }, [curFloorIndex, recommendedPath, selectedPathName, startedNavigation]);

  const renderPath = () => {
    if (startedNavigation) {
      return (
        <>
          <Polyline
            selected={true}
            points={curFloorPath.map((n: Node) => n.coordinate)}
            enabled={true}
            strokeColor="blue"
            strokeOpacity={0.9}
            lineWidth={5}
          />
          <Polyline
            selected={true}
            points={restPath.map((n: Node) => n.coordinate)}
            enabled={true}
            strokeColor="blue"
            strokeOpacity={0.5}
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

      for (let i = 0; i < path.length; i++) {
        // always pick the node inside for higher precision
        let nextToFloorInfo;
        if (i < path.length - 1) {
          nextToFloorInfo = path[i].neighbors[path[i + 1].id].toFloorInfo;
        }

        // going inside
        if (nextToFloorInfo) {
          if (nextToFloorInfo.toFloor.includes('outside')) {
            iconInfos.push({
              coordinate: path[i].coordinate,
              icon: exitIcon,
            });
          }
        }

        let lastToFloorInfo;
        if (i > 0) {
          lastToFloorInfo = path[i].neighbors[path[i - 1].id].toFloorInfo;
        }

        // going outside
        if (lastToFloorInfo) {
          if (lastToFloorInfo.toFloor.includes('outside')) {
            iconInfos.push({
              coordinate: path[i].coordinate,
              icon: enterIcon,
            });
          }
        }

        // elevator
        const nextElevator =
          nextToFloorInfo && nextToFloorInfo.type == 'elevator';
        const lastNotElevator =
          !lastToFloorInfo || lastToFloorInfo.type != 'elevator';

        // the next one is an elevtor and the last one is not an elevator
        if (nextElevator && lastNotElevator) {
          iconInfos.push({
            coordinate: path[i].coordinate,
            icon: elevatorIcon,
          });
        }
      }

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
