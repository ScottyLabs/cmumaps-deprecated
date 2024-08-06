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
        'flex items-center justify-center rounded-full bg-[#4b5563] font-mono border border-white text-center font-medium text-white size-10'
      }
    >
      {code}
    </div>
  );
}
