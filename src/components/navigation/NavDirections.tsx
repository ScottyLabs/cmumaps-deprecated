import React, { useEffect, useState } from 'react';

import { Node } from '@/app/api/findPath/route';
import { setCurFloorIndex } from '@/lib/features/navSlice';
import { setFocusedFloor } from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Room } from '@/types';

import { zoomOnFloor, zoomOnObject } from '../buildings/mapUtils';

interface Props {
  map: mapkit.Map;
  path: Node[];
}

const NavDirections = ({ map, path }: Props) => {
  const dispatch = useAppDispatch();

  const floorPlanMap = useAppSelector((state) => state.data.floorPlanMap);
  const curFloorIndex = useAppSelector((state) => state.nav.curFloorIndex);
  const buildings = useAppSelector((state) => state.data.buildings);

  const [passedByFloors, setPassedByFloors] = useState<string[] | null>(null);
  const [passedByRooms, setPassedByRooms] = useState<Room[] | null>(null);

  // calculate passedByFloors and passedByRooms
  useEffect(() => {
    if (path) {
      const passedByRooms: Room[] = [];
      const newPassedByFloors: string[] = [];
      for (const node of path) {
        if (
          !newPassedByFloors.at(-1) ||
          newPassedByFloors.at(-1) != node.floor
        ) {
          newPassedByFloors.push(node.floor);
        }

        if (!passedByRooms.at(-1) || node.roomId != passedByRooms.at(-1)?.id) {
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

  // zoom on the selected floor
  useEffect(() => {
    if (passedByFloors) {
      const curFloor = passedByFloors[curFloorIndex];
      const buildingCode = curFloor.split('-')[0];
      const level = curFloor.split('-')[1];
      if (buildingCode != 'outside') {
        zoomOnFloor(map, buildings, { buildingCode, level }, dispatch);
      } else {
        dispatch(setFocusedFloor(null));
        zoomOnObject(map, [
          {
            latitude: 40.444 - 0.006337455593801167 / 2,
            longitude: -79.945 - 0.011960061265583022 / 2,
          },
          {
            latitude: 40.444 + 0.006337455593801167 / 2,
            longitude: -79.945 + 0.011960061265583022 / 2,
          },
        ]);
      }
    }
  }, [buildings, curFloorIndex, dispatch, map, passedByFloors]);

  const getBgClass = (index: number) => {
    if (curFloorIndex == index) {
      return 'bg-[#31B777]';
    } else if (index < curFloorIndex) {
      return 'bg-gray-200';
    }
    return '';
  };

  const renderRoomsOnFloor = (curFloor: string) => {
    if (!passedByRooms) {
      return;
    }

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
        {curRooms.map((room, index) => (
          <div
            // might pass a room twice?! so need to use index
            key={index}
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
        {passedByFloors &&
          passedByFloors.map((curFloor, index) => (
            <button
              key={index}
              className={'w-full p-1 text-left ' + getBgClass(index)}
              onClick={() => dispatch(setCurFloorIndex(index))}
            >
              <p
                className={`${curFloorIndex == index ? 'text-lg font-bold text-white' : ''}`}
              >
                {curFloor == 'outside-1' ? 'Outside' : curFloor}
              </p>
              {curFloorIndex == index &&
                passedByRooms &&
                renderRoomsOnFloor(curFloor)}
            </button>
          ))}
      </div>
    </div>
  );
};

export default NavDirections;
