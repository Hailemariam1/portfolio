import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const ADMIN_SESSION_MS = 1000 * 60 * 60 * 24 * 7;

export function signAdminToken(admin) {
  return jwt.sign({ sub: String(admin._id), role: admin.role || 'admin' }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

export function verifyAdminToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/'
  };
}

export function adminCookieOptions() {
  return { ...baseCookieOptions(), maxAge: ADMIN_SESSION_MS };
}

export function clearAdminCookieOptions() {
  return baseCookieOptions();
}
