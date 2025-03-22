import { useSpring, animated } from '@react-spring/web';

import React, { useEffect, useState } from 'react';
import { useDrag } from 'react-use-gesture';

import {
  COLLAPSED,
  EXPANDED,
  getIsCardOpen,
  HALF_OPEN,
  setCardWrapperStatus,
} from '@/lib/features/uiSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

interface DraggableSheetProps {
  snapPoint: number;
  children: React.ReactElement;
}

function DraggableSheet({ snapPoint, children }: DraggableSheetProps) {
  const cardWrapperStatus = useAppSelector(
    (state) => state.ui.cardWrapperStatus,
  );
  const isOpen = useAppSelector((state) => getIsCardOpen(state.ui));

  const [{ y }, api] = useSpring(() => {
    0;
  });

  const dispatch = useAppDispatch();

  let snapPoints;
  if (snapPoint != null) {
    snapPoints = [window.innerHeight - 145, window.innerHeight - snapPoint, 0];
  } else {
    snapPoints = [window.innerHeight - 145, 0];
  }

  const [snapIndex, setSnapIndex] = useState(1);

  const snapTo = (index) => {
    if (snapIndex == index) {
      return;
    }
    const closestSnap = snapPoints[index];
    api.start({ y: closestSnap });
    setSnapIndex(index);
    dispatch(setCardWrapperStatus([COLLAPSED, HALF_OPEN, EXPANDED][index]));
  };

  useEffect(() => {
    if (isOpen) {
      snapTo(1);
    } else {
      snapTo(0);
    }
  }, [isOpen]);

  useEffect(() => {
    api.start({ y: snapPoints[snapIndex] });
  }, [children]);

  useEffect(() => {
    snapTo(
      { [COLLAPSED]: 0, [HALF_OPEN]: 1, [EXPANDED]: 2 }[cardWrapperStatus],
    );
  }, [cardWrapperStatus]);

  const onClick = () => {
    snapTo((snapIndex + 1) % 3);
  };

  const bind = useDrag(
    ({ movement: [, oy], velocities, last }) => {
      const newPos = snapPoints[snapIndex] + oy;

      api.set({ y: Math.max(0, newPos) });

      if (last) {
        const newPosAdj =
          newPos + Math.min(400, Math.max(-400, 600 * velocities[1]));

        const closestSnap = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - newPosAdj) < Math.abs(prev - newPosAdj) ? curr : prev,
        );

        api.start({ y: closestSnap });

        const closestSnapIndex = snapPoints.indexOf(closestSnap);
        setSnapIndex(closestSnapIndex);
        dispatch(
          setCardWrapperStatus(
            [COLLAPSED, HALF_OPEN, EXPANDED][closestSnapIndex],
          ),
        );
      }
    },
    { axis: 'y' },
  );

  if (api == undefined) {
    return;
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
  const isMobile = useAppSelector((state) => state.ui.isMobile);
  const isOpen = useAppSelector((state) => getIsCardOpen(state.ui));

  if (isMobile) {
    return (
      <>
        {
          <div
            hidden={!isOpen}
            className="absolute inset-0"
            style={{ pointerEvents: 'none' }}
          >
            <DraggableSheet snapPoint={snapPoint}>{children}</DraggableSheet>
          </div>
        }
      </>
    );
  } else {
    return (
      <div className="flex w-96 flex-col overflow-hidden rounded-lg bg-white shadow-lg shadow-gray-400">
        {children}
      </div>
    );
  }
};

export default CardWrapper;
