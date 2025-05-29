// src/lib/useSocket.ts
'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { Broadcast } from './redis';

let shared: Socket | null = null;

export function useSocket(onEvent: (evt: Broadcast) => void) {
  /* one singleton per tab */
  const [s] = useState<Socket>(() => {
    if (!shared) {
      /* host omitted → window.location.origin  */
      shared = io({
        // ⟵ no “localhost”
        path: '/api/socket',
        transports: ['websocket'],
        withCredentials: true,
      });
    }
    return shared;
  });

  useEffect(() => {
    s.onAny((type, payload) => {
      onEvent({ type: type as Broadcast['type'], payload: String(payload) });
    });
    return () => {
      s.offAny();
    };
  }, [s, onEvent]);
}
