import Image from 'next/image';

import React from 'react';

// interface Props {
//   name: string;
// }

const EventPin = () => {
  const handleClick = () => {
    console.log('event pin clicked');
  };

  return (
    <div onClick={handleClick}>
      <Image src="/assets/icon.png" alt="Event Pin" width={40} height={40} />
      {/* <p>{name}</p> */}
    </div>
  );
};

export default EventPin;
