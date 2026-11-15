import Post from '../models/Post.js';
import { destroyCloudinaryAsset } from '../config/cloudinary.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { escapeRegex, paginationMeta, parsePagination } from '../utils/pagination.js';
import { ensureUniqueSlug } from '../utils/slug.js';

const LIST_FIELDS = 'title slug excerpt category coverImage status publishedAt createdAt updatedAt content';

function shapeListItem(post) {
  const json = post.toJSON({ virtuals: true });
  return {
    id: json.id,
    title: json.title,
    slug: json.slug,
    excerpt: json.excerpt,
    category: json.category,
    coverImage: json.coverImage,
    status: json.status,
    publishedAt: json.publishedAt,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    readingMinutes: post.readingMinutes
  };
}

function searchFilter(q) {
  if (!q) return null;
  const rx = new RegExp(escapeRegex(q), 'i');
  return { $or: [{ title: rx }, { excerpt: rx }, { category: rx }, { content: rx }] };
}

/** GET /api/blog — published posts only. */
export const listPublic = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 7 });
  const filter = { status: 'published' };
  if (req.query.category) filter.category = req.query.category;
  Object.assign(filter, searchFilter(req.query.q) || {});

  const [posts, total] = await Promise.all([
    Post.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(filter)
  ]);

  res.json({
    items: posts.map(shapeListItem),
    pagination: paginationMeta({ page, limit, total })
  });
});

/** GET /api/blog/categories */
export const publicCategories = asyncHandler(async (_req, res) => {
  const categories = await Post.distinct('category', { status: 'published' });
  res.json({ categories: categories.filter(Boolean).sort() });
});

/** GET /api/blog/:slug */
export const getPublicOne = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, status: 'published' });
  if (!post) throw ApiError.notFound('That article does not exist or is not published.');
  res.json({ post: { ...shapeListItem(post), content: post.content } });
});

/** GET /api/admin/blog */
export const listAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  Object.assign(filter, searchFilter(req.query.q) || {});

  const [posts, total] = await Promise.all([
    Post.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(filter)
  ]);

  res.json({
    items: posts.map(shapeListItem),
    pagination: paginationMeta({ page, limit, total })
  });
});

/** GET /api/admin/blog/:id */
export const getAdminOne = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Article not found.');
  res.json({ post: { ...shapeListItem(post), content: post.content } });
});

function resolvePublishedAt(status, publishedAt) {
  if (status === 'published') return publishedAt ? new Date(publishedAt) : new Date();
  if (publishedAt) return new Date(publishedAt);
  return null;
}

/** POST /api/admin/blog */
export const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.slug = await ensureUniqueSlug(Post, data.slug || data.title);
  data.publishedAt = resolvePublishedAt(data.status, data.publishedAt);

  const post = await Post.create(data);
  res.status(201).json({ post: { ...shapeListItem(post), content: post.content } });
});

/** PUT /api/admin/blog/:id */
export const update = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Article not found.');

  const data = { ...req.body };
  if (data.slug !== undefined || data.title !== undefined) {
    data.slug = await ensureUniqueSlug(Post, data.slug || data.title || post.title, {
      excludeId: post._id
    });
  }
  if (data.status !== undefined || data.publishedAt !== undefined) {
    data.publishedAt = resolvePublishedAt(data.status ?? post.status, data.publishedAt ?? post.publishedAt);
  }

  Object.assign(post, data);
  await post.save();
  res.json({ post: { ...shapeListItem(post), content: post.content } });
});

/** DELETE /api/admin/blog/:id */
export const remove = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) throw ApiError.notFound('Article not found.');
  await destroyCloudinaryAsset(post.coverImage?.publicId);
  res.json({ success: true, id: req.params.id });
});
