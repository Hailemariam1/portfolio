import mongoose from 'mongoose';
import { applyApiTransforms, mediaSchemaDefinition } from './plugins.js';

export const PROJECT_CATEGORIES = ['academic', 'personal', 'collaborative', 'freelance'];
export const PROJECT_STATUSES = ['draft', 'published'];

const mediaSchema = new mongoose.Schema(mediaSchemaDefinition, { _id: false });

const challengeSchema = new mongoose.Schema(
  {
    problem: { type: String, required: true, trim: true },
    approach: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 320 },
    overview: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    problem: { type: String, default: '', trim: true },
    category: { type: String, enum: PROJECT_CATEGORIES, required: true },
    technologies: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    features: { type: [String], default: [] },
    challenges: { type: [challengeSchema], default: [] },
    thumbnail: { type: mediaSchema, default: undefined },
    images: { type: [mediaSchema], default: [] },
    githubUrl: { type: String, default: '', trim: true },
    liveUrl: { type: String, default: '', trim: true },
    status: { type: String, enum: PROJECT_STATUSES, default: 'draft', index: true },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

applyApiTransforms(projectSchema);

projectSchema.index({ status: 1, featured: -1, publishedAt: -1 });
projectSchema.index({ title: 'text', shortDescription: 'text', technologies: 'text' });

export default mongoose.model('Project', projectSchema);
