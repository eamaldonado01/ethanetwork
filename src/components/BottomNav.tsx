/* ── src/components/BottomNav.tsx ──────────────────────────────── */
'use client';

import { ElementType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenLine, Search, User, LogOut } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname() ?? '/';

  const items = [
    { href: '/home', icon: Home },
    { href: '/post', icon: PenLine },
    { href: '/search', icon: Search },
    { href: '/profile', icon: User },
    { href: '/api/guest/logout', icon: LogOut },
  ] as const;

  /* “/” should light up the Home icon */
  const isActive = (href: string) =>
    href === '/home'
      ? pathname === '/' || pathname.startsWith('/home')
      : pathname.startsWith(href);

  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 flex justify-around
                 h-[64px] border-t border-neutral-800 bg-neutral-900/95
                 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/80
                 pb-[calc(env(safe-area-inset-bottom))]"
    >
      {items.map(({ href, icon: Icon }) => {
        const active = isActive(href);

        const cls = [
          'touch-target flex items-center justify-center',
          active
            ? 'text-indigo-500' /* persist on current page            */
            : 'text-indigo-300 visited:text-indigo-300 hover:text-indigo-400 active:text-indigo-500',
        ].join(' ');

        /* `a` for external logout, `Link` for internal routes */
        const LinkCmp: ElementType = href.startsWith('/api') ? 'a' : Link;

        return (
          <LinkCmp
            key={href}
            href={href}
            className={cls}
            aria-current={active ? 'page' : undefined}
            /* inline colour prevents :visited overriding in Safari */
            style={active ? { color: '#4f46e5' } : undefined}
          >
            <Icon size={30} strokeWidth={2.1} />
            <span className="sr-only">{href}</span>
          </LinkCmp>
        );
      })}
    </nav>
  );
}
