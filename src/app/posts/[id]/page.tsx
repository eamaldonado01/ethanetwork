import { notFound } from 'next/navigation';
import SinglePost from '@/components/SinglePost';
import { getPostWithComments } from '@/lib/api';
import type { Comment } from '@/types';
import type { PostFragmentFragment as Post } from '@/generated/graphql';

interface Props {
  params: Promise<{ id: string }>; // “params” arrives as a Promise in RSC
}

export default async function PostDetail({ params }: Props) {
  const { id } = await params;

  const data = await getPostWithComments(id);
  if (!data) notFound();

  /* ----- author guarantees ---------------------------------------- */
  const rawAuthor = data.post.author as Post['author']; // assert correct shape
  const author = {
    ...rawAuthor,
    name: rawAuthor.name ?? rawAuthor.username,
  } as Post['author'];
  /* ---------------------------------------------------------------- */

  /** Build fully typed Post object for <SinglePost/> */
  const post: Post = {
    ...(data.post as Post),
    author,
  };

  /** Build typed Comment array (fill author.name) */
  const comments: Comment[] = (data.comments as unknown as Comment[]).map(
    (c) => ({
      ...c,
      author: {
        ...c.author,
        name: c.author.name ?? c.author.username,
      },
    }),
  );

  return <SinglePost post={post} comments={comments} />;
}
