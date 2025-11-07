export const errorHandler = (err, c) => {
    console.error('❌ Error:', err);
    const status = 'status' in err ? err.status : 500;
    return c.json({
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
    }, status);
};
