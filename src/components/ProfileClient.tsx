'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  useMeQuery,
  useUpdateProfileMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  PostFragmentFragment as Post,
  type User,
} from '@/generated/graphql';
import PostCard from './PostCard';
import { Pencil, Globe, Github } from 'lucide-react';

/* -------------------------------------------------------------- */
interface Props {
  initialUser?: Partial<User>;
  editable?: boolean;
}

export default function ProfileClient({ initialUser, editable = true }: Props) {
  /* 1️⃣ fetch viewer */
  const { data, loading, error } = useMeQuery({
    fetchPolicy: 'cache-and-network',
  });

  const [update, { loading: saving }] = useUpdateProfileMutation({
    refetchQueries: ['Me'],
  });
  const [follow, { loading: following }] = useFollowUserMutation();
  const [unfollow, { loading: unfollowing }] = useUnfollowUserMutation();

  /* 2️⃣ local ui */
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [site, setSite] = useState('');
  const [github, setGithub] = useState('');
  const [isFollowing, setIsFollowing] = useState(
    initialUser?.isFollowing ?? false,
  );

  /* 3️⃣ derived */
  const viewer = data?.me ?? null;
  const user = (initialUser as User) ?? viewer;
  const isMine = viewer?.id === user?.id;
  const canFollow = Boolean(viewer) && !isMine;

  /* 4️⃣ sync */
  useEffect(() => {
    setBio(user?.bio ?? '');
    setSite(user?.website ?? '');
    setGithub(user?.github ?? '');
  }, [user]);

  /* 5️⃣ early states */
  if (!initialUser && loading)
    return <p className="py-20 text-center text-zinc-400">Loading…</p>;
  if (!initialUser && error)
    return <p className="py-20 text-center text-red-500">{error.message}</p>;
  if (!user) return null;

  /* 6️⃣ helpers */
  const saveProfile = () =>
    update({
      variables: {
        bio,
        website: site || null,
        github: github || null,
      },
    }).then(() => setEditing(false));

  const toggleFollow = async () => {
    if (isFollowing) {
      await unfollow({ variables: { userId: user.id } });
      setIsFollowing(false);
    } else {
      await follow({ variables: { userId: user.id } });
      setIsFollowing(true);
    }
  };

  /* 7️⃣ render */
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 py-8">
      {/* header */}
      <header className="flex items-center gap-6">
        <Image
          src={user.imageUrl ?? '/default-avatar.jpg'}
          alt="avatar"
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">
            {user.name ?? user.username}
          </h2>
          {canFollow && (
            <button
              onClick={toggleFollow}
              disabled={following || unfollowing}
              className={
                (isFollowing
                  ? 'border border-zinc-500 bg-transparent text-zinc-200 hover:bg-zinc-800'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500') +
                ' rounded px-4 py-1 text-sm transition-colors disabled:opacity-50'
              }
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </header>

      {/* stats */}
      <Stats
        followers={user.followersCount ?? 0}
        following={user.followingCount ?? 0}
        posts={user.posts?.length ?? 0}
      />

      {/* bio & links */}
      {editable && isMine ? (
        editing ? (
          <Editor
            bio={bio}
            site={site}
            github={github}
            saving={saving}
            onBio={setBio}
            onSite={setSite}
            onGithub={setGithub}
            onSave={saveProfile}
          />
        ) : (
          <Viewer
            bio={user.bio}
            site={user.website}
            github={user.github}
            username={user.username}
            onEdit={() => setEditing(true)}
          />
        )
      ) : (
        <Viewer
          bio={user.bio}
          site={user.website}
          github={user.github}
          username={user.username}
        />
      )}

      {/* posts heading */}
      <h3 className="mt-10 border-b-2 border-indigo-500 pb-1 text-lg font-semibold">
        {(user.name ?? user.username) + "'s Posts"}
      </h3>

      {/* posts */}
      <div className="space-y-6">
        {(user.posts as Post[] | undefined)?.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </main>
  );
}

/* ---------- helpers ---------- */
function Stats({
  followers,
  following,
  posts,
}: {
  followers: number;
  following: number;
  posts: number;
}) {
  return (
    <div className="flex gap-8 text-center">
      <Stat n={followers} label="Followers" />
      <Stat n={following} label="Following" />
      <Stat n={posts} label="Posts" />
    </div>
  );
}
function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="w-24">
      <p className="text-lg font-semibold">{n}</p>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}

/* ---------- viewer ---------- */
function Viewer({
  bio,
  site,
  github,
  onEdit,
}: {
  bio: string | null | undefined;
  site: string | null | undefined;
  github: string | null | undefined;
  username: string;
  onEdit?: () => void;
}) {
  /* only show the GitHub row when a non-empty handle / URL exists */
  const ghValue = github?.trim() || '';
  const ghHref = ghValue.startsWith('http')
    ? ghValue
    : `https://github.com/${ghValue}`;
  const ghLabel = ghValue.replace(/^https?:\/\//, '');

  return (
    <div className="space-y-3">
      {/* bio */}
      {bio && <p className="text-base text-zinc-100">{bio}</p>}

      {/* website */}
      {site && (
        <p className="flex items-center gap-2 text-base">
          <Globe size={16} className="text-zinc-400" />
          <a
            href={site.startsWith('http') ? site : `https://${site}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            {site.replace(/^https?:\/\//, '')}
          </a>
        </p>
      )}

      {/* GitHub – shown only when `github` is provided */}
      {ghValue && (
        <p className="flex items-center gap-2 text-base">
          <Github size={16} className="text-zinc-400" />
          <a
            href={ghHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            {ghLabel}
          </a>
        </p>
      )}

      {/* edit button (own profile) */}
      {onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
        >
          <Pencil size={16} /> Edit
        </button>
      )}
    </div>
  );
}

/* ---------- editor ---------- */
function Editor({
  bio,
  site,
  github,
  saving,
  onBio,
  onSite,
  onGithub,
  onSave,
}: {
  bio: string;
  site: string;
  github: string;
  saving: boolean;
  onBio: (v: string) => void;
  onSite: (v: string) => void;
  onGithub: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <textarea
        rows={3}
        placeholder="Edit bio…"
        className="w-full resize-none rounded bg-neutral-800 p-3 text-sm"
        value={bio}
        onChange={(e) => onBio(e.target.value)}
      />
      <input
        type="url"
        placeholder="Edit website…"
        className="w-full rounded bg-neutral-800 p-3 text-sm"
        value={site}
        onChange={(e) => onSite(e.target.value)}
      />
      <input
        type="text"
        placeholder="Edit GitHub username or URL…"
        className="w-full rounded bg-neutral-800 p-3 text-sm"
        value={github}
        onChange={(e) => onGithub(e.target.value)}
      />
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded bg-indigo-600 px-4 py-1 text-sm disabled:opacity-50
                   hover:bg-indigo-500 hover:brightness-110 transition-colors"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
