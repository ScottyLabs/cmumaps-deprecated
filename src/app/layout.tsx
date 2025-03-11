import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Lato } from 'next/font/google';

import StoreProvider from './StoreProvider';
import './globals.css';
import { PHProvider } from './providers';

// https://nextjs.org/docs/app/building-your-application/optimizing/fonts
const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
});

// https://nextjs.org/docs/app/building-your-application/optimizing/metadata

export const metadata: Metadata = {
  title: 'CMU Maps',
  description: 'Interactive map of the CMU campus',
  appleWebApp: {
    title: 'CMU Maps',
    statusBarStyle: 'black-translucent',
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
});

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
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <meta name="description" content="Google Maps for CMU" />
            <script>const global = globalThis;</script>
          </head>
          <PHProvider>
            <body>
              <PostHogPageView />
              {children}
            </body>
          </PHProvider>
        </html>
      </ClerkProvider>
    </StoreProvider>
  );
}
