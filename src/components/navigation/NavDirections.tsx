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

  const [curFloorIndex, setCurFloorIndex] = useState<number>(0);

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

  const getBgClass = (index: number) => {
    if (curFloorIndex == index) {
      return 'bg-[#31B777]';
    } else if (index < curFloorIndex) {
      return 'bg-gray-200';
    }
    return '';
  };

  return (
    <div className="m-2">
      {directions.map((direction, index) => (
        <button
          key={index}
          className={'w-full border p-1 text-left ' + getBgClass(index)}
          onClick={() => setCurFloorIndex(index)}
        >
          <p className={`${curFloorIndex == index ? 'text-white' : ''}`}>
            {direction}
          </p>
        </button>
      ))}
    </div>
  );
};

export default NavDirections;
