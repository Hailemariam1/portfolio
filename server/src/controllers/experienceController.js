import Experience, { EXPERIENCE_TYPES } from '../models/Experience.js';
import { ApiError, asyncHandler } from '../utils/http.js';

const sortByDisplay = { order: 1, startDate: -1 };

/** GET /api/experience */
export const list = asyncHandler(async (_req, res) => {
  const items = await Experience.find().sort(sortByDisplay);
  res.json({
    items,
    types: EXPERIENCE_TYPES,
    grouped: EXPERIENCE_TYPES.map((type) => ({
      type,
      entries: items.filter((entry) => entry.type === type)
    })).filter((group) => group.entries.length > 0)
  });
});

/** POST /api/admin/experience */
export const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.order) {
    const highest = await Experience.findOne().sort({ order: -1 }).select('order');
    data.order = highest ? highest.order + 1 : 0;
  }
  const entry = await Experience.create(data);
  res.status(201).json({ entry });
});

/** PUT /api/admin/experience/:id */
export const update = asyncHandler(async (req, res) => {
  const entry = await Experience.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!entry) throw ApiError.notFound('Entry not found.');
  res.json({ entry });
});

/** DELETE /api/admin/experience/:id */
export const remove = asyncHandler(async (req, res) => {
  const entry = await Experience.findByIdAndDelete(req.params.id);
  if (!entry) throw ApiError.notFound('Entry not found.');
  res.json({ success: true, id: req.params.id });
});
