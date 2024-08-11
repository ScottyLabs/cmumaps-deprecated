import React, { ReactElement } from 'react';

interface Props {
  children: ReactElement;
  handleClick: () => void;
}

const SearchResultWrapper = ({ children, handleClick }: Props) => {
  return (
    <button
      type="button"
      className={
        'my-3 flex w-full items-center justify-between gap-2 bg-gray-50 px-4 text-left transition duration-150 ease-out hover:bg-[#efefef]'
      }
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default SearchResultWrapper;
