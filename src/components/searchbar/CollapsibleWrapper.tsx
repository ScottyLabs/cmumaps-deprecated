import dynamic from 'next/dynamic';

import { useState } from 'react';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

const Collapsible = dynamic(() => import('react-collapsible'), { ssr: false });

interface Props {
  title: string;
  children: React.ReactElement;
}

const CollapsibleWrapper = ({ title, children }: Props) => {
  const [open, setOpen] = useState(false);

  const renderTrigger = () => (
    <div className="flex items-center justify-between rounded px-2.5 py-2">
      <p className="font-bold">{title}</p>
      <div>
        {open ? <IoIosArrowUp size={15} /> : <IoIosArrowDown size={15} />}
      </div>
    </div>
  );

  return (
    <Collapsible
      trigger={renderTrigger()}
      className="rounded bg-white"
      openedClassName="rounded bg-white"
      onOpening={() => {
        setOpen(true);
      }}
      onClosing={() => {
        setOpen(false);
      }}
      easing="ease-in-out"
      transitionTime={200}
    >
      {children}
    </Collapsible>
  );
};

export default CollapsibleWrapper;
