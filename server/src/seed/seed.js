import Admin from '../models/Admin.js';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Post from '../models/Post.js';
import Settings from '../models/Settings.js';
import env from '../config/env.js';
import { connectDb, disconnectDb } from '../config/db.js';
import { projects, skills, experience, posts, settings } from './sampleData.js';

const reset = process.argv.includes('--reset');
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function seedAdmin() {
  if (!env.admin.email || !env.admin.password) {
    throw new Error(
      'Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before running the seed script.'
    );
  }
  if (env.admin.password.length < 10) {
    throw new Error('ADMIN_PASSWORD must be at least 10 characters long.');
  }

  const existing = await Admin.findOne({ email: env.admin.email }).select('+passwordHash');

  if (existing && !reset) {
    console.log(`[seed] administrator ${env.admin.email} already exists — password unchanged.`);
    return;
  }

  const admin = existing || new Admin({ email: env.admin.email });
  admin.name = env.admin.name;
  admin.role = 'admin';
  await admin.setPassword(env.admin.password);
  await admin.save();
  console.log(`[seed] ${existing ? 'updated' : 'created'} administrator ${env.admin.email}`);
}

async function seedSettings() {
  const existing = await Settings.findOne({ key: 'site' });
  if (existing && !reset) {
    console.log('[seed] site settings already exist — left untouched.');
    return;
  }
  await Settings.findOneAndUpdate({ key: 'site' }, settings, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  });
  console.log('[seed] site settings ready.');
}

async function seedContent() {
  const projectCount = await Project.countDocuments();

  if (projectCount > 0 && !reset) {
    console.log('[seed] content already present — skipping sample projects, skills and posts.');
    console.log('[seed] run `npm run seed:reset` to replace them with the sample set.');
    return;
  }

  if (reset) {
    await Promise.all([
      Project.deleteMany({}),
      Skill.deleteMany({}),
      Experience.deleteMany({}),
      Post.deleteMany({})
    ]);
    console.log('[seed] cleared existing projects, skills, experience and posts.');
  }

  const projectDocs = projects.map(({ publishedDaysAgo, ...project }) => ({
    ...project,
    publishedAt: project.status === 'published' ? daysAgo(publishedDaysAgo ?? 0) : null
  }));
  await Project.insertMany(projectDocs);
  console.log(`[seed] inserted ${projectDocs.length} projects.`);

  await Skill.insertMany(skills);
  console.log(`[seed] inserted ${skills.length} skills.`);

  await Experience.insertMany(experience);
  console.log(`[seed] inserted ${experience.length} experience entries.`);

  const postDocs = posts.map(({ publishedDaysAgo, published, ...post }) => ({
    ...post,
    publishedAt: post.status === 'published' ? daysAgo(publishedDaysAgo ?? 0) : null
  }));
  await Post.insertMany(postDocs);
  console.log(`[seed] inserted ${postDocs.length} blog posts.`);
}

async function run() {
  console.log(`[seed] connecting to MongoDB (${env.nodeEnv})`);
  await connectDb();
  await seedAdmin();
  await seedSettings();
  await seedContent();
  await disconnectDb();
  console.log('[seed] done. Sign in at /admin with the credentials from server/.env.');
}

run().catch(async (error) => {
  console.error('[seed] failed:', error.message);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
