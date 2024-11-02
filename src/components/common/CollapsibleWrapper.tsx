import dynamic from 'next/dynamic';

import { useState } from 'react';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

const Collapsible = dynamic(() => import('react-collapsible'), { ssr: false });

interface Props {
  title: string | React.ReactElement;
  footer: string | React.ReactElement;
  defaultOpenState?: boolean;
  children: React.ReactElement;
}

const CollapsibleWrapper = ({
  title,
  defaultOpenState = false,
  children,
}: Props) => {
  const [open, setOpen] = useState(defaultOpenState);

  const renderTrigger = () => (
    <div className="flex items-center justify-between rounded px-4 pb-1 pt-2">
      {typeof title === 'string' ? <h3>{title}</h3> : title}
      <div>
        {open ? <IoIosArrowUp size={15} /> : <IoIosArrowDown size={15} />}
      </div>
    </div>
  );

  return (
    // someone can look more into why we need to provide onTriggerOpening, onOpening, onTriggerClosing, and onClosing to not throw an error...
    <Collapsible
      open={open}
      trigger={renderTrigger()}
      className="rounded bg-white"
      openedClassName="rounded bg-white btn-shadow"
      onTriggerOpening={() => setOpen(true)}
      onOpening={() => setOpen(true)}
      onTriggerClosing={() => setOpen(false)}
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
