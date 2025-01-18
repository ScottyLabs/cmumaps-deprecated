import React, { ReactElement } from 'react';

interface Props {
  children: ReactElement;
  handleClick?: () => void;
  isSelected?: boolean;
}

const SearchResultWrapper = ({ children, handleClick, isSelected }: Props) => {
  let classNames =
    'flex w-full items-center justify-between gap-2 px-4 text-left border-b';
  classNames += ' transition duration-150 ease-out';

  if (isSelected) {
    classNames += ' bg-gray-200';
  }

  if (handleClick) {
    return (
      <button
        className={classNames + ' cursor-pointer py-3 hover:bg-[#efefef]'}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  } else {
    return <div className={classNames + ' -mb-1 pt-2'}> {children}</div>;
  }
};

export default SearchResultWrapper;
