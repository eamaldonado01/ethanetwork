// src/app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import { ApolloWrapper } from '@/components/ApolloWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Odin Book',
  description: 'A Facebook clone built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-gray-50 text-gray-900 ${inter.className}`}
      >
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
