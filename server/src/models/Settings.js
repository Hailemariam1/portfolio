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

const capabilitySchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },
    body: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const focusRowSchema = new mongoose.Schema(
  {
    label: { type: String, default: '', trim: true },
    text: { type: String, default: '', trim: true }
  },
  { _id: false }
);

/** Landing-page copy, editable from /admin/settings. */
const homeSchema = new mongoose.Schema(
  {
    heroNote: {
      type: String,
      default: 'Early career · open to junior full-stack roles',
      trim: true
    },
    capabilitiesEyebrow: { type: String, default: 'What I can build', trim: true },
    capabilitiesTitle: {
      type: String,
      default: 'Tools and evidence, not a list of languages.',
      trim: true
    },
    capabilitiesIntro: {
      type: String,
      default:
        'These are the things I can take from an idea to a working deployment. Every one of them appears in a project case study below.',
      trim: true
    },
    capabilities: {
      type: [capabilitySchema],
      default: () => [
        {
          title: 'Applications with real accounts',
          body: 'Sign-in, protected routes and role checks, with hashed passwords and JWT sessions stored in httpOnly cookies.'
        },
        {
          title: 'APIs that hold up',
          body: 'Express endpoints with server-side validation, pagination, filtering and error responses a frontend can act on.'
        },
        {
          title: 'Data models that fit the product',
          body: 'MongoDB schemas with relationships and indexes chosen around the queries the app actually runs.'
        },
        {
          title: 'Shipped, not just local',
          body: 'Deployments to Render and Vercel, environment configuration, Cloudinary uploads and email notifications.'
        }
      ]
    },
    workEyebrow: { type: String, default: 'Selected work', trim: true },
    workTitle: { type: String, default: 'Case studies, not screenshots.', trim: true },
    workIntro: {
      type: String,
      default:
        'Each project explains the problem, what I personally built, and what went wrong along the way. Projects are labelled academic, personal, collaborative or freelance.',
      trim: true
    },
    skillsEyebrow: { type: String, default: 'Skills', trim: true },
    skillsTitle: { type: String, default: 'Grouped by where they sit in the stack.', trim: true },
    skillsIntro: {
      type: String,
      default:
        'Nothing here is a logo I have not used in a project. Categories, notes and ordering are managed from the dashboard.',
      trim: true
    },
    writingEyebrow: { type: String, default: 'Writing', trim: true },
    writingTitle: { type: String, default: 'Notes from building things.', trim: true },
    writingIntro: {
      type: String,
      default: 'Short, specific write-ups about problems I hit and how I solved them.',
      trim: true
    },
    ctaEyebrow: { type: String, default: 'Next step', trim: true },
    ctaTitle: {
      type: String,
      default: 'Looking for a junior developer who finishes what they start?',
      trim: true
    },
    ctaBody: {
      type: String,
      default:
        "I'm available for junior full-stack roles and small freelance builds. If you want to talk about a role, a project or a problem, send me a message — I reply within a day or two.",
      trim: true
    },
    focusTitle: { type: String, default: 'Where I work', trim: true },
    focusRows: {
      type: [focusRowSchema],
      default: () => [
        { label: 'Frontend', text: 'React, responsive layouts, accessible forms' },
        { label: 'Backend', text: 'Express REST APIs, JWT sessions, validation' },
        { label: 'Data', text: 'MongoDB schemas, indexes, aggregation' }
      ]
    },
    focusNote: {
      type: String,
      default:
        'Finishing a Computer Science degree while building full-stack projects and writing about what I learn.',
      trim: true
    }
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
    },
    home: { type: homeSchema, default: () => ({}) }
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
