import Settings from '../models/Settings.js';
import { asyncHandler } from '../utils/http.js';

/** GET /api/settings — public site content. */
export const getPublic = asyncHandler(async (_req, res) => {
  const settings = await Settings.getSite();
  res.json({ settings });
});

/** PUT /api/admin/settings */
export const update = asyncHandler(async (req, res) => {
  const settings = await Settings.getSite();

  Object.entries(req.body).forEach(([key, value]) => {
    if (value === undefined || key === 'key' || key === '_id') return;
    settings.set(key, value);
  });

  await settings.save();
  res.json({ settings });
});
