// src/lib/useSocket.ts
'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { Broadcast } from './redis';

let socket: Socket | null = null;

export function useSocket(onEvent: (evt: Broadcast) => void) {
  const [s] = useState<Socket>(() => {
    if (!socket) {
      socket = io(undefined, {
        path: '/api/socket',
        transports: ['websocket'],
        withCredentials: true,
      });
    }
    return socket!;
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
