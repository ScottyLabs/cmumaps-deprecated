import React, { useEffect, useState } from 'react';

import { Node } from '@/app/api/findPath/route';
import { setCurFloorIndex } from '@/lib/features/navSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Room } from '@/types';

// import { zoomOnFloor } from '../buildings/mapUtils';

interface Props {
  path: Node[];
}

const NavDirections = ({ path }: Props) => {
  const dispatch = useAppDispatch();

  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const curFloorIndex = useAppSelector((state) => state.nav.curFloorIndex);

  const [passedByFloors, setPassedByFloors] = useState<string[]>([]);
  const [passedByRooms, setPassedByRooms] = useState<Room[]>();

  useEffect(() => {
    if (path) {
      const passedByRooms: Room[] = [];
      const newPassedByFloors = [];
      for (const node of path) {
        if (
          !newPassedByFloors.at(-1) ||
          newPassedByFloors.at(-1) != node.floor
        ) {
          newPassedByFloors.push(node.floor);
        }

        if (!passedByRooms.at(-1) || node.roomId != passedByRooms.at(-1).id) {
          const floorArr = node.floor.split('-');
          const buildingCode = floorArr[0];
          const level = floorArr[1];

          if (floorPlanMap[buildingCode][level][node.roomId]) {
            passedByRooms.push(floorPlanMap[buildingCode][level][node.roomId]);
          }
        }
      }

      setPassedByRooms(passedByRooms);
      setPassedByFloors(newPassedByFloors);
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

  const renderRoomsOnFloor = (curFloor: string) => {
    const curRooms = passedByRooms.filter(
      (room) =>
        room.floor.buildingCode + '-' + room.floor.level == curFloor &&
        !!room.name &&
        room.floor.buildingCode !== 'outside',
    );

    if (curRooms.length == 0) {
      return <></>;
    }

    return (
      <div className="space- mx-1 mb-1 mt-2 space-y-1 bg-gray-50">
        {curRooms.map((room) => (
          <div
            key={room.id}
            className="flex justify-between px-2 text-[--color-gray]"
          >
            <p>{room.name}</p>
            <p>{room.alias ? room.alias : room.type}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="my-2 flex w-full justify-center">
      <div className="w-[22.5rem] rounded border">
        {passedByFloors.map((curFloor, index) => (
          <button
            key={index}
            className={'w-full p-1 text-left ' + getBgClass(index)}
            onClick={() => {
              // zoomOnFloor(map, buildings, curFloor, dispatch)
              dispatch(setCurFloorIndex(index));
            }}
          >
            <p
              className={`${curFloorIndex == index ? 'text-lg font-bold text-white' : ''}`}
            >
              {curFloor == 'outside-1' ? 'Outside' : curFloor}
            </p>
            {curFloorIndex == index && renderRoomsOnFloor(curFloor)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavDirections;
