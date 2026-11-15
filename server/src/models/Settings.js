import mongoose from 'mongoose';
import { applyApiTransforms, mediaSchemaDefinition } from './plugins.js';

const photoSchema = new mongoose.Schema(mediaSchemaDefinition, { _id: false });
const fileSchema = new mongoose.Schema(
  {
    url: { type: String, default: '', trim: true },
    publicId: { type: String, default: '', trim: true },
    fileName: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    name: { type: String, default: 'Hailemariam', trim: true },
    role: {
      type: String,
      default: 'Junior Full-Stack Web Developer | React, Node.js & MongoDB',
      trim: true
    },
    headline: {
      type: String,
      default: "Hi, I'm Hailemariam. I build web applications that solve real problems.",
      trim: true
    },
    intro: {
      type: String,
      default:
        "I'm a junior full-stack web developer with a background in Computer Science. I enjoy working across the frontend and backend, building practical applications, and turning ideas into functional digital products.",
      trim: true
    },
    about: { type: String, default: '' },
    location: { type: String, default: 'Addis Ababa, Ethiopia', trim: true },
    profilePhoto: { type: photoSchema, default: undefined },
    email: { type: String, default: '', trim: true, lowercase: true },
    githubUrl: { type: String, default: '', trim: true },
    linkedinUrl: { type: String, default: '', trim: true },
    resume: { type: fileSchema, default: undefined },
    availabilityStatus: { type: Boolean, default: true },
    availabilityNote: {
      type: String,
      default: 'Open to junior full-stack roles and freelance projects',
      trim: true
    },
    footerText: {
      type: String,
      default: 'Built and maintained by Hailemariam — React, Node.js and MongoDB.',
      trim: true
    }
  },
  { timestamps: true }
);

applyApiTransforms(settingsSchema);

settingsSchema.statics.getSite = async function getSite() {
  let doc = await this.findOne({ key: 'site' });
  if (!doc) doc = await this.create({ key: 'site' });
  return doc;
};

export default mongoose.model('Settings', settingsSchema);
