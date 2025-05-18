'use client';
import Image from 'next/image';
import {
  PostFragmentFragment as PostFragment,
  useLikePostMutation,
  useUnlikePostMutation,
} from '@/generated/graphql';

export function PostCard({ post }: { post: PostFragment }) {
  const [like] = useLikePostMutation({ variables: { postId: post.id } });
  const [unlike] = useUnlikePostMutation({ variables: { postId: post.id } });

  const toggleLike = () => (post.viewerHasLiked ? unlike() : like());

  return (
    <article className="border p-4 rounded bg-white shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Image
          src={post.author.imageUrl || '/default-avatar.png'}
          alt={`${post.author.username} avatar`}
          width={24}
          height={24}
          className="rounded-full"
        />
        @{post.author.username}
      </div>

      <p className="mt-2 whitespace-pre-wrap">{post.content}</p>

      {post.imageUrl && (
        <Image
          src={post.imageUrl}
          alt=""
          width={400}
          height={300}
          className="mt-2 rounded-lg max-h-96 object-cover"
        />
      )}

      <div className="mt-2 text-xs flex items-center gap-4">
        <button
          onClick={toggleLike}
          className="hover:underline disabled:opacity-50"
        >
          {post.viewerHasLiked ? '💙 Unlike' : '🤍 Like'} ({post.likeCount})
        </button>
        <span>{post.commentCount} comments</span>
      </div>
    </article>
  );
}
