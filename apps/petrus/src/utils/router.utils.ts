import { Hono } from 'hono';
import { cors } from 'hono/cors';

type CorOptions = {
  origin: string | string[];
  allowHeaders: string[];
  allowMethods: string[];
  credentials: boolean;
  exposeHeaders: string[];
};
const corsOptions: CorOptions = {
  origin: process.env.NEXT_PUBLIC_BASE_URL || [],
  allowHeaders: [
    'Origin',
    'Content-Type',
    'Authorization',
    'x-csrf-token',
    'Access-Control-Allow-Origin',
  ],
  allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  exposeHeaders: ['Access-Control-Allow-Origin', 'Content-Length'],
};

export function createRouter() {
  const router = new Hono();
  router.use('*', cors(corsOptions));
  return router;
}
