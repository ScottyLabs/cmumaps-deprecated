import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';

import StoreProvider from './StoreProvider';
import './globals.css';

// https://nextjs.org/docs/app/building-your-application/optimizing/fonts
const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
});

// https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export const metadata: Metadata = {
  title: 'CMU Maps',
  description: 'Interactive map of the CMU campus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        <html lang="en" className={lato.className}>
          <head>
            <script>const global = globalThis;</script>
          </head>

          <body>{children}</body>
        </html>
      </ClerkProvider>
    </StoreProvider>
  );
}
