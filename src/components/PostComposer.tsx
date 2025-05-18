'use client';
import { FormEvent, useState } from 'react';
import { useCreatePostMutation } from '@/generated/graphql';

export function PostComposer() {
  const [content, setContent] = useState('');
  const [createPost, { loading }] = useCreatePostMutation({
    refetchQueries: ['Feed'], // refresh feed after post
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await createPost({ variables: { content } });
    setContent('');
  };

  return (
    <form
      onSubmit={submit}
      className="border rounded bg-white p-4 shadow-sm mb-4"
    >
      <textarea
        className="w-full border rounded p-2"
        rows={3}
        placeholder="Share something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end mt-2">
        <button
          disabled={loading || !content.trim()}
          className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </form>
  );
}
