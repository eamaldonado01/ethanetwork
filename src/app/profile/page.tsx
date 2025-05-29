// src/app/profile/page.tsx
'use client';

import ProfileClient from '@/components/ProfileClient';

/**
 * Personal profile – simply renders the info we get from the
 * lightweight /api/auth/me hook.  Detailed stats live on /u/[username].
 */
export default function ProfilePage() {
  return (
    <main className="mx-auto mt-10 max-w-3xl px-4">
      <ProfileClient />
    </main>
  );
}
