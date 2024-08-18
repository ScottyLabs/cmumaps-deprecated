import React, { useEffect, useState } from 'react';

import { Node } from '@/app/api/findPath/route';
import { useAppSelector } from '@/lib/hooks';
import { Room } from '@/types';

interface Props {
  path: Node[];
}

const NavDirections = ({ path }: Props) => {
  const [directions, setDirections] = useState<string[]>([]);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);

  useEffect(() => {
    if (path) {
      const passedByRooms: Room[] = [];
      const newDirections = [];
      for (const node of path) {
        if (!newDirections.at(-1) || newDirections.at(-1) != node.floor) {
          newDirections.push(node.floor);
        }

        if (!passedByRooms.at(-1) || node.roomId != passedByRooms.at(-1).id) {
          const floorArr = node.floor.split('-');
          const buildingCode = floorArr[0];
          const level = floorArr[1];
          passedByRooms.push(floorPlanMap[buildingCode][level][node.roomId]);
        }
      }

      setDirections(newDirections);
    }
  }, [floorPlanMap, path]);

  return directions.map((direction, index) => <p key={index}>{direction}</p>);
};

export default NavDirections;
