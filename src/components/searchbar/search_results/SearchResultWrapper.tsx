import React, { ReactElement } from 'react';

interface Props {
  children: ReactElement;
  handleClick?: () => void;
}

const SearchResultWrapper = ({ children, handleClick }: Props) => {
  let classNames =
    'my-3 flex w-full items-center justify-between gap-2 px-4 text-left';
  classNames += 'transition duration-150 ease-out';

  if (handleClick) {
    return (
      <button
        className={classNames + ' cursor-pointer hover:bg-[#efefef]'}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  } else {
    return <div className={classNames}> {children}</div>;
  }
};

export default SearchResultWrapper;
