import mongoose from 'mongoose';
import { applyApiTransforms, mediaSchemaDefinition } from './plugins.js';

export const POST_STATUSES = ['draft', 'published'];

const coverSchema = new mongoose.Schema(mediaSchemaDefinition, { _id: false });

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: '', trim: true, maxlength: 400 },
    content: { type: String, default: '' },
    category: { type: String, default: 'Notes', trim: true, maxlength: 60 },
    coverImage: { type: coverSchema, default: undefined },
    status: { type: String, enum: POST_STATUSES, default: 'draft', index: true },
    publishedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

applyApiTransforms(postSchema);

postSchema.index({ status: 1, publishedAt: -1 });

postSchema.virtual('readingMinutes').get(function readingMinutes() {
  const words = String(this.content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
});

export default mongoose.model('Post', postSchema);
