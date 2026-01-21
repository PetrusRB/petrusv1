import 'dotenv/config';

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { routes } from './routes/index.js';
import { withClerk } from './middlewares/auth.js';
import { errorHandler } from './middlewares/error.js';

const app = new Hono();

// Global middlewares
app.use('*', withClerk);

// Mount routes
app.route('/', routes);

// Error handler
app.onError(errorHandler);

serve({
  fetch: app.fetch,
  port: 3001,
}).on('listening', () => console.log('[Server]: Ligado com sucesso (backend)'));
