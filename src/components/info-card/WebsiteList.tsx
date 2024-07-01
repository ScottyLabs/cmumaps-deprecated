import React, { useMemo, useState, memo } from 'react';

export interface WebsiteListProps {
  websiteList: { url: string; favicon: string | null; title: string | null }[];
}

/**
 * Displays the search results.
 */
export default function WebsiteList({ websiteList }: WebsiteListProps) {
  function createWebsiteEles() {
    return websiteList.map(({ url, favicon, title }) => {
      return [
        <a href={url} key={url}>
          <img
            width="20px"
            height="20px"
            src={
              favicon
                ? favicon
                : 'https://www.cmu.edu/brand/brand-guidelines/images/seal-4c-600x600-min.jpg'
            }
          ></img>
          <h4>
            {title ? title : url.substring('https://'.length).split('/')[0]}
          </h4>{' '}
        </a>,
      ];
    });
  }
  return (
    <div>
      <hr></hr>
      {createWebsiteEles()}
    </div>
  );
}
