import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import StoreProvider from './StoreProvider';

// https://nextjs.org/docs/app/building-your-application/optimizing/fonts
import { Lato } from 'next/font/google';

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
});

// https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export const metadata: Metadata = {
  title: 'CMU Maps',
  description: 'Explore the CMU Maps',
  icons: {
    icon: '/favicons/smapslogo.png',
  },
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

          <body>
            <div style={{ height: '100vu' }} id="root">
              {children}
            </div>
          </body>
        </html>
      </ClerkProvider>
    </StoreProvider>
  );
}
