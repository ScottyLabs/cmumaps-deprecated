import { useSpring, animated } from '@react-spring/web';

import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useDrag } from 'react-use-gesture';

import {
  // setIsCardWrapperCollapsed,
  setIsCardWrapperFullyOpen,
} from '@/lib/features/uiSlice';
import { useAppDispatch } from '@/lib/hooks';

interface DraggableSheetProps {
  snapPoint: number;
  children: React.ReactElement;
  isOpen: boolean;
}

function DraggableSheet({ snapPoint, children, isOpen }: DraggableSheetProps) {
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

  const onClick = () => {
    snapTo((snapIndex + 1) % 3);
  };

  useEffect(() => {
    let closestSnap;
    if (!isOpen) {
      closestSnap = snapPoints[0];
      api.set({ y: closestSnap });
    } else {
      closestSnap = snapPoints[1];
      api.start({ y: closestSnap });
    }

    setSnapIndex(snapPoints.indexOf(closestSnap));
    dispatch(setIsCardWrapperFullyOpen(closestSnap == snapPoints[2]));
    setSnapPos(closestSnap);
  }, [isOpen]);

  const bind = useDrag(
    ({ movement: [, oy], velocities, last }) => {
      const newPos = snapPos + oy;

      api.set({ y: Math.max(0, newPos) });

      if (last) {
        const newPosAdj =
          newPos + Math.min(400, Math.max(-400, 600 * velocities[1]));

        const closestSnap = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - newPosAdj) < Math.abs(prev - newPosAdj) ? curr : prev,
        );

        api.start({ y: closestSnap });

        setSnapIndex(snapPoints.indexOf(closestSnap));
        dispatch(setIsCardWrapperFullyOpen(closestSnap == snapPoints[2]));
        setSnapPos(closestSnap);
      }
    },
    { axis: 'y' },
  );
  api.start({ y: snapPos });

  if (api == undefined || (snapIndex == 1 && snapPos != snapPoints[1])) {
    snapTo(1);
  }

  return (
    <animated.div style={{ y, pointerEvents: 'auto' }}>
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
        <div className="flex h-12 items-center justify-center rounded-t-xl bg-white text-center">
          <div
            className="h-1 w-12 rounded-full bg-black"
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
  isOpen: boolean;
}

const CardWrapper = ({ snapPoint, children, isOpen }: CardWrapperProps) => {
  if (isMobile) {
    return (
      <>
        {
          <div
            hidden={!isOpen}
            className="absolute inset-0"
            style={{ pointerEvents: 'none' }}
          >
            <DraggableSheet isOpen={isOpen} snapPoint={snapPoint}>
              {children}
            </DraggableSheet>
          </div>
        }
      </>
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
