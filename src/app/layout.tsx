import Link from 'next/link';
import './globals.css';
import { Inter } from 'next/font/google';

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
      <body className={inter.className}>
        <nav>
          <ul>
            <li>
              <Link href="/api/auth/login/">Login</Link>
            </li>
            <li>
              <Link href="/api/auth/logout/">Logout</Link>
            </li>
          </ul>
        </nav>
        {children}
      </body>
    </html>
  );
}
