import { useSpring, animated } from '@react-spring/web';

import React, { Children, useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useDrag } from 'react-use-gesture';

import {
  setIsCardWrapperCollapsed,
  setIsCardWrapperFullyOpen,
} from '@/lib/features/uiSlice';
import { useAppDispatch } from '@/lib/hooks';

function DraggableSheet({ snapPoint, children }: CardWrapperProps) {
  const [{ y }, api] = useSpring(() => {
    0;
  }); // Create springs, each corresponds to an item, controlling its transform, scale, etc.

  const dispatch = useAppDispatch();

  let snapPoints;
  if (snapPoint != null) {
    snapPoints = [
      window.innerHeight - 45,
      window.innerHeight - snapPoint - 12,
      0,
    ];
  } else {
    snapPoints = [window.innerHeight - 45, 0];
  }

  console.log('Target middle height: ' + (window.innerHeight - snapPoint - 12));

  const [snapPos, setSnapPos] = useState(window.innerHeight - 45);
  const [snapIndex, setSnapIndex] = useState(1);

  const snapTo = (index) => {
    const closestSnap = snapPoints[index];
    api.start({ y: closestSnap });
    // setLastPos(oy);
    dispatch(setIsCardWrapperFullyOpen(closestSnap == snapPoints[2]));
    setSnapPos(closestSnap);
    setSnapIndex(index);
  };

  const onClick = (e) => {
    snapTo((snapIndex + 1) % 3);
  };

  const bind = useDrag(
    ({ movement: [, oy], velocities, last }) => {
      // Update the y position based on the drag offset
      // api.start({ y: oy });

      const newPos = snapPos + oy;
      console.log('NewPos: ' + newPos);

      if (api != undefined) {
        api.set({ y: Math.max(0, newPos) });
      }
      // console.log("Updated pos: " + newPos);

      // if (first) {
      //   api.set({ y: 0 });
      // }

      if (last) {
        const newPosAdj =
          newPos + Math.min(400, Math.max(-400, 600 * velocities[1]));

        const closestSnap = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - newPosAdj) < Math.abs(prev - newPosAdj) ? curr : prev,
        );
        // console.log("Drag end. Snapping to: " + closestSnap);
        api.start({ y: closestSnap });
        // setLastPos(oy);
        console.log('Pos: ' + newPos);
        console.log('Pos adj: ' + newPosAdj);
        setSnapIndex(snapPoints.indexOf(closestSnap));
        dispatch(setIsCardWrapperFullyOpen(closestSnap == snapPoints[2]));
        setSnapPos(closestSnap);
      }
    },
    { axis: 'y' }, // Restrict movement to vertical axis
  );
  api.start({ y: snapPos });
  api.start({ y: snapPos });
  if (api == undefined || (snapIndex == 1 && snapPos != snapPoints[1])) {
    snapTo(1);
  }

  return (
    <animated.div style={{ y, transform: 'translate(0px,0px)' }}>
      <animated.div
        {...bind()}
        style={{
          touchAction: 'none',
          cursor: 'grab',
          zIndex: -1,
          transform: 'translate(0px,-8px)',
        }}
        onClick={onClick}
        className="content-top h-32 rounded-t-xl bg-white text-center"
      >
        <div className="h-12 content-center rounded-t-xl bg-white text-center">
          <div
            className="mx-40 h-1 rounded-full bg-black"
            style={{ top: 10 }}
          ></div>
        </div>
      </animated.div>
      <animated.div
        id="DragSheetContent"
        className="h-svh bg-white"
        style={{ transform: 'translate(0px,-90px)' }}
      >
        {children}
      </animated.div>
    </animated.div>
  );
}

interface CardWrapperProps {
  snapPoint: number;
  children: React.ReactElement;
}

const CardWrapper = ({ snapPoint, children }: CardWrapperProps) => {
  if (isMobile) {
    return (
      <div className="absolute inset-0">
        <DraggableSheet snapPoint={snapPoint}>{children}</DraggableSheet>
      </div>
    );
  } else {
    return (
      <div className="w-96 overflow-clip rounded-lg bg-white shadow-lg shadow-gray-400">
        {children}
      </div>
    );
  }
};

export default CardWrapper;
