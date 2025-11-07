import { Hono } from 'hono';
import { rootRoute } from './root.js';
import { userRoute } from './user.js';
import { authRoute } from './auth.js';
export const routes = new Hono();
routes.route('/', rootRoute);
routes.route('/user', userRoute);
routes.route('/auth', authRoute);
