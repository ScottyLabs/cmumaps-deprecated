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
        'flex h-12 w-full items-center justify-between gap-2 bg-gray-50 px-6 transition duration-150 ease-out hover:bg-[#efefef]'
      }
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default SearchResultWrapper;
