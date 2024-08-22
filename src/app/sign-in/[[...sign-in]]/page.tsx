import { GoogleOneTap } from '@clerk/nextjs';
import icon from '@icons/icon.png';
import Image from 'next/image';

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center bg-blue-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg drop-shadow-2xl">
        <div className="pb-6">
          <Image src={icon} alt="CMU Maps Logo" height={70} />
          <h1 className="mb-1 mt-2 text-2xl font-bold text-gray-800">
            CMU Maps Sign In
          </h1>
          <p className="text-gray-400">Please use your andrew.cmu.edu email</p>
        </div>
        <GoogleOneTap />
      </div>
    </div>
  );
}
