import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetRef } from 'react-modal-sheet';
import { isMobile } from 'react-device-detect';

interface CardWrapperProps {
  snapPoint: number;
  children: React.ReactElement;
}

const CardWrapper = ({ snapPoint, children }: CardWrapperProps) => {
  const [isOpen, setOpen] = useState(true);
  const ref = useRef<SheetRef>();
  const snapPoints = [snapPoint, 32];
  const snapTo = (i: number) => ref.current?.snapTo(i);

  useEffect(() => {
    if (!isOpen) {
      setOpen(true);
      snapTo(3);
    }
  }, [isOpen]);

  if (isMobile) {
    return (
      <Sheet
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        onOpenEnd={() => setOpen(true)}
        snapPoints={snapPoints}
      >
        <Sheet.Container className="!rounded-t-2xl">
          <Sheet.Header className="h-9" />
          <Sheet.Content>
            <Sheet.Scroller draggableAt="top">{children}</Sheet.Scroller>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    );
  } else {
    return (
      <div id="thisThing" className="fixed left-2 top-20 z-10 w-1/4 bg-white">
        {children}
      </div>
    );
  }
};

export default CardWrapper;
