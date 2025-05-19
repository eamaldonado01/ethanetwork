// src/pages/api/socket.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import type { Socket } from 'net';
import { createAdapter } from '@socket.io/redis-adapter';
import { makeRedisClients } from '@/lib/redis.server';
import { CHANNELS } from '@/lib/redis';

interface SocketWithServer extends Socket {
  server: HTTPServer & { io?: IOServer };
}

async function socketHandler(req: NextApiRequest, res: NextApiResponse) {
  // Auth0 has already validated the cookie and set req.auth
  if (!res.socket) {
    res.status(500).end('No socket available');
    return;
  }

  const sock = res.socket as SocketWithServer;
  const httpServer = sock.server;

  if (!httpServer.io) {
    const io = new IOServer(httpServer, {
      path: '/api/socket',
      transports: ['websocket'],
      cors: { origin: true, credentials: true },
    });
    httpServer.io = io;

    const { pub, sub } = makeRedisClients();
    await Promise.all([pub.connect(), sub.connect()]);
    io.adapter(createAdapter(pub, sub));

    Object.values(CHANNELS).forEach((channel: string) => {
      sub.subscribe(channel, (msg: string) => {
        io.emit(channel, msg);
      });
    });

    io.on('connection', (socket) => {
      console.log('🔥 socket connected', socket.id);
    });
  }

  res.end();
}

export default withApiAuthRequired(socketHandler);
