import app from './app.js';
import env from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';

async function start() {
  await connectDb();

  const server = app.listen(env.port, () => {
    console.log(`[api] listening on http://localhost:${env.port} (${env.nodeEnv})`);
    if (env.isProd) console.log(`[api] public site: ${env.clientUrl}`);
    else console.log('[api] admin dashboard: http://localhost:5173/admin');
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[api] port ${env.port} is already in use. Set PORT in server/.env.`);
    } else {
      console.error('[api] server error:', error);
    }
    process.exit(1);
  });

  const shutdown = async (signal) => {
    console.log(`[api] ${signal} received — closing server`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 8000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('[api] failed to start:', error.message);
  console.error('[api] is MongoDB running? Check MONGO_URI in server/.env.');
  process.exit(1);
});
