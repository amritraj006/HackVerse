import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

/**
 * Hybrid Rate-Limit Key Generator:
 * - If req.user?.id is populated, key by authenticated user ID (`user:${req.user.id}`)
 * - If Authorization header has a valid Bearer token, decode it to key by user ID
 * - Otherwise (unauthenticated or pre-auth requests), safely fallback to IP address (`ip:${ipKeyGenerator(clientIp)}`)
 */
export const getRateLimitKey = (req) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  // Pre-route token peek for accurate per-user rate limiting
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token);
      if (decoded?.id) {
        return `user:${decoded.id}`;
      }
    } catch {
      // Fallback to IP on malformed token
    }
  }

  const clientIp = req.ip || req.socket?.remoteAddress || '127.0.0.1';
  return `ip:${ipKeyGenerator(clientIp)}`;
};

/**
 * Standard handler for rate limit violations returning unified API error response
 */
export const createRateLimitHandler = (customMessage) => {
  return (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000 / 60);
    return errorResponse(
      res,
      options.statusCode || 429,
      customMessage || `Too many requests. Please try again after ${retryAfter} minutes.`
    );
  };
};

/**
 * Global API Rate Limiter
 * Applied across all /api/v1 routes (1000 requests per 15 minutes by default)
 * Excludes health checks and session verification (/auth/me) so sessions are never prematurely destroyed.
 */
export const globalApiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (env.nodeEnv === 'development' ? '2000' : '1000'), 10),
  standardHeaders: true, // Return standard RateLimit headers in response
  legacyHeaders: false, // Disable X-RateLimit-* headers
  keyGenerator: getRateLimitKey,
  handler: createRateLimitHandler('Too many requests to the HackVerse API. Please wait a few minutes before trying again.'),
  skip: (req) => {
    // Health checks and session validation must never be throttled
    return req.path === '/health' || req.path === '/auth/me';
  },
});

/**
 * Strict Authentication Rate Limiter
 * Protects login and registration against credential stuffing & brute-force attacks (30 attempts per 15 mins)
 */
export const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '30', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many login or registration attempts from this IP. Please try again in 15 minutes.'),
});

/**
 * Media & File Upload Rate Limiter
 * Guards heavy multipart/form-data upload endpoints (50 uploads per 15 mins)
 */
export const uploadRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '50', 10),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRateLimitKey,
  handler: createRateLimitHandler('Upload rate limit reached. Please wait before submitting additional files.'),
});

export default {
  getRateLimitKey,
  createRateLimitHandler,
  globalApiLimiter,
  authRateLimiter,
  uploadRateLimiter,
};
