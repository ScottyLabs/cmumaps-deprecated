import downstairsIcon from '@icons/path/downstairs.svg';
import elevatorIcon from '@icons/path/elevator.svg';
import endIcon from '@icons/path/end.svg';
import enterIcon from '@icons/path/enter-building.svg';
import exitIcon from '@icons/path/exit-building.svg';
import startIcon from '@icons/path/start.svg';
import upstairsIcon from '@icons/path/upstairs.svg';
import { Annotation, Coordinate } from 'mapkit-react';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

import React, { useEffect, useState } from 'react';

import { Node } from '@/app/api/findPath/route';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

interface IconInfo {
  coordinate: Coordinate;
  icon: StaticImport;
  className?: string;
}
interface Props {
  map: mapkit.Map;
}

const NavLine = ({ map }: Props) => {
  const dispatch = useAppDispatch();

  const recommendedPath = useAppSelector((state) => state.nav.recommendedPath);
  const selectedPathName = useAppSelector(
    (state) => state.nav.selectedPathName,
  );
  const startedNavigation = useAppSelector(
    (state) => state.nav.startedNavigation,
  );
  const curFloorIndex = useAppSelector((state) => state.nav.curFloorIndex);
  const isFloorPlanRendered = useAppSelector(
    (state) => state.ui.isFloorPlanRendered,
  );

  const [curFloorPath, setCurFloorPath] = useState<Node[] | null>(null);
  const [restPath, setRestPath] = useState<Node[] | null>(null);

  const [pathOverlay, setPathOverlay] = useState<mapkit.PolylineOverlay[]>([]);
  const [iconInfos, setIconInfos] = useState<IconInfo[]>([]);

  // calculate curFloorPath and restPath
  useEffect(() => {
    if (
      startedNavigation &&
      selectedPathName &&
      recommendedPath &&
      recommendedPath[selectedPathName]
    ) {
      const path: Node[] = recommendedPath[selectedPathName].path;
      const newCurFloorPath: Node[] = [];
      const newRestPath: Node[] = [];
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
      newRestPath.push(path[path.length - 1]);

      setCurFloorPath(newCurFloorPath);
      setRestPath(newRestPath);
    }
  }, [curFloorIndex, recommendedPath, selectedPathName, startedNavigation]);

  // calculate the pathOverlay
  useEffect(() => {
    if (startedNavigation) {
      const newPathOverlays: mapkit.PolylineOverlay[] = [];
      if (curFloorPath) {
        const curFloorPathOverlay = new mapkit.PolylineOverlay(
          curFloorPath.map(
            (n: Node) =>
              new mapkit.Coordinate(
                n.coordinate.latitude,
                n.coordinate.longitude,
              ),
          ),
          {
            style: new mapkit.Style({
              strokeColor: 'blue',
              strokeOpacity: 0.9,
              lineWidth: 5,
            }),
          },
        );

        newPathOverlays.push(curFloorPathOverlay);
      }

      if (restPath) {
        const restPathOverlay = new mapkit.PolylineOverlay(
          restPath.map(
            (n: Node) =>
              new mapkit.Coordinate(
                n.coordinate.latitude,
                n.coordinate.longitude,
              ),
          ),
          {
            style: new mapkit.Style({
              strokeColor: 'blue',
              strokeOpacity: 0.5,
              lineWidth: 5,
              lineDash: [10, 10],
            }),
          },
        );

        newPathOverlays.push(restPathOverlay);
      }

      setPathOverlay(newPathOverlays);
    } else {
      if (!recommendedPath) {
        setPathOverlay([]);
      } else {
        setPathOverlay(
          Object.keys(recommendedPath).map((pathName) => {
            const style = {
              strokeColor: selectedPathName == pathName ? 'blue' : 'gray',
              strokeOpacity: selectedPathName == pathName ? 0.9 : 0.5,
              lineWidth: 5,
            };

            return new mapkit.PolylineOverlay(
              recommendedPath[pathName].path.map(
                (n: Node) =>
                  new mapkit.Coordinate(
                    n.coordinate.latitude,
                    n.coordinate.longitude,
                  ),
              ),
              { style: new mapkit.Style(style) },
            );
          }),
        );
      }
    }
  }, [
    recommendedPath,
    restPath,
    curFloorPath,
    selectedPathName,
    startedNavigation,
  ]);

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
  }, [map, map.region, pathOverlay, isFloorPlanRendered, dispatch]);

  // calculate the icons (annotations)
  useEffect(() => {
    if (!recommendedPath) {
      setIconInfos([]);
      return;
    }

    const calculateIcon = (path: Node[] | null) => {
      if (!path) {
        return [];
      }

      const iconInfos: { coordinate: Coordinate; icon: StaticImport }[] = [];

      for (let i = 0; i < path.length; i++) {
        // always use outside node to prevent overlapping the start and end icon
        let nextToFloorInfo;
        if (i < path.length - 1) {
          nextToFloorInfo = path[i].neighbors[path[i + 1].id].toFloorInfo;
        }

        let lastToFloorInfo;
        if (i > 0) {
          lastToFloorInfo = path[i].neighbors[path[i - 1].id].toFloorInfo;
        }

        // going outside
        if (nextToFloorInfo) {
          if (nextToFloorInfo.toFloor.includes('outside')) {
            iconInfos.push({
              coordinate: path[i + 1].coordinate,
              icon: exitIcon,
            });
          }
        }

        // going inside
        if (lastToFloorInfo) {
          if (lastToFloorInfo.toFloor.includes('outside')) {
            iconInfos.push({
              coordinate: path[i - 1].coordinate,
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

        // stairs
        const nextStairs = nextToFloorInfo && nextToFloorInfo.type == 'stairs';
        const lastNotStairs =
          !lastToFloorInfo || lastToFloorInfo.type != 'stairs';

        // the next one is a stairs and the last one is not an stairs
        if (nextStairs && lastNotStairs) {
          const up = path[i].floor.level < path[i + 1].floor.level;

          if (up) {
            iconInfos.push({
              coordinate: path[i].coordinate,
              icon: upstairsIcon,
            });
          } else {
            iconInfos.push({
              coordinate: path[i].coordinate,
              icon: downstairsIcon,
            });
          }
        }
      }
      return iconInfos;
    };

    const addStartEndIcons = () => {
      const path = recommendedPath[selectedPathName].path;
      newIconInfos.push({ coordinate: path[0].coordinate, icon: startIcon });
      newIconInfos.push({
        coordinate: path[path.length - 1].coordinate,
        icon: endIcon,
      });
    };

    let newIconInfos: IconInfo[] = [];

    addStartEndIcons();

    if (startedNavigation) {
      newIconInfos = [
        ...newIconInfos,
        ...calculateIcon(curFloorPath),
        ...calculateIcon(restPath).map((iconInfo) => ({
          ...iconInfo,
          className: 'opacity-50',
        })),
      ];
    } else {
      newIconInfos = [
        ...newIconInfos,
        ...calculateIcon(recommendedPath[selectedPathName].path),
      ];
    }

    setIconInfos(newIconInfos);
  }, [
    recommendedPath,
    startedNavigation,
    selectedPathName,
    curFloorPath,
    restPath,
  ]);

  return iconInfos.map((iconInfo, index) => (
    <Annotation
      key={index}
      latitude={iconInfo.coordinate.latitude}
      longitude={iconInfo.coordinate.longitude}
      displayPriority={'required'}
    >
      <Image
        src={iconInfo.icon}
        alt="Icon"
        height={40}
        className={iconInfo.className}
      />
    </Annotation>
  ));
};

export default NavLine;
