/* ─── src/app/layout.tsx ─────────────────────────────────────────── */
import '@/globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import Sidebar from '@/components/Sidebar';
import ClientProviders from './clientProviders';

/* ------------ <head> metadata (App Router) ----------------------- */
export const metadata: Metadata = {
  title: 'ethanetwork',
  icons: {
    /** desktop & Android tabs / bookmarks */
    icon: '/favicon.ico',

    /** iOS / macOS homescreen */
    apple: '/apple-touch-icon.png',

    /** Safari / Chrome pinned-tab & address-bar suggestions */
    other: [
      {
        rel: 'mask-icon',
        url: '/icon-mask.svg',
        color: '#4F46E5', // pick your brand colour
      },
    ],
  },
};
/* ----------------------------------------------------------------- */

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 px-6 py-10">{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
