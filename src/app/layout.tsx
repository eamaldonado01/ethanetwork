/* ─── src/app/layout.tsx ─────────────────────────────────────────── */
import '@/globals.css';
import { ReactNode } from 'react';

import Sidebar from '@/components/Sidebar';
import ClientProviders from './clientProviders';

export const metadata = { title: 'ethanetwork' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {/* Sidebar + main content in a single flex row */}
          <div className="flex min-h-screen">
            <Sidebar />

            {/* Content area fills the rest; individual pages
               (home, post, search, etc.) already centre themselves
               with mx-auto / max-w-* classes */}
            <div className="flex-1 px-6 py-10">{children}</div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
