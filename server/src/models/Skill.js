import mongoose from 'mongoose';
import { applyApiTransforms } from './plugins.js';

export const SKILL_CATEGORIES = ['Frontend', 'Backend', 'Database', 'Tools & Deployment', 'Foundations'];

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, enum: SKILL_CATEGORIES, default: 'Frontend', index: true },
    note: { type: String, default: '', trim: true, maxlength: 160 },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

applyApiTransforms(skillSchema);

skillSchema.index({ category: 1, order: 1 });

export default mongoose.model('Skill', skillSchema);
