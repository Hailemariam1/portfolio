import Admin from '../models/Admin.js';
import { verifyAdminToken } from '../utils/tokens.js';
import env from '../config/env.js';
import { ApiError } from '../utils/http.js';

function extractToken(req) {
  const cookieToken = req.cookies?.[env.cookieName];
  if (cookieToken) return cookieToken;
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/**
 * Every administrative route is mounted behind this middleware. A missing,
 * invalid or expired session never reaches a controller.
 */
export async function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized();

    let payload;
    try {
      payload = verifyAdminToken(token);
    } catch {
      throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    }

    const admin = await Admin.findById(payload.sub);
    if (!admin) throw ApiError.unauthorized('This account no longer exists.');

    // A password reset invalidates tokens issued before the change.
    if (admin.passwordChangedAt && payload.iat) {
      const changedAtSeconds = Math.floor(admin.passwordChangedAt.getTime() / 1000);
      if (payload.iat < changedAtSeconds) {
        throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.');
      }
    }

    req.admin = admin;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function publicAdmin(admin) {
  return {
    id: String(admin._id),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    lastLoginAt: admin.lastLoginAt
  };
}
