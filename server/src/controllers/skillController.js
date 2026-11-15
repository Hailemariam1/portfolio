import Skill from '../models/Skill.js';
import { SKILL_CATEGORIES } from '../models/Skill.js';
import { ApiError, asyncHandler } from '../utils/http.js';

const sortByDisplay = { category: 1, order: 1, name: 1 };

/** GET /api/skills */
export const list = asyncHandler(async (_req, res) => {
  const skills = await Skill.find().sort(sortByDisplay);
  res.json({
    items: skills,
    categories: SKILL_CATEGORIES,
    grouped: SKILL_CATEGORIES.map((category) => ({
      category,
      skills: skills.filter((skill) => skill.category === category)
    })).filter((group) => group.skills.length > 0)
  });
});

/** POST /api/admin/skills */
export const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.order) {
    const highest = await Skill.findOne({ category: data.category }).sort({ order: -1 }).select('order');
    data.order = highest ? highest.order + 1 : 0;
  }
  const skill = await Skill.create(data);
  res.status(201).json({ skill });
});

/** PUT /api/admin/skills/:id */
export const update = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!skill) throw ApiError.notFound('Skill not found.');
  res.json({ skill });
});

/** DELETE /api/admin/skills/:id */
export const remove = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);
  if (!skill) throw ApiError.notFound('Skill not found.');
  res.json({ success: true, id: req.params.id });
});
