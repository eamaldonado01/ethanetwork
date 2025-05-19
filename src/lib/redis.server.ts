// src/lib/redis.server.ts
import { createClient } from 'redis';
import type { Channel } from './redis';

export const REDIS_URL = process.env.REDIS_URL!;

/**
 * Make a pub/sub pair of Redis clients.
 * We leave off an explicit return type so TS will infer a
 * compatible RedisClientType for the adapter.
 */
export function makeRedisClients() {
  const pub = createClient({ url: REDIS_URL });
  const sub = createClient({ url: REDIS_URL });
  return { pub, sub };
}

/**
 * Publish a simple message and close the client.
 */
export async function publish(channel: Channel, payload: string) {
  const client = createClient({ url: REDIS_URL });
  await client.connect();
  await client.publish(channel, payload);
  await client.disconnect();
}
