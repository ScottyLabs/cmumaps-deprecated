import React from 'react';
// import clsx from 'clsx';
// import styles from '../../styles/Roundel.module.css';

/**
 * The roundel displaying a building’s code.
 */
export default function Roundel({ code }: { code: string }) {
  return (
    <div
      className={
        // clsx(
        //   styles.roundel,
        //   code.length > 2 && styles.condensed,
        //   code === 'WWG' && styles['hyper-condensed'],
        // )
        'flex justify-center items-center w-[40px] h-[40px] rounded-full bg-[#4b5563] ' + 
        'border border-white ' + 
        'text-center text-[1.1em] tracking-[0.02em] font-medium text-white ' + 
        `${code.length > 2 ? 'text-[.9em] ' : ''}`+ 
        `${code === 'WWG' ? 'text-[.75em]' : ''}`
      }
    >
      {code}
    </div>
  );
}
