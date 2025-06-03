'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { useMutation, Reference, StoreObject } from '@apollo/client';
import type { ModifierDetails } from '@apollo/client/cache';
import { useUser } from '@auth0/nextjs-auth0/client';
import { formatDistanceToNow } from 'date-fns';

import UserLink from '@/components/UserLink';
import LikePost from '@/graphql/operations/post/LikePost.graphql';
import UnlikePost from '@/graphql/operations/post/UnlikePost.graphql';
import DeletePost from '@/graphql/operations/post/DeletePost.graphql';
import type { PostFragmentFragment as Post } from '@/generated/graphql';

const indigo = '#6366F1';

type Entity = Reference | StoreObject | undefined;

/* helper – safe id read */
const getId = (readField: ModifierDetails['readField'], ref: Entity | null) =>
  readField<string>('id', ref ?? undefined);

type Props = {
  post: Post;
  onDeleted?: (id: string) => void;
};

export default function PostCard({ post, onDeleted }: Props) {
  /* ─── like state ─────────────────────────────────────────────── */
  const [liked, setLiked] = useState(post.viewerHasLiked);
  const [likes, setLikes] = useState(post.likeCount);
  const [like] = useMutation(LikePost, { variables: { postId: post.id } });
  const [unlike] = useMutation(UnlikePost, { variables: { postId: post.id } });

  const toggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikes((n) => n - 1);
      unlike().catch(() => {
        setLiked(true);
        setLikes((n) => n + 1);
      });
    } else {
      setLiked(true);
      setLikes((n) => n + 1);
      like().catch(() => {
        setLiked(false);
        setLikes((n) => n - 1);
      });
    }
  };

  /* ─── feed & me modifiers (unchanged) ─────────────────────────── */
  const pruneFeed = (value: Entity, details: ModifierDetails): Entity => {
    if (
      !value ||
      typeof value !== 'object' ||
      !('edges' in value) ||
      !Array.isArray((value as { edges?: unknown }).edges)
    ) {
      return value;
    }

    const { readField } = details;
    const store = value as StoreObject;
    const edges = (store.edges as unknown[]).filter((edge) => {
      const node = (edge as { node?: Entity }).node;
      return getId(readField, node) !== post.id;
    });

    return { ...store, edges } as StoreObject;
  };

  const pruneMe = (value: Entity, details: ModifierDetails): Entity => {
    if (
      !value ||
      typeof value !== 'object' ||
      !('posts' in value) ||
      !Array.isArray((value as { posts?: unknown }).posts)
    ) {
      return value;
    }

    const { readField } = details;
    const store = value as StoreObject;
    const posts = (store.posts as unknown[]).filter(
      (ref) => getId(readField, ref as Entity) !== post.id,
    );

    return { ...store, posts } as StoreObject;
  };

  /* ─── delete mutation ─────────────────────────────────────────── */
  const [deletePost, { loading: deleting }] = useMutation(DeletePost, {
    variables: { postId: post.id },
    optimisticResponse: { deletePost: true },
    update(cache) {
      cache.evict({ id: cache.identify({ __typename: 'Post', id: post.id }) });
      cache.modify({ fields: { feed: pruneFeed } });
      cache.modify({ fields: { me: pruneMe } });
      cache.gc();
    },
    onCompleted: () => onDeleted?.(post.id),
  });

  /* ─── perms + nav ─────────────────────────────────────────────── */
  const { user } = useUser();

  /** Auth0 users use `sub`; guest user has no session so use literal "guest" */
  const viewerId =
    user && 'sub' in user && typeof user.sub === 'string' ? user.sub : 'guest';

  const isAuthor = viewerId === post.author.id;

  const router = useRouter();
  const goToDetails = () => router.push(`/posts/${post.id}`);

  /* ─── render ──────────────────────────────────────────────────── */
  return (
    <article
      onClick={goToDetails}
      className="group relative rounded-lg bg-neutral-900 p-4 transition-colors hover:bg-neutral-800"
    >
      {/* header */}
      <header className="mb-3 flex items-center gap-3 text-sm">
        <Image
          src={post.author.imageUrl ?? '/default-avatar.jpg'}
          alt="avatar"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <UserLink
          id={post.author.id}
          username={post.author.username}
          name={post.author.name}
        />
        <span className="text-zinc-500">
          • {formatDistanceToNow(new Date(post.createdAt))} ago
        </span>

        {isAuthor && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this post?')) deletePost();
            }}
            className="ml-auto rounded p-1 text-indigo-400
                       opacity-100                   /* mobiles (< lg) */
                       lg:opacity-0 lg:group-hover:opacity-100
                       transition-opacity hover:bg-indigo-800/20"
            disabled={deleting}
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        )}
      </header>

      {/* body */}
      <div className="mb-4 space-y-3">
        <p className="whitespace-pre-line">{post.content}</p>

        {post.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt="post media"
            className="max-h-96 w-full rounded object-contain"
          />
        )}
      </div>

      {/* footer */}
      <footer
        onClick={(e) => e.stopPropagation()}
        className="flex gap-6 text-sm text-indigo-400"
      >
        <button onClick={toggleLike} className="flex items-center gap-1">
          <Heart
            size={16}
            color={indigo}
            fill={liked ? indigo : 'none'}
            strokeWidth={2}
          />
          {likes}
        </button>

        <button
          onClick={() => router.push(`/posts/${post.id}`)}
          className="flex items-center gap-1"
        >
          <MessageCircle size={16} color={indigo} strokeWidth={2} />
          {post.commentCount}
        </button>
      </footer>
    </article>
  );
}
