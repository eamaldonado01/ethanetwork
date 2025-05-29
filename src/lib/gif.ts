/* Tenor GIF search helper -------------------------------------------- *
 * Requires NEXT_PUBLIC_TENOR_API_KEY in your env (.env.local or prod)  */

const TENOR_API = 'https://tenor.googleapis.com/v2';

export interface GifResult {
  id: string;
  tiny: string; // tiny preview (WebP / GIF)
  url: string; // full-size mp4/webp/gif url
  alt: string;
}

/* Tenor response subsets we care about -------------------------------- */
interface TenorMediaFormats {
  tinygif?: { url?: string };
  gif?: { url?: string };
  mediumgif?: { url?: string };
  mp4?: { url?: string };
}

interface TenorResult {
  id: string;
  media_formats?: TenorMediaFormats;
  content_description?: string;
}

export async function searchGifs(q = '', limit = 24): Promise<GifResult[]> {
  const key = process.env.NEXT_PUBLIC_TENOR_API_KEY;
  if (!key) throw new Error('TENOR_API_KEY missing');

  const endpoint = q
    ? `${TENOR_API}/search?key=${key}&q=${encodeURIComponent(q)}&limit=${limit}`
    : `${TENOR_API}/featured?key=${key}&limit=${limit}`;

  const res = await fetch(endpoint);
  const json: { results?: unknown[] } = await res.json();

  return (Array.isArray(json.results) ? json.results : []).map(
    (item): GifResult => {
      const g = item as Partial<TenorResult>;
      const m = g.media_formats ?? {};

      return {
        id: g.id ?? '',
        tiny: m.tinygif?.url ?? m.gif?.url ?? '',
        url: m.gif?.url ?? m.mediumgif?.url ?? m.mp4?.url ?? '',
        alt: g.content_description ?? 'gif',
      };
    },
  );
}
