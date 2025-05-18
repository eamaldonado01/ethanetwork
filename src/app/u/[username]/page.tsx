// src/app/u/[username]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default function ProfilePage() {
  // useParams gives you all dynamic segments at runtime
  const params = useParams() as { username: string };
  return <ProfileClient username={params.username} />;
}
