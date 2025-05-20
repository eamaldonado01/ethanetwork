// src/components/PostCard.tsx
import React from 'react';
import { CHANNELS, type Broadcast } from '@/lib/redis';
import { useSocket } from '@/lib/useSocket';
import type { PostFragmentFragment as PostFragment } from '@/generated/graphql';

interface Props {
  post: PostFragment;
  onLike?: () => void;
  onNewPost?: () => void;
}

export function PostCard({ post, onLike, onNewPost }: Props) {
  useSocket((evt: Broadcast) => {
    if (evt.type === CHANNELS.LIKE_UPDATE && evt.payload === post.id) {
      onLike?.();
    }
    if (evt.type === CHANNELS.NEW_POST) {
      onNewPost?.();
    }
  });

  return (
    <article className="border p-4 rounded bg-indigo-50 dark:bg-indigo-900 shadow-md mb-4">
      <header className="flex justify-between items-center mb-2">
        <div>
          <strong className="text-indigo-800 dark:text-indigo-200">
            {post.author.username}
          </strong>
          <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-300">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
      </header>
      <p className="mb-2 text-indigo-700 dark:text-indigo-100">
        {post.content}
      </p>
      <div className="flex items-center space-x-4 text-sm text-indigo-600 dark:text-indigo-300">
        <button className="hover:text-indigo-800 dark:hover:text-indigo-100">
          {post.viewerHasLiked ? '💜 Unlike' : '🤍 Like'} ({post.likeCount})
        </button>
        <span>{post.commentCount} comments</span>
      </div>
    </article>
  );
}
