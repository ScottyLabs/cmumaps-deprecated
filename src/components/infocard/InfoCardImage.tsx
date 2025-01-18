import Image from 'next/image';

import React from 'react';

interface Props {
  url: string;
  alt: string;
}

const InfoCardImage = ({ url, alt }: Props) => {
  return (
    // we need this div to maintain the size of the image
    <div className="h-36">
      {/* https://nextjs.org/docs/pages/api-reference/components/image#fill
       * "The parent element must assign position: "relative", position: "fixed", or position: "absolute" style."
       */}
      <div className="relative h-36">
        <Image
          className="object-cover"
          fill={true}
          alt={alt}
          src={url}
          sizes="99vw"
        />
      </div>
    </div>
  );
};

export default InfoCardImage;
