import { z } from 'zod';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '../models/Project.js';
import { SKILL_CATEGORIES } from '../models/Skill.js';
import { EXPERIENCE_TYPES } from '../models/Experience.js';
import { POST_STATUSES } from '../models/Post.js';
import { MESSAGE_STATUSES } from '../models/Message.js';

const httpLink = () =>
  z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) => !value || /^https?:\/\/[^\s]+$/i.test(value),
      'Enter a full URL starting with http:// or https://'
    )
    .optional()
    .default('');

const mediaUrl = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine(
    (value) => /^https?:\/\/[^\s]+$/i.test(value) || value.startsWith('/uploads/'),
    'Upload a valid image or file first.'
  );

const stringList = (maxItems, maxLength) =>
  z
    .array(z.string().trim().max(maxLength))
    .max(maxItems)
    .default([])
    .transform((values) => values.map((value) => value.trim()).filter(Boolean));

const pagination = {
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  q: z.string().trim().max(120).optional()
};

export const mediaSchema = z.object({
  url: mediaUrl,
  publicId: z.string().trim().max(300).optional().default(''),
  alt: z.string().trim().max(200).optional().default('')
});

export const idParam = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier.')
});

export const slugParam = z.object({
  slug: z.string().trim().min(1).max(160)
});

/* ------------------------------------------------------------------ auth -- */

export const loginPayload = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.').max(200)
});

/* -------------------------------------------------------------- projects -- */

export const projectPayload = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(140),
  slug: z.string().trim().max(160).optional().default(''),
  shortDescription: z
    .string()
    .trim()
    .min(20, 'Write at least one short sentence (20 characters).')
    .max(320),
  overview: z.string().trim().max(2000).optional().default(''),
  description: z.string().max(30000).optional().default(''),
  problem: z.string().trim().max(3000).optional().default(''),
  category: z.enum(PROJECT_CATEGORIES, { required_error: 'Choose a project category.' }),
  technologies: stringList(40, 60),
  responsibilities: stringList(30, 500),
  features: stringList(30, 500),
  challenges: z
    .array(
      z.object({
        problem: z.string().trim().min(1, 'Describe the challenge.').max(600),
        approach: z.string().trim().min(1, 'Describe how you approached it.').max(1500)
      })
    )
    .max(20)
    .default([]),
  thumbnail: mediaSchema.nullable().optional(),
  images: z.array(mediaSchema).max(12).default([]),
  githubUrl: httpLink(),
  liveUrl: httpLink(),
  status: z.enum(PROJECT_STATUSES).default('draft'),
  featured: z.boolean().default(false)
});

export const projectUpdatePayload = projectPayload.partial().extend({
  status: z.enum(PROJECT_STATUSES).optional(),
  featured: z.boolean().optional()
});

export const projectListQuery = z.object({
  ...pagination,
  category: z.enum(PROJECT_CATEGORIES).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  featured: z.enum(['true', 'false']).optional(),
  sort: z.enum(['newest', 'oldest', 'title']).optional()
});

export const projectStatusPayload = z.object({
  status: z.enum(PROJECT_STATUSES).optional(),
  featured: z.boolean().optional()
});

/* ---------------------------------------------------------------- skills -- */

export const skillPayload = z.object({
  name: z.string().trim().min(1, 'Enter a skill name.').max(80),
  category: z.enum(SKILL_CATEGORIES),
  note: z.string().trim().max(160).optional().default(''),
  order: z.coerce.number().int().min(0).max(9999).optional().default(0)
});

export const skillUpdatePayload = skillPayload.partial();

/* ------------------------------------------------------------ experience -- */

export const experiencePayload = z.object({
  type: z.enum(EXPERIENCE_TYPES),
  title: z.string().trim().min(2, 'Enter a title.').max(160),
  organization: z.string().trim().max(160).optional().default(''),
  location: z.string().trim().max(120).optional().default(''),
  startDate: z.string().trim().max(40).optional().default(''),
  endDate: z.string().trim().max(40).optional().default(''),
  current: z.boolean().optional().default(false),
  description: z.string().trim().max(3000).optional().default(''),
  highlights: stringList(12, 400),
  link: httpLink(),
  order: z.coerce.number().int().min(0).max(9999).optional().default(0)
});

export const experienceUpdatePayload = experiencePayload.partial();

/* ------------------------------------------------------------------ blog -- */

export const postPayload = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(180),
  slug: z.string().trim().max(180).optional().default(''),
  excerpt: z.string().trim().max(400).optional().default(''),
  content: z.string().max(120000).optional().default(''),
  category: z.string().trim().max(60).optional().default('Notes'),
  coverImage: mediaSchema.nullable().optional(),
  status: z.enum(POST_STATUSES).default('draft'),
  publishedAt: z.union([z.string().trim().max(40), z.null()]).optional()
});

export const postUpdatePayload = postPayload.partial();

export const postListQuery = z.object({
  ...pagination,
  category: z.string().trim().max(60).optional(),
  status: z.enum(POST_STATUSES).optional()
});

/* --------------------------------------------------------------- contact -- */

export const contactPayload = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  subject: z.string().trim().max(200).optional().default(''),
  message: z
    .string()
    .trim()
    .min(20, 'Please write at least a couple of sentences (20 characters).')
    .max(5000),
  website: z.string().max(200).optional().default('')
});

export const messageListQuery = z.object({
  ...pagination,
  status: z.enum(MESSAGE_STATUSES).optional()
});

export const messageUpdatePayload = z.object({
  status: z.enum(MESSAGE_STATUSES)
});

/* -------------------------------------------------------------- settings -- */

export const settingsPayload = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: z.string().trim().max(160).optional(),
  headline: z.string().trim().max(240).optional(),
  intro: z.string().trim().max(1200).optional(),
  about: z.string().trim().max(8000).optional(),
  location: z.string().trim().max(120).optional(),
  profilePhoto: mediaSchema.nullable().optional(),
  email: z.union([z.string().trim().toLowerCase().email(), z.literal('')]).optional(),
  githubUrl: httpLink().optional(),
  linkedinUrl: httpLink().optional(),
  resume: z
    .object({
      url: mediaUrl,
      publicId: z.string().trim().max(300).optional().default(''),
      fileName: z.string().trim().max(200).optional().default('')
    })
    .nullable()
    .optional(),
  availabilityStatus: z.boolean().optional(),
  availabilityNote: z.string().trim().max(200).optional(),
  footerText: z.string().trim().max(300).optional()
});

export const uploadKindPayload = z.object({
  kind: z.enum(['image', 'resume']).optional().default('image')
});
