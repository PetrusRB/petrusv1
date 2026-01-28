import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import arcjet, { detectBot, shield, tokenBucket } from '@arcjet/node';
import { isSpoofedBot } from '@arcjet/inspect';
import { getAuth } from '@clerk/nextjs/server';

import { clerkClient } from '@/lib/clerk';
import { User } from '@/schemas/db.schema';
import userRoutes from '@/routes/user/user.router';
import usersRoutes from '@/routes/user/user.sync.router';

/**
 * APP
 */
const basePath = '/api';

type AppVariables = {
  user: User | null;
  sessionId: string | null;
};
const app = new Hono<{ Variables: AppVariables }>().basePath(basePath);

/**
 * ARCJET PROTECITON
 */
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ['ip.src'],
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE'],
    }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

/**
 * MIDDLEWARES
 */
const authMiddleware = async (c: any, next: () => Promise<void>) => {
  const auth = getAuth(c.req.raw);

  if (auth.userId) {
    const clerkUser = await clerkClient.users
      .getUser(auth.userId)
      .catch(() => null);

    if (clerkUser) {
      c.set('user', {
        id: clerkUser.id,
        username: clerkUser.username,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        pictureUrl: clerkUser.imageUrl ?? '/user.png',
      });
    } else {
      c.set('user', null);
    }

    c.set('sessionId', auth.sessionId ?? null);
  } else {
    c.set('user', null);
    c.set('sessionId', null);
  }

  await next();
};

const arcjetMiddleware = async (c: any, next: () => Promise<void>) => {
  if (isExcludedRequest(c.req.path, c.req.method)) {
    return next();
  }

  const { tokens, rules } = getRateLimitConfig(c.req.path, c.req.method);

  const decision = await aj
    .protect(c.req.raw, {
      requested: tokens,
      ...(rules.length && { rules }),
    })
    .catch(() => null);

  if (!decision) return next(); // fail-open

  if (decision.isDenied()) {
    return deny(c, decision);
  }

  if (decision.results.some(isSpoofedBot)) {
    return c.json({ error: 'Forbidden', message: 'Spoofed bot detected' }, 403);
  }

  await next();
};

/**
 * Rate limit
 */
function isExcludedRequest(path: string, method: string) {
  const table: Array<[string, string]> = [['GET', '/api/users/sync']];

  return table.some(([m, p]) => method === m && path.startsWith(p));
}

function getRateLimitConfig(path: string, method: string) {
  // if (path.startsWith('/api/search')) {
  //   return { tokens: 3, rules: [] };
  // }

  // if (path.startsWith('/api/post') && method === 'POST') {
  //   return {
  //     tokens: 5,
  //     rules: [
  //       tokenBucket({
  //         mode: 'LIVE',
  //         refillRate: 2,
  //         interval: 30,
  //         capacity: 5,
  //       }),
  //     ],
  //   };
  // }

  if (path.startsWith('/api/user')) {
    return { tokens: 2, rules: [] };
  }
  if (path.startsWith('/api/users')) {
    return { tokens: 2, rules: [] };
  }

  return { tokens: 1, rules: [] };
}

function deny(c: any, decision: any) {
  if (decision.reason?.isRateLimit()) {
    c.header('X-RateLimit-Reset', decision.reason.resetTime?.toString() ?? '');

    return c.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded',
      },
      429
    );
  }

  return c.json({ error: 'Forbidden', message: 'Request denied' }, 403);
}

/**
 * APP ROUTES
 */

app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (c.req.method === 'OPTIONS') {
    return c.text('', 200);
  }

  await next();
});

// Middleware Order
app.use('*', arcjetMiddleware);
app.use('*', authMiddleware);

// Routes
app.route('/user', userRoutes);
app.route('/users', usersRoutes);

// Error Handling
app.onError((err, c) => {
  console.error('API Error:', err);

  return c.json(
    {
      error: 'Internal Server Error',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Something went wrong',
    },
    500
  );
});

app.notFound((c) =>
  c.json(
    {
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
    },
    404
  )
);

// Exports
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const HEAD = handle(app);
