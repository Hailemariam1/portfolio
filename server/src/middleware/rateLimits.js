import rateLimit from 'express-rate-limit';

const handler = (_req, res) =>
  res.status(429).json({
    error: 'Too many requests. Please wait a few minutes and try again.'
  });

/** Brute-force protection for the admin login. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler
});

/** Abuse protection for the public contact form. */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler
});

/** Generic limiter for authenticated write endpoints. */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler
});
