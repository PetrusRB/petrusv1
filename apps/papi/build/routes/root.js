import { Hono } from 'hono';
export const rootRoute = new Hono();
rootRoute.get('/', (c) => {
    return c.json({
        message: 'pizza é muito bom',
        docs: '/docs',
        status: 'OK',
    });
});
