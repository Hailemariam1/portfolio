import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
export const serverRoot = path.resolve(here, '../..');

dotenv.config({ path: path.join(serverRoot, '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const bool = (value) => String(value || '').toLowerCase() === 'true';
const num = (value, fallback) => (Number.isFinite(Number(value)) && value !== '' ? Number(value) : fallback);

// Ignore an empty, zero or out-of-range PORT (some shells export PORT=0),
// otherwise Express would bind to a random ephemeral port.
const portNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : fallback;
};

// Browsers never send a trailing slash in the Origin header, but deployed
// environment values often include one. Normalise before comparing.
const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');

const configuredClientUrls = [process.env.CLIENT_URL, ...(process.env.CLIENT_URLS || '').split(',')]
  .map(normalizeOrigin)
  .filter(Boolean);

const clientUrl = configuredClientUrls[0] || 'http://localhost:5173';
const clientUrls = [...new Set([clientUrl, ...configuredClientUrls])];

if (!isProd) {
  for (const local of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
    if (!clientUrls.includes(local)) clientUrls.push(local);
  }
}

export const env = {
  nodeEnv,
  isProd,
  port: portNumber(process.env.PORT, 5000),
  clientUrl,
  clientUrls,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio',

  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'portfolio_admin_token',

  admin: {
    name: process.env.ADMIN_NAME || 'Administrator',
    email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || ''
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'portfolio'
  },

  mail: {
    host: process.env.SMTP_HOST || '',
    port: num(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Portfolio <no-reply@example.com>',
    to: process.env.CONTACT_NOTIFY_EMAIL || ''
  },

  uploads: {
    dir: path.join(serverRoot, 'uploads'),
    publicPath: '/uploads'
  }
};

env.cloudinary.enabled = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);

if (isProd) {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
  if (!process.env.CLIENT_URL && !process.env.CLIENT_URLS) missing.push('CLIENT_URL');
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
  if (env.clientUrls.some((url) => !/^https:\/\//i.test(url))) {
    throw new Error('CLIENT_URL and CLIENT_URLS must use HTTPS in production.');
  }
}
if (!env.jwtSecret) {
  env.jwtSecret = 'insecure-development-secret-do-not-use-in-production';
  console.warn('[config] JWT_SECRET is not set — using an insecure development secret.');
}
if (isProd && !env.cloudinary.enabled) {
  console.warn('[config] Cloudinary is not configured — uploads will be stored on local disk.');
}

export default env;
