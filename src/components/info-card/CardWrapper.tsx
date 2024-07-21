import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetRef } from 'react-modal-sheet';

interface CardWrapperProps {
  children: React.ReactElement;
}

const CardWrapper = ({ children }: CardWrapperProps) => {
  const [isOpen, setOpen] = useState(true);
  const ref = useRef<SheetRef>();
  const snapPoints = [0.5, 0.25, 0.1, 32];
  const snapTo = (i: number) => ref.current?.snapTo(i);

  useEffect(() => {
    if (!isOpen) {
      setOpen(true);
      snapTo(3);
    }
  }, [isOpen]);

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
};

export default CardWrapper;
