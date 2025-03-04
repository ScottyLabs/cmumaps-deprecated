import React, { useState } from 'react';
import { FaRegClock } from 'react-icons/fa6';

import { pullLogs } from '@/lib/idb/logStore';

import KeepTypingDisplay from '../display_helpers/KeepTypingDisplay';
import LoadingDisplay from '../display_helpers/LoadingDisplay';

const RecentSearch = ({ text }: { text: string }) => {
  return (
    <div className="flex h-12 items-center gap-3 overflow-x-hidden">
      <div className="flex-1">
        <FaRegClock className="text-gray-500" />
      </div>
      <div className="flex flex-col space-x-2 truncate">
        <span>{text}</span>
      </div>
    </div>
  );
};

interface RecentSearchesProps {
  currentSearch: string;
  setQuery: (query: string) => void;
}

const RecentSearches = ({ currentSearch, setQuery }: RecentSearchesProps) => {
  const [loggedSearches, setLoggedSearches] = useState<string[]>([]);
  console.log(loggedSearches);

  if (!loggedSearches) {
    pullLogs(
      (l) => {
        setLoggedSearches(
          l
            .map((m) => m.query)
            .reverse()
            .slice(0, 6),
        );
      },
      (e) => console.log(e),
    );
    return <LoadingDisplay />;
  }
  if (loggedSearches.length === 0) {
    return <KeepTypingDisplay />;
  }

  const filteredSearches = loggedSearches.filter((text) =>
    text.toLowerCase().includes(currentSearch.toLowerCase()),
  );

  return filteredSearches.map((text) => (
    <div
      key={text.toString()}
      className={
        'ease-out-mb-1 flex w-full items-center justify-between gap-2 border-b px-4 pt-2 text-left transition duration-150 hover:bg-gray-100'
      }
      onClick={() => setQuery(text.toString())}
    >
      <RecentSearch text={text} />
    </div>
  ));
};

export default RecentSearches;
