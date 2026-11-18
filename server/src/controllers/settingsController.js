import Settings from '../models/Settings.js';
import { asyncHandler, ApiError } from '../utils/http.js';
import { sendTestContactNotification } from '../utils/mailer.js';

/** GET /api/settings — public site content. */
export const getPublic = asyncHandler(async (_req, res) => {
  const settings = await Settings.getSite();
  const payload = settings.toJSON();
  if (!payload.home) payload.home = {};
  res.json({ settings: payload });
});

/** PUT /api/admin/settings */
export const update = asyncHandler(async (req, res) => {
  const settings = await Settings.getSite();

  Object.entries(req.body).forEach(([key, value]) => {
    if (value === undefined || key === 'key' || key === '_id') return;
    if (key === 'home') {
      settings.home = value;
      settings.markModified('home');
    } else {
      settings.set(key, value);
    }
  });

  await settings.save();
  res.json({ settings });
});

/** POST /api/admin/settings/test-email */
export const testEmail = asyncHandler(async (_req, res) => {
  const settings = await Settings.getSite();
  const result = await sendTestContactNotification({ settings });
  if (!result.sent) throw ApiError.badRequest(result.error);
  res.json({ success: true, recipient: result.recipient });
});
