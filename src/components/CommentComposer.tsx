'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { useMutation } from '@apollo/client';
import { v4 as uuid } from 'uuid';

import CommentOnPost from '@/graphql/operations/post/CommentOnPost.graphql';
import type { Comment, User } from '@/types';

const MAX = 500;

export default function CommentComposer({
  postId,
  currentUser,
  onCreated,
}: {
  postId: string;
  currentUser?: User;
  onCreated: (c: Comment) => void;
}) {
  const [body, setBody] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  /* auto-expand textarea as the user types */
  useLayoutEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = `${taRef.current.scrollHeight}px`;
  }, [body]);

  /* logged-in viewer or “You” fallback */
  const viewer: User = currentUser ?? {
    id: 'me',
    username: 'You',
    name: 'You',
    imageUrl: null,
  };

  /* optimistic comment so UI updates instantly */
  const tempId = `temp-${uuid()}`;
  const optimistic: Comment = {
    id: tempId,
    body,
    createdAt: new Date().toISOString(),
    author: viewer,
  };

  const [createComment, { loading }] = useMutation(CommentOnPost, {
    variables: { postId, body },
    optimisticResponse: { commentOnPost: optimistic },
    onCompleted: ({ commentOnPost }) => {
      setBody('');

      /* keep author == viewer so delete-button logic recognises it */
      onCreated({
        ...commentOnPost,
        tempId, // replace placeholder
        author: viewer, // ensure “mine” flag works
      });
    },
  });

  const tooLong = body.length > MAX;

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim() || tooLong) return;

        onCreated(optimistic); // instant UI
        createComment().catch(() => {
          /* optional rollback */
        });
        setBody('');
      }}
    >
      <textarea
        ref={taRef}
        className="w-full resize-none rounded bg-neutral-800 p-2 text-sm outline-none
                   min-h-[2.5rem] max-h-[12rem] overflow-y-auto break-words break-all whitespace-pre-wrap"
        placeholder="Add a comment…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={MAX}
        disabled={loading}
      />

      <div className="flex items-center justify-end gap-4">
        <span
          className={`text-xs ${tooLong ? 'text-red-400' : 'text-neutral-500'}`}
        >
          {body.length}/{MAX}
        </span>

        <button
          type="submit"
          className="rounded bg-indigo-600 px-3 py-[2px] text-sm disabled:opacity-50
                     hover:bg-indigo-500 hover:brightness-110 transition-colors"
          disabled={loading || !body.trim() || tooLong}
        >
          Reply
        </button>
      </div>
    </form>
  );
}
