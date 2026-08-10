/**
 * 🌱 FitVision AI — Database Seed Script
 * Run once on production to create the admin & demo user accounts.
 *
 * Usage:
 *   node src/seed.js
 *
 * Env vars required:
 *   MONGO_URI  — Your MongoDB Atlas connection string
 *   JWT_SECRET — (optional, only needed if you test tokens)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const SEED_USERS = [
  {
    name: 'System Administrator',
    email: 'admin@fitvision.ai',
    password: 'password123',
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
    password: 'password123',
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
      console.log(`⚠️   Skipped  → ${userData.email}  (already exists, role: ${existing.role})`);
      continue;
    }

    const user = new User(userData);
    await user.save(); // pre('save') hook will bcrypt-hash the password automatically
    console.log(`✅  Created  → ${userData.email}  (role: ${userData.role})`);
  }

  console.log('\n🌱  Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
