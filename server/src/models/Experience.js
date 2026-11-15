import mongoose from 'mongoose';
import { applyApiTransforms } from './plugins.js';

export const EXPERIENCE_TYPES = [
  'education',
  'internship',
  'freelance',
  'collaboration',
  'volunteer',
  'certification'
];

const experienceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: EXPERIENCE_TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    organization: { type: String, default: '', trim: true, maxlength: 160 },
    location: { type: String, default: '', trim: true, maxlength: 120 },
    startDate: { type: String, default: '', trim: true, maxlength: 40 },
    endDate: { type: String, default: '', trim: true, maxlength: 40 },
    current: { type: Boolean, default: false },
    description: { type: String, default: '', trim: true },
    highlights: { type: [String], default: [] },
    link: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

applyApiTransforms(experienceSchema);

experienceSchema.index({ order: 1, startDate: -1 });

export default mongoose.model('Experience', experienceSchema);
