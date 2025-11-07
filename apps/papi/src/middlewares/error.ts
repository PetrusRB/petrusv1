import { Context } from 'hono';

export const errorHandler = (err: Error, c: Context) => {
  console.error('❌ Error:', err);

  const status = 'status' in err ? (err as any).status : 500;

  return c.json(
    {
      error: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
    },
    status
  );
};
