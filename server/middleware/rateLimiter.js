const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;
const { errorResponse } = require('../utils/apiResponse');

/**
 * Hybrid Rate-Limit Key Generator:
 * - If req.user?.id is populated by verified authentication middleware, key by authenticated user ID (`user:${req.user.id}`)
 * - Otherwise (unauthenticated or pre-auth requests), safely fallback to IP address (`ip:${ipKeyGenerator(clientIp)}`)
 *
 * Security:
 * - Never trusts arbitrary client headers (e.g. X-User-ID, User-ID)
 * - Safe fallback to IP when req.user is absent
 * - Uses express-rate-limit's ipKeyGenerator to normalize IPv6 subnets (/56) and prevent address cycling bypasses
 */
const getRateLimitKey = (req) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  const clientIp = req.ip || req.socket?.remoteAddress || '127.0.0.1';
  return `ip:${ipKeyGenerator(clientIp)}`;
};

/**
 * Standard handler for rate limit violations returning unified API error response
 */
const createRateLimitHandler = (customMessage) => {
  return (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000 / 60);
    return errorResponse(
      res,
      options.statusCode || 429,
      customMessage || `Too many requests from this IP. Please try again after ${retryAfter} minutes.`
    );
  };
};

/**
 * Global API Rate Limiter
 * Applied across all /api/v1 routes (150 requests per 15 minutes by default)
 * Hybrid key: user ID if authenticated, client IP fallback if unauthenticated
 */
const globalApiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '150', 10),
  standardHeaders: true, // Return standard RateLimit headers in response
  legacyHeaders: false, // Disable X-RateLimit-* headers
  keyGenerator: getRateLimitKey,
  handler: createRateLimitHandler('Too many requests to the HackVerse API. Please wait a few minutes before trying again.'),
  skip: (req) => {
    // Optional health check exemption
    return req.path === '/health';
  },
});

/**
 * Strict Authentication Rate Limiter
 * Protects login and registration against credential stuffing & brute-force attacks (10 attempts per 15 mins)
 * Strictly IP-based (unauthenticated users do not possess a verified authenticated identity)
 */
const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many login or registration attempts from this IP. Please try again in 15 minutes.'),
});

/**
 * Media & File Upload Rate Limiter
 * Guards heavy multipart/form-data upload endpoints (20 uploads per 15 mins)
 * Hybrid key: user ID if authenticated, client IP fallback if unauthenticated
 */
const uploadRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRateLimitKey,
  handler: createRateLimitHandler('Upload rate limit reached. Please wait before submitting additional files.'),
});

module.exports = {
  getRateLimitKey,
  createRateLimitHandler,
  globalApiLimiter,
  authRateLimiter,
  uploadRateLimiter,
};
