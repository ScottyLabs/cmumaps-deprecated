// Roundel is based on all of the maps that cmu likes to publish, so even though theo thinks its ugly we will keep it. :(
import React from 'react';

interface Props {
  code: string;
}

/**
 * The roundel displaying a building’s code.
 */
export default function Roundel({ code }: Props) {
  return (
    <div
      className={
        'flex size-10 items-center justify-center rounded-full border border-white bg-[#4b5563] text-center font-mono font-medium text-white'
      }
    >
      {code}
    </div>
  );
}
