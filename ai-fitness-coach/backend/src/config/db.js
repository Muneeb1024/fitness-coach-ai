import crypto from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const ADMIN_EMAIL = 'admin@fitvision.ai';

function generateStrongPassword() {
  return crypto.randomBytes(12).toString('base64url'); // 16 chars, high entropy
}

/**
 * Idempotent admin bootstrap.
 *
 * Security model:
 *  - Runs ONLY when ADMIN_BOOTSTRAP === 'true' (explicit opt-in). Recommended
 *    for local development or the very first deploy — never on every boot.
 *  - Creates admin@fitvision.ai ONCE if it does not exist, with a strong
 *    randomly generated password (or ADMIN_PASSWORD if the operator set one).
 *  - NEVER resets or touches an existing admin account on boot.
 */
async function bootstrapAdmin() {
  const enabled = process.env.ADMIN_BOOTSTRAP === 'true';
  if (!enabled) return;

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    console.log(`[MongoDB] ${ADMIN_EMAIL} already exists — bootstrap skipped (existing password was NOT changed).`);
    return;
  }

  const password = process.env.ADMIN_PASSWORD || generateStrongPassword();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  await User.create({
    name: 'System Administrator',
    email: ADMIN_EMAIL,
    password: hash,
    role: 'admin',
    status: 'active',
    fitnessScore: 100,
    streakCount: 0
  });

  console.log('\x1b[32m[MongoDB]\x1b[0m Created admin account ' + ADMIN_EMAIL);
  console.log('\x1b[33m[MongoDB]\x1b[0m   Initial password: ' + password + '  (shown once — change it after first login)');
}

let connectPromise = null;

export const connectDB = () => {
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`\x1b[32m[MongoDB]\x1b[0m Connected successfully: ${conn.connection.host}`);

      await bootstrapAdmin();
    } catch (error) {
      connectPromise = null; // allow a later retry to re-attempt the connection
      console.warn(`\n\x1b[33m[MongoDB Warning]\x1b[0m ${error.message}`);
      console.warn(`👉 Running with in-memory fallback store for local development.\n`);
    }
  })();

  return connectPromise;
};
