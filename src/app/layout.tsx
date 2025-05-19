// src/app/layout.tsx
import ClientProviders from './clientProviders';
import './globals.css';

export const metadata = {
  title: 'Odin Book',
  description: '…',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap your app in any client‐side providers here */}
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
