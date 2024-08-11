import { Event } from '@prisma/client';

import React from 'react';

import NoResultDisplay from './NoResultDisplay';
import SearchResultWrapper from './SearchResultWrapper';

interface Props {
  map: mapkit.Map | null;
  searchResult: Event[];
}

const EventSearchResults = ({ searchResult }: Props) => {
  if (searchResult.length == 0) {
    return <NoResultDisplay />;
  }

  return searchResult.map((event) => (
    <SearchResultWrapper
      key={event.id}
      handleClick={() => {
        console.log('Not Implemented');
      }}
    >
      <div>{event.name}</div>
    </SearchResultWrapper>
  ));
};

export default EventSearchResults;
