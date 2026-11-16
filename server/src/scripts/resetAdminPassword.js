import mongoose from 'mongoose';
import env from '../config/env.js';
import Admin from '../models/Admin.js';

const MIN_LENGTH = 10;

/**
 * Sync the administrator password with ADMIN_PASSWORD from server/.env and
 * clear any lockout. Use this when the stored password is unknown or after
 * changing ADMIN_PASSWORD in the environment.
 */
async function run() {
  const { email, password } = env.admin;

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.');
  }
  if (password.length < MIN_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_LENGTH} characters long.`);
  }

  await mongoose.connect(env.mongoUri);

  const admin = await Admin.findOne({ email }).select('+passwordHash');
  if (!admin) {
    throw new Error(
      `No administrator exists for ${email}. Run "npm run seed" to create the account.`
    );
  }

  await admin.setPassword(password);
  admin.failedLoginAttempts = 0;
  admin.lockUntil = null;
  await admin.save();

  console.log(`[admin] password updated for ${admin.email}.`);
  console.log('[admin] failed sign-in attempts cleared and lock removed.');
  console.log('[admin] sign in with ADMIN_EMAIL and ADMIN_PASSWORD from server/.env.');
}

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('[admin] failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
