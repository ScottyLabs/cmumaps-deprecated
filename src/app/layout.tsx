import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CMU Maps',
  description: 'Explore the CMU Maps',
  icons: {
    icon: '/favicons/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script>const global = globalThis;</script>
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
