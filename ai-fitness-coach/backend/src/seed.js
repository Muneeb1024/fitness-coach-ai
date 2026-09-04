/**
 * 🌱 FitVision AI — Database Seed Script
 * Run once to create the admin & demo user accounts.
 *
 * Usage:
 *   node src/seed.js
 *
 * Env vars:
 *   MONGO_URI            — Required. Your MongoDB connection string.
 *   ADMIN_PASSWORD       — Optional. Password for admin@fitvision.ai.
 *                          If omitted, a strong random password is generated
 *                          and printed to the console ONCE.
 *   DEMO_USER_PASSWORD   — Optional. Password for the demo user@fitvision.ai.
 *                          If omitted, a random password is printed once.
 *   JWT_SECRET           — (optional, only needed if you test tokens)
 *
 * Security: the script never prints or stores a fixed password, and it never
 * overwrites an existing account's password — it only creates missing ones.
 */

import crypto from 'node:crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

function generatePassword() {
  return crypto.randomBytes(9).toString('base64url'); // 12 chars
}

/** @param {{ passwordEnv?: string, email: string, role: string }} def */
function resolvePassword(def) {
  if (def.passwordEnv && process.env[def.passwordEnv]) {
    return { password: process.env[def.passwordEnv], generated: false };
  }
  return { password: generatePassword(), generated: true };
}

const SEED_USERS = [
  {
    name: 'System Administrator',
    email: 'admin@fitvision.ai',
    passwordEnv: 'ADMIN_PASSWORD',
    role: 'admin',
    status: 'active',
    fitnessScore: 100,
    streakCount: 0,
    goals: {
      primaryGoal: 'maintenance',
      targetWeightKg: 70,
      allergies: [],
      activityLevel: 'Moderate',
      workoutPreference: 'Gym'
    },
    subscription: {
      tier: 'elite',
      status: 'active',
      billingCycle: 'yearly',
      renewsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  },
  {
    name: 'John Doe (Demo)',
    email: 'user@fitvision.ai',
    passwordEnv: 'DEMO_USER_PASSWORD',
    role: 'user',
    status: 'active',
    fitnessScore: 82,
    streakCount: 5,
    bodyMetrics: {
      heightCm: 175,
      weightKg: 70,
      age: 25,
      gender: 'Male',
      estimatedBmi: 22.8,
      postureStatus: 'Normal posture detected'
    },
    goals: {
      primaryGoal: 'muscle_gain',
      targetWeightKg: 75,
      allergies: ['Peanuts'],
      activityLevel: 'Moderate',
      workoutPreference: 'Gym'
    },
    subscription: {
      tier: 'pro',
      status: 'active',
      billingCycle: 'monthly',
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  }
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌  MONGO_URI environment variable is not set.');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB.\n');

  for (const userData of SEED_USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`⚠️   Skipped  → ${userData.email}  (already exists, role: ${existing.role} — password untouched)`);
      continue;
    }

    const { password, generated } = resolvePassword(userData);
    const { passwordEnv, ...safeData } = userData;
    const user = new User({ ...safeData, password });
    await user.save(); // pre('save') hook will bcrypt-hash the password automatically
    console.log(`✅  Created  → ${userData.email}  (role: ${userData.role})`);
    if (generated) {
      console.log(`    Initial password: ${password}   (shown once — change after first login)`);
    } else {
      console.log(`    Password taken from ${passwordEnv} environment variable.`);
    }
  }

  console.log('\n🌱  Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
