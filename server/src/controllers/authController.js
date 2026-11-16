import Admin from '../models/Admin.js';
import env from '../config/env.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { publicAdmin } from '../middleware/auth.js';
import { adminCookieOptions, clearAdminCookieOptions, signAdminToken } from '../utils/tokens.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

/** POST /api/admin/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+passwordHash');

  // Same generic message for unknown email and wrong password: no account
  // enumeration through error text.
  if (!admin) throw ApiError.unauthorized('Invalid email or password.');

  if (admin.isLocked()) {
    const minutes = Math.ceil((admin.lockUntil.getTime() - Date.now()) / 60000);
    throw new ApiError(
      423,
      `Too many failed sign-in attempts. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`
    );
  }

  const valid = await admin.verifyPassword(password);
  if (!valid) {
    admin.failedLoginAttempts += 1;
    if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      admin.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      admin.failedLoginAttempts = 0;
    }
    await admin.save();
    throw ApiError.unauthorized('Invalid email or password.');
  }

  admin.failedLoginAttempts = 0;
  admin.lockUntil = null;
  admin.lastLoginAt = new Date();
  await admin.save();

  const token = signAdminToken(admin);
  res.cookie(env.cookieName, token, adminCookieOptions());
  res.json({ admin: publicAdmin(admin) });
});

/** POST /api/admin/logout */
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.cookieName, clearAdminCookieOptions());
  res.json({ success: true });
});

/** GET /api/admin/me */
export const me = asyncHandler(async (req, res) => {
  res.json({ admin: publicAdmin(req.admin) });
});
