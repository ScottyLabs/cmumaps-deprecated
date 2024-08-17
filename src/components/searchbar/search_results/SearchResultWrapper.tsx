import React, { ReactElement } from 'react';

interface Props {
  children: ReactElement;
  handleClick?: () => void;
  isSelected?: boolean;
}

const SearchResultWrapper = ({ children, handleClick, isSelected }: Props) => {
  let classNames =
    'py-3 flex w-full items-center justify-between gap-2 px-4 text-left';
  classNames += 'transition duration-150 ease-out';

  if (isSelected) {
    classNames += ' bg-gray-200';
  }

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
