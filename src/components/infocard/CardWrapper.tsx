import React, { useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Sheet, SheetRef } from 'react-modal-sheet';

import { setIsCardWrapperCollapsed } from '@/lib/features/uiSlice';
import { useAppDispatch } from '@/lib/hooks';

interface CardWrapperProps {
  snapPoint: number;
  children: React.ReactElement;
}

const CardWrapper = ({ snapPoint, children }: CardWrapperProps) => {
  const dispatch = useAppDispatch();

  const [isOpen, setOpen] = useState(true);
  const snapPoints = [snapPoint, 32];

  const ref = useRef<SheetRef>();
  const snapTo = (i: number) => ref.current?.snapTo(i);
  useEffect(() => {
    if (!isOpen) {
      setOpen(true);
      snapTo(0);
    }
  }, [isOpen]);

  const handleSnapChange = (position: number) => {
    dispatch(setIsCardWrapperCollapsed(position == snapPoints.length - 1));
  };

  if (isMobile) {
    return (
      <Sheet
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        onOpenEnd={() => setOpen(true)}
        snapPoints={snapPoints}
        onSnap={handleSnapChange}
      >
        <Sheet.Container className="!rounded-t-2xl">
          <Sheet.Header className="h-9" />
          <Sheet.Content className="overflow-y-scroll">
            <Sheet.Scroller draggableAt="top">{children}</Sheet.Scroller>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
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
