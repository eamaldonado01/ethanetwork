'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useUser } from '@auth0/nextjs-auth0/client';

import PostCard from './PostCard';
import CommentComposer from './CommentComposer';
import UserLink from './UserLink';

import DeleteComment from '@/graphql/operations/post/DeleteComment.graphql';
import type { Comment } from '@/types';
import type { PostFragmentFragment as Post } from '@/generated/graphql';

type MyComment = Comment & { byMe?: true; tempId?: string };

/* ---------- helpers to persist deletes across a hard refresh ---------- */
const STORAGE_KEY = 'pendingCommentDeletes';

const loadStoredDeletes = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
};

const persistDeletes = (set: Set<string>): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
};

export default function SinglePost({
  post,
  comments,
}: {
  post: Post;
  comments: Comment[];
}) {
  const { user } = useUser();
  const router = useRouter();
  const viewerId = user?.sub ?? 'guest';

  /* ---------- local state ---------- */
  const [localComments, setLocalComments] = useState<MyComment[]>(
    [...comments].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    ),
  );

  /* remember optimistic ids the viewer deleted before real row arrived */
  const pendingDeletes = useRef<Set<string>>(new Set());

  /* on mount pull any persisted delete intents */
  useEffect(() => {
    pendingDeletes.current = loadStoredDeletes();
  }, []);

  /* utility so we always sync localStorage when we change the set */
  const addPendingDelete = (id: string) => {
    pendingDeletes.current.add(id);
    persistDeletes(pendingDeletes.current);
  };
  const removePendingDelete = (id: string) => {
    pendingDeletes.current.delete(id);
    persistDeletes(pendingDeletes.current);
  };

  /* ---------- mutations ---------- */
  const [deleteComment] = useMutation(DeleteComment);

  /** delete comment and retry with back‑off */
  const retryDelete = async (commentId: string, attempt = 1): Promise<void> => {
    console.debug('[retryDelete] attempt', attempt, 'id', commentId);

    try {
      const { data } = await deleteComment({ variables: { commentId } });

      if (!data?.deleteComment) throw new Error('deleteComment returned false');
    } catch (err) {
      console.warn('[retryDelete] error on attempt', attempt, err);

      if (attempt < 5) {
        setTimeout(() => retryDelete(commentId, attempt + 1), 250 * attempt);
        return;
      }
      // last-ditch: sync UI & DB
      router.refresh();
    }
  };

  /* add freshly‑created comment OR swap server row for its temp twin */
  const addOrReplace = (incoming: MyComment) => {
    incoming.byMe = true;

    setLocalComments((prev) => {
      if (incoming.tempId) {
        const withoutTemp = prev.filter((c) => c.id !== incoming.tempId);

        if (pendingDeletes.current.has(incoming.tempId)) {
          // user already deleted optimistic copy → delete real row too
          removePendingDelete(incoming.tempId);
          retryDelete(incoming.id);
          return withoutTemp;
        }
        return [{ ...incoming, byMe: true }, ...withoutTemp];
      }
      return [incoming, ...prev];
    });
  };

  /* user clicks the trash‑can */
  const handleDelete = (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    setLocalComments((prev) => prev.filter((c) => c.id !== commentId));

    if (commentId.startsWith('temp-')) {
      // optimistic placeholder – remember and wait for real id
      addPendingDelete(commentId);
      return;
    }
    retryDelete(commentId);
  };

  /* navigate home if *this* post gets deleted */
  const handlePostDeleted = () => router.push('/home');

  /* ---------- UI ---------- */
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <PostCard post={post} onDeleted={handlePostDeleted} />

      <CommentComposer
        postId={post.id}
        currentUser={
          user
            ? {
                id: user.sub ?? 'me',
                username: user.nickname ?? user.email ?? 'me',
                name: user.name ?? user.nickname ?? undefined,
                imageUrl: user.picture ?? null,
              }
            : undefined
        }
        onCreated={addOrReplace}
      />

      <div className="space-y-4">
        {localComments.map((c) => {
          const isMine = c.byMe || c.author.id === viewerId;

          return (
            <div
              key={c.id}
              className="group flex w-full items-start gap-3 rounded bg-neutral-900 p-4 shadow transition-colors hover:bg-neutral-800"
            >
              <Image
                src={c.author.imageUrl ?? '/default-avatar.png'}
                alt="avatar"
                width={32}
                height={32}
                className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1 text-xs">
                  <UserLink
                    id={c.author.id}
                    username={c.author.username}
                    name={c.author.name}
                  />
                  <span className="text-neutral-500">
                    • {formatDistanceToNow(new Date(c.createdAt))} ago
                  </span>

                  {isMine && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="ml-auto rounded p-1 text-indigo-400 opacity-0 transition-opacity hover:bg-indigo-800/20 group-hover:opacity-100"
                    >
                      <Trash2 size={12} strokeWidth={2} />
                    </button>
                  )}
                </div>

                <p className="whitespace-pre-wrap break-all text-sm">
                  {c.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
