import 'next';
import type { JwtPayload } from 'jsonwebtoken';

declare module 'next' {
  interface NextApiRequest {
    auth?: JwtPayload | string;
  }
}
