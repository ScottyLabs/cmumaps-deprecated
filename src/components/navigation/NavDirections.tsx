import { Polyline } from 'mapkit-react';

import React, { useEffect, useState } from 'react';

import { Node } from '@/app/api/findPath/route';
import { useAppSelector } from '@/lib/hooks';
import { Room } from '@/types';

interface Props {
  path: Node[];
}

const NavDirections = ({ path }: Props) => {
  const [passedByFloors, setPassedByFloors] = useState<string[]>([]);
  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);

  const [curFloorIndex, setCurFloorIndex] = useState<number>(0);

  const [passedByRooms, setPassedByRooms] = useState<Room[]>();
  const [displayPath, setDisplayPath] = useState<Node[]>([]);

  useEffect(() => {
    // console.log(passedByRooms);
  }, [passedByRooms]);

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

          if (floorPlanMap[buildingCode][level][node.roomId]) {
            passedByRooms.push(floorPlanMap[buildingCode][level][node.roomId]);
          }
        }
      }

      setPassedByRooms(passedByRooms);
      setPassedByFloors(newDirections);
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

  const renderPath = () => {
    return (
      <Polyline
        selected={true}
        points={displayPath.map((n: Node) => n.coordinate)}
        enabled={true}
        strokeColor={'blue'}
        strokeOpacity={0.9}
        lineWidth={5}
      />
    );
  };

  const renderRoomsOnFloor = (curFloor: string) => {
    const curRooms = passedByRooms.filter(
      (room) =>
        room.floor.buildingCode + '-' + room.floor.level == curFloor &&
        !!room.name,
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
            <p>{room.type}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {renderPath()}
      <div className="m-2">
        {passedByFloors.map((curFloor, index) => (
          <button
            key={index}
            className={'w-full border p-1 text-left ' + getBgClass(index)}
            onClick={() => setCurFloorIndex(index)}
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
    </>
  );
};

export default NavDirections;
