'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenLine, Search, User, LogOut } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';

/* — util: detect guest cookie — */
const hasGuestCookie = () =>
  typeof document !== 'undefined' &&
  /(?:^|;\s*)guestUser=/.test(document.cookie);

export default function Sidebar() {
  const pathname = usePathname() ?? '';
  const { user, isLoading } = useUser();
  const [logoutHref, setLogoutHref] = useState('/api/auth/logout');

  /* decide logout target (guest vs real user) */
  useEffect(() => {
    if (user) return; // 1️⃣ logged-in Auth0 user → normal logout
    if (!isLoading) {
      // 2️⃣ finished loading + no user → guest
      setLogoutHref('/api/guest/logout');
    } else if (hasGuestCookie()) {
      // 3️⃣ first render fallback
      setLogoutHref('/api/guest/logout');
    }
  }, [user, isLoading]);

  const links = [
    { href: '/home', label: 'Home', Icon: Home },
    { href: '/post', label: 'Post', Icon: PenLine },
    { href: '/search', label: 'Search', Icon: Search },
    { href: '/profile', label: 'Profile', Icon: User },
    { href: logoutHref, label: 'Logout', Icon: LogOut },
  ] as const;

  return (
    /* hidden below lg, visible ≥ lg (same breakpoint as BottomNav) */
    <aside
      className="hidden lg:flex fixed left-0 top-0 h-screen w-72
                      flex-col items-center bg-zinc-940 px-8 py-12"
    >
      <h1 className="mb-10 text-2xl font-bold tracking-tight text-indigo-400">
        ethanetwork
      </h1>

      <nav className="flex flex-col gap-4 text-xl text-indigo-400">
        {links.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href);
          const isLogout = label === 'Logout';

          const base =
            'inline-flex w-max items-center gap-4 rounded-lg px-5 py-3 transition';

          const classes =
            active && !isLogout
              ? `${base} bg-zinc-800 text-indigo-500`
              : `${base} hover:bg-zinc-900 text-indigo-500`;

          /* <a> for logout (external), <Link> for internal nav */
          return isLogout ? (
            <a key={href} href={href} className={classes}>
              <Icon size={24} /> {label}
            </a>
          ) : (
            <Link key={href} href={href} className={classes}>
              <Icon size={24} /> {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
