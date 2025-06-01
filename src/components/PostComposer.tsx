/* ─── src/components/PostComposer.tsx ───────────────────────────────────── */
'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Film } from 'lucide-react';

import CreatePost from '@/graphql/operations/post/CreatePost.graphql';
import GifPicker from '@/components/GifPicker';

const MAX = 2_000;

/* helper – try to read { error: string } from an unknown value */
function extractMessage(u: unknown): string | undefined {
  return typeof u === 'object' && u !== null && 'error' in u
    ? String((u as { error?: unknown }).error)
    : undefined;
}

/* -------------------------------------------------------------------------- */
/*  Helper: request signed URL then PUT the file                              */
/* -------------------------------------------------------------------------- */
async function uploadImage(file: File): Promise<string> {
  /* 1. ask backend for a signed PUT url */
  const signRes = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  });

  if (!signRes.ok) {
    const msg = extractMessage(await signRes.json().catch(() => ({})));
    throw new Error(`sign-url failed: ${msg ?? signRes.status}`);
  }

  const { url, publicUrl } = (await signRes.json()) as {
    url: string;
    publicUrl: string;
  };

  /* 2. upload the bytes to S3 – content-type *must* match the signed value */
  const putRes = await fetch(url, {
    method: 'PUT',
    headers: { 'content-type': file.type },
    body: file,
  });

  if (!putRes.ok) throw new Error(`S3 upload failed: ${putRes.status}`);
  return publicUrl; // return the CDN-visible URL
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function PostComposer() {
  /* state ------------------------------------------------------------------ */
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [remoteUrl, setRemote] = useState<string | null>(null); // gif URL
  const [preview, setPreview] = useState<string | null>(null); // local <img>
  const [showGif, setShowGif] = useState(false);
  const [busy, setBusy] = useState(false);

  const router = useRouter();
  const txtRef = useRef<HTMLTextAreaElement | null>(null);

  /* apollo ----------------------------------------------------------------- */
  const [create] = useMutation(CreatePost, {
    onCompleted() {
      setContent('');
      setFile(null);
      setRemote(null);
      setPreview(null);
      router.push('/home');
    },
  });

  /* auto-resize textarea ---------------------------------------------------- */
  useLayoutEffect(() => {
    if (!txtRef.current) return;
    txtRef.current.style.height = '0px';
    txtRef.current.style.height = `${txtRef.current.scrollHeight}px`;
  }, [content]);

  /* pickers ---------------------------------------------------------------- */
  function selectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setRemote(null); // remove gif preview
    }
  }

  function gifChosen(url: string) {
    setRemote(url);
    setPreview(url);
    setFile(null); // remove image preview
    setShowGif(false);
  }

  function removeMedia() {
    setFile(null);
    setRemote(null);
    setPreview(null);
  }

  /* post ------------------------------------------------------------------- */
  const canPost = content.trim().length > 0 || file || remoteUrl;

  async function submit() {
    if (!canPost || busy) return;
    setBusy(true);

    try {
      let imageUrl: string | undefined;
      if (file) imageUrl = await uploadImage(file);
      else if (remoteUrl) imageUrl = remoteUrl;

      await create({ variables: { content: content.trim(), imageUrl } });
    } catch (err) {
      console.error('upload/post error →', err);
      alert('Upload failed – please try again.');
      setBusy(false);
    }
  }

  /* ui --------------------------------------------------------------------- */
  return (
    <div className="rounded bg-neutral-900 p-4 shadow">
      <textarea
        ref={txtRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something…"
        maxLength={MAX}
        rows={2}
        className="min-h-[6rem] w-full resize-none bg-transparent text-sm outline-none"
      />

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
          {/* image */}
          <label className="cursor-pointer rounded bg-indigo-600 p-3 hover:bg-indigo-500 disabled:opacity-50">
            <ImageIcon size={24} />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={selectFile}
              disabled={busy}
            />
          </label>

          {/* gif */}
          <button
            type="button"
            title="Add GIF"
            onClick={() => setShowGif(true)}
            disabled={busy}
            className="rounded bg-indigo-600 p-3 hover:bg-indigo-500 disabled:opacity-50"
          >
            <Film size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">
            {content.length}/{MAX}
          </span>
          <button
            onClick={submit}
            disabled={!canPost || busy}
            className="rounded bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {busy ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>

      {showGif && (
        <GifPicker onSelect={gifChosen} onClose={() => setShowGif(false)} />
      )}
    </div>
  );
}
