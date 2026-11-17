import crypto from 'node:crypto';
import env from '../config/env.js';
import { ApiError } from '../utils/http.js';

export const csrfCookieName = `${env.cookieName}_csrf`;

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function tokensMatch(left, right) {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function csrfToken(req, res, next) {
  let token = req.cookies?.[csrfCookieName];
  if (!token) {
    token = createToken();
    res.cookie(csrfCookieName, token, {
      httpOnly: false,
      secure: env.isProd,
      sameSite: 'lax',
      path: '/'
    });
  }
  req.csrfToken = token;
  next();
}

export function getCsrfToken(req, res) {
  res.json({ csrfToken: req.csrfToken });
}

export function requireCsrf(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const cookieToken = req.cookies?.[csrfCookieName];
  const headerToken = req.get('x-csrf-token');
  if (!tokensMatch(cookieToken, headerToken)) {
    return next(ApiError.forbidden('Invalid CSRF token.'));
  }
  return next();
}
