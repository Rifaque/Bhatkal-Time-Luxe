import NodeCache from 'node-cache';

// Shared singleton so both the brands route and admin routes
// can read and invalidate the same cache instance.
export const brandsCache = new NodeCache({ stdTTL: 300 });
