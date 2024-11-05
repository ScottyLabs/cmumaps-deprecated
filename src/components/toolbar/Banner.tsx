import React from 'react';

const Banner = () => {
  return (
    <div className="fixed z-50 h-10 w-full bg-[#007fff] p-1.5 text-center text-lg text-white">
      ‼️ Sign up for{' '}
      <a href="https://go.scottylabs.org/nova-cmumaps" className="underline">
        <strong>Nova</strong>
      </a>
      , ScottyLabs&apos; new GenAI Hackathon! 🖥️
    </div>
  );
};

export default Banner;
