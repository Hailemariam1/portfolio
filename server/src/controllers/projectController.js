import Project from '../models/Project.js';
import { destroyCloudinaryAsset } from '../config/cloudinary.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { escapeRegex, paginationMeta, parsePagination } from '../utils/pagination.js';
import { ensureUniqueSlug } from '../utils/slug.js';

const LIST_FIELDS =
  'title slug shortDescription category technologies thumbnail githubUrl liveUrl featured status publishedAt createdAt updatedAt';

function searchFilter(q) {
  if (!q) return null;
  const rx = new RegExp(escapeRegex(q), 'i');
  return { $or: [{ title: rx }, { shortDescription: rx }, { technologies: rx }, { overview: rx }] };
}

const sortFor = (sort) => {
  if (sort === 'oldest') return { publishedAt: 1, createdAt: 1 };
  if (sort === 'title') return { title: 1 };
  return { featured: -1, publishedAt: -1, createdAt: -1 };
};

/** GET /api/projects — published projects only. */
export const listPublic = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 9 });
  const filter = { status: 'published' };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured === 'true') filter.featured = true;
  Object.assign(filter, searchFilter(req.query.q) || {});

  const [items, total] = await Promise.all([
    Project.find(filter)
      .select(LIST_FIELDS)
      .sort(sortFor(req.query.sort))
      .skip(skip)
      .limit(limit),
    Project.countDocuments(filter)
  ]);

  res.json({ items, pagination: paginationMeta({ page, limit, total }) });
});

/** GET /api/projects/:slug */
export const getPublicOne = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, status: 'published' });
  if (!project) throw ApiError.notFound('That project does not exist or is not published.');
  res.json({ project });
});

/** GET /api/admin/projects — drafts included. */
export const listAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  Object.assign(filter, searchFilter(req.query.q) || {});

  const [items, total] = await Promise.all([
    Project.find(filter)
      .select(LIST_FIELDS)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Project.countDocuments(filter)
  ]);

  res.json({ items, pagination: paginationMeta({ page, limit, total }) });
});

/** GET /api/admin/projects/:id */
export const getAdminOne = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found.');
  res.json({ project });
});

/** POST /api/admin/projects */
export const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.slug = await ensureUniqueSlug(Project, data.slug || data.title);
  data.publishedAt = data.status === 'published' ? new Date() : null;

  const project = await Project.create(data);
  res.status(201).json({ project });
});

/** PUT /api/admin/projects/:id */
export const update = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found.');

  const data = { ...req.body };
  if (data.slug !== undefined || data.title !== undefined) {
    data.slug = await ensureUniqueSlug(Project, data.slug || data.title || project.title, {
      excludeId: project._id
    });
  }
  if (data.status === 'published' && !project.publishedAt) data.publishedAt = new Date();

  Object.assign(project, data);
  await project.save();
  res.json({ project });
});

/** PATCH /api/admin/projects/:id — publish, unpublish or feature. */
export const patch = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found.');

  if (req.body.status) {
    project.status = req.body.status;
    if (req.body.status === 'published' && !project.publishedAt) project.publishedAt = new Date();
  }
  if (typeof req.body.featured === 'boolean') project.featured = req.body.featured;

  await project.save();
  res.json({ project });
});

/** DELETE /api/admin/projects/:id */
export const remove = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw ApiError.notFound('Project not found.');

  await Promise.all([
    destroyCloudinaryAsset(project.thumbnail?.publicId),
    ...project.images.map((image) => destroyCloudinaryAsset(image.publicId))
  ]);

  res.json({ success: true, id: req.params.id });
});
