import type { Metadata } from 'next';
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import './globals.css';
import '@/styles/global.css';
import '@/styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <head>
          <script>const global = globalThis;</script>
        </head>

        <body>
          <div id="root">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
