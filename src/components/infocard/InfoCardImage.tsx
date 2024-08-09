import Image from 'next/image';

import React from 'react';

interface Props {
  url: string;
  alt: string;
}

const InfoCardImage = ({ url, alt }: Props) => {
  return (
    <div className="relative h-36">
      <Image
        className="object-cover"
        fill={true}
        alt={alt}
        src={url}
        sizes="99vw"
      />
    </div>
  );
};

export default InfoCardImage;
