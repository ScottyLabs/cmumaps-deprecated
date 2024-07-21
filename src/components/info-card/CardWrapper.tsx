import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetRef } from 'react-modal-sheet';
import Image from 'next/image';
import {
  ArrowRightIcon,
  ArrowUpOnSquareIcon,
} from '@heroicons/react/24/outline';

interface CardWrapperProps {
  imageURL: string;
  buttonName: string;
  buttonIcon: React.ReactElement;
  children: React.ReactElement;
}

const CardWrapper = ({
  imageURL,
  buttonName,
  buttonIcon,
  children,
}: CardWrapperProps) => {
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
          <Sheet.Scroller draggableAt="top">
            <div className="relative h-36 w-full">
              <Image
                className="object-cover"
                fill={true}
                alt="Room Image"
                src={imageURL}
              />
            </div>
            <div className="flex-column flex gap-3 py-3">
              <div className="mx-3 flex h-7 flex-row items-stretch justify-start gap-2.5">
                <button
                  type="button"
                  className="flex h-full w-fit flex-row items-center gap-1.5 rounded-lg bg-[#56b57b] px-2 py-1 text-white"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                  <p className="mb-0 text-xs">Directions</p>
                  <p className="mb-0 ml-2 text-xs font-light">5 min</p>
                </button>
                <button
                  type="button"
                  className="flex h-full w-fit flex-row items-center rounded-lg bg-[#1e86ff] px-2 py-1 text-white"
                >
                  {buttonIcon}
                  <p className="my-0 text-xs">{buttonName}</p>
                </button>
                <button
                  type="button"
                  className="ml-auto flex size-7 items-center justify-center rounded-full bg-[#b5b5b5]"
                >
                  <ArrowUpOnSquareIcon className="h-4 w-4 stroke-white" />
                </button>
              </div>
              {children}
            </div>
          </Sheet.Scroller>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
};

export default CardWrapper;
