/* ─── src/app/layout.tsx ─────────────────────────────────────────── */
import '@/globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import ClientProviders from './clientProviders';

/* ── <head> metadata ────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'ethanetwork',
  icons: {
    icon: '/favicon.ico', // desktop & Android
    apple: '/apple-touch-icon.png', // iOS / macOS homescreen
    other: [{ rel: 'mask-icon', url: '/icon-mask.svg', color: '#4F46E5' }],
  },
  /** Tell browsers we only support “dark” to prevent Safari auto-invert */
  other: { 'color-scheme': 'dark' },
};
/* ----------------------------------------------------------------- */

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    /* `class="dark"` + style → first-paint is dark everywhere */
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body>
        <ClientProviders>
          <div className="flex min-h-screen">
            <Sidebar />

            {/* extra bottom-padding on phones so content doesn’t hide under nav */}
            <main className="flex-1 px-4 md:px-6 py-10 pb-24 md:pb-10">
              {children}
            </main>
          </div>

          {/* fixed phone navbar */}
          <BottomNav />
        </ClientProviders>
      </body>
    </html>
  );
}
