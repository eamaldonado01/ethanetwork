'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Film } from 'lucide-react';

import CreatePost from '@/graphql/operations/post/CreatePost.graphql';
import GifPicker from '@/components/GifPicker';

const MAX = 2_000;

export default function PostComposer() {
  /* ───────────────────────── state */
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null); // gif url
  const [preview, setPreview] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);

  const router = useRouter();
  const txtRef = useRef<HTMLTextAreaElement | null>(null);

  /* ───────────────────────── apollo */
  const [create, { loading }] = useMutation(CreatePost, {
    onCompleted: () => {
      setContent('');
      setFile(null);
      setRemoteUrl(null);
      setPreview(null);
      router.push('/home');
    },
  });

  /* ───────────────────────── helpers */
  function autoResize() {
    if (!txtRef.current) return;
    txtRef.current.style.height = '0px';
    txtRef.current.style.height = txtRef.current.scrollHeight + 'px';
  }

  useLayoutEffect(autoResize, [content]);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      // clear remote gif if new image chosen
      setRemoteUrl(null);
    }
  };

  const handleGifChosen = (url: string) => {
    setRemoteUrl(url);
    setPreview(url);
    // clear local file if gif chosen
    setFile(null);
    setShowGif(false);
  };

  const removeMedia = () => {
    setFile(null);
    setRemoteUrl(null);
    setPreview(null);
  };

  /* at least text OR some media must be present */
  const canPost = content.trim().length > 0 || file || remoteUrl;

  const submit = async () => {
    if (!canPost) return;

    const variables: Record<string, unknown> = { content: content.trim() };

    if (file) variables.image = file; // presuming backend handles upload
    if (remoteUrl) variables.imageUrl = remoteUrl;

    await create({ variables }).catch(console.error);
  };

  /* ───────────────────────── view */
  return (
    <div className="rounded bg-neutral-900 p-4 shadow">
      <textarea
        ref={txtRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onInput={autoResize}
        placeholder="Share something…"
        maxLength={MAX}
        rows={2}
        className="min-h-[6rem] w-full resize-none bg-transparent text-sm outline-none"
      />

      {/* media preview */}
      {preview && (
        <div className="relative mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="preview"
            className="max-h-60 w-full rounded object-contain"
          />
          <button
            onClick={removeMedia}
            className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs hover:bg-black/80"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {/* image input */}
          <label
            title="Add image"
            className="cursor-pointer rounded bg-indigo-600 p-3 hover:bg-indigo-500 disabled:opacity-50"
          >
            <ImageIcon size={24} />
            <span className="sr-only">Add image</span>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleSelectFile}
              disabled={loading}
            />
          </label>

          {/* gif picker */}
          <button
            type="button"
            title="Add GIF"
            className="rounded bg-indigo-600 p-3 hover:bg-indigo-500 disabled:opacity-50"
            onClick={() => setShowGif(true)}
            disabled={loading}
          >
            <Film size={24} />
            <span className="sr-only">Add GIF</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* character count */}
          <span className="text-xs text-zinc-400">
            {content.length}/{MAX}
          </span>

          <button
            onClick={submit}
            disabled={!canPost || loading}
            className="rounded bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>

      {showGif && (
        <GifPicker
          onSelect={handleGifChosen}
          onClose={() => setShowGif(false)}
        />
      )}
    </div>
  );
}
