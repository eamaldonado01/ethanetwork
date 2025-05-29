'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenLine, Search, User, LogOut } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';

/** Detect readable guest cookie */
function hasGuestCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return /(?:^|;\s*)guestUser=/.test(document.cookie);
}

export default function Sidebar() {
  const pathname = usePathname() ?? '';
  const { user, isLoading } = useUser();

  /* decide logout target */
  const [logoutHref, setLogoutHref] = useState('/api/auth/logout');

  useEffect(() => {
    /* 1️⃣  Auth0 session → keep default /api/auth/logout */
    if (user) return;

    /* 2️⃣  When user finished loading and is undefined, treat as guest */
    if (!isLoading) {
      setLogoutHref('/api/guest/logout');
      return;
    }

    /* 3️⃣  During first render, fall back to cookie test */
    if (hasGuestCookie()) setLogoutHref('/api/guest/logout');
  }, [user, isLoading]);

  const links = [
    { href: '/home', label: 'Home', Icon: Home },
    { href: '/post', label: 'Post', Icon: PenLine },
    { href: '/search', label: 'Search', Icon: Search },
    { href: '/profile', label: 'Profile', Icon: User },
    { href: logoutHref, label: 'Logout', Icon: LogOut },
  ] as const;

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col items-center bg-zinc-940 px-8 py-12">
      <h1 className="mb-10 text-2xl font-bold tracking-tight text-indigo-400">
        ethanetwork
      </h1>

      <nav className="flex flex-col gap-4 text-xl text-indigo-400">
        {links.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href);
          const isLogout = label === 'Logout';
          const base = `inline-flex w-max items-center gap-4 rounded-lg px-5 py-3 transition`;

          const classes =
            active && !isLogout
              ? `${base} bg-zinc-800 text-indigo-500`
              : `${base} hover:bg-zinc-900 text-indigo-500`;

          if (isLogout) {
            return (
              <a key={href} href={href} className={classes}>
                <Icon size={24} />
                {label}
              </a>
            );
          }

          return (
            <Link key={href} href={href} className={classes}>
              <Icon size={24} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
