// src/lib/redis.ts
export const CHANNELS = {
  NEW_POST: 'new-post',
  LIKE_UPDATE: 'like-update',
  FOLLOW_UPDATE: 'follow-update',
} as const;

export type Channel = (typeof CHANNELS)[keyof typeof CHANNELS];
export type Broadcast = { type: Channel; payload: string };
