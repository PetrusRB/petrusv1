import { Hono } from 'hono';
import { AuthController } from '@/modules/auth/auth.controller.js';

export const authRoute = new Hono();

authRoute.post('/login', AuthController.login);
authRoute.post('/callback', AuthController.webhook);
authRoute.post('/logout', AuthController.logout);
