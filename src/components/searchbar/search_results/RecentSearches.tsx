import React, { useState } from 'react';
import { FaRegClock } from 'react-icons/fa6';

import { pullLogs } from '@/lib/idb/logStore';
import { Document } from '@/types';

import KeepTypingDisplay from '../display_helpers/KeepTypingDisplay';
import LoadingDisplay from '../display_helpers/LoadingDisplay';
import BuildingResult from './BuildingResult';
import FoodResult from './FoodResult';
import RoomResult from './RoomResult';

interface RecentSearchesProps {
  currentSearch: string;
  map: mapkit.Map | null;
}

const RecentSearches = ({ currentSearch, map }: RecentSearchesProps) => {
  const [loggedSearches, setLoggedSearches] = useState<Document[] | null>(null);

  if (loggedSearches === null) {
    setTimeout(() => {
      pullLogs(setLoggedSearches, (e) => console.error(e));
    }, 100);
    return <LoadingDisplay />;
  }
  if (loggedSearches.length === 0) {
    return <KeepTypingDisplay />;
  }

  const filteredSearches = loggedSearches.filter((doc) =>
    JSON.stringify(Object.values(doc))
      .toLowerCase()
      .includes(currentSearch.toLowerCase()),
  );
  console.log(filteredSearches);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="m-2 text-lg font-semibold text-gray-700">
          Recent Searches
        </h2>
        <FaRegClock className="m-2 text-gray-700" />
      </div>
      {filteredSearches.map((document: Document) => {
        switch (document.type) {
          case 'Food':
            return (
              <FoodResult
                key={document.id}
                map={map}
                eatery={document}
                query={'recent'}
              />
            );
          case 'Building':
            return (
              <BuildingResult
                key={document.id}
                map={map}
                building={document}
                query={'recent'}
              />
            );
          default:
            return (
              <RoomResult
                key={document.id}
                map={map}
                room={document}
                query={'recent'}
              />
            );
        }
      })}
    </div>
  );
};

export default RecentSearches;
