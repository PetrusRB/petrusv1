import { Hono } from 'hono';
import { requireAuth } from '../middlewares/auth.js';
import { UserController } from '../modules/user/user.controller.js';
export const userRoute = new Hono();
userRoute.use('*', requireAuth);
userRoute.get('/user', UserController.getUser);
userRoute.patch('/update', UserController.updateCurrentUser);
userRoute.get('/current', UserController.getCurrentUser);
