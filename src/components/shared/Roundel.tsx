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
        'flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#4b5563]' +
        ' border border-white' +
        ' text-center font-medium tracking-[0.02em] text-white' +
        `${
          code == 'WWG'
            ? ' text-[0.75em]'
            : `${code.length > 2 ? ' text-[0.9em]' : ' text-[1.1em]'}`
        }`
      }
    >
      {code}
    </div>
  );
}
