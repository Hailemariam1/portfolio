import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env, { serverRoot } from './config/env.js';
import { csrfToken } from './middleware/csrf.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/error.js';
import { ApiError } from './utils/http.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(
  cors({
    origin: [env.clientUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(csrfToken);

if (!env.isProd) app.use(morgan('dev'));

// Locally stored uploads (only used when Cloudinary is not configured).
fs.mkdirSync(env.uploads.dir, { recursive: true });
app.use(env.uploads.publicPath, express.static(env.uploads.dir, { maxAge: '1h', fallthrough: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()), env: env.nodeEnv });
});

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Unknown API routes never fall through to the SPA shell.
app.use('/api', (req, _res, next) =>
  next(ApiError.notFound(`No API route matches ${req.method} ${req.originalUrl}`))
);

// Serve the built React app in production (single-origin deployment).
const clientDist = path.resolve(serverRoot, '../client/dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith(env.uploads.publicPath)) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
