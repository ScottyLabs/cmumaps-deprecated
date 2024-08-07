import Image from 'next/image';

import React from 'react';

interface Props {
  url: string;
}

const InfoCardImage = ({ url }: Props) => {
  return (
    <div className="relative h-36">
      <Image
        className="object-cover"
        fill={true}
        alt="Building Image"
        src={url}
        sizes="99vw"
      />
    </div>
  );
};

export default InfoCardImage;
