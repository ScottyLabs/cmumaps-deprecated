import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import '@/styles/global.css';
import '@/styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import StoreProvider from './StoreProvider';

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
        <html lang="en">
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
