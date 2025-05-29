// ─── src/types/index.ts ────────────────────────────────────────────

/** Minimal user profile used all over the UI */
export interface User {
  id: string;
  username: string;
  /** Full-name (may be empty) */
  name?: string;
  /** Public avatar URL (nullable) */
  imageUrl?: string | null;
}

/** Flat representation of a comment returned by GraphQL */
export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: User;
}

/** Post fields required by the client (matches PostFragment) */
export interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  author: User;

  /* aggregated & viewer-specific */
  likeCount: number;
  commentCount: number;
  viewerHasLiked: boolean;
}
