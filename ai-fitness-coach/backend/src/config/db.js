import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`\x1b[32m[MongoDB]\x1b[0m Connected successfully: ${conn.connection.host}`);

    // Ensure Default Admin Account exists with valid password
    const existingAdmin = await User.findOne({ email: 'admin@fitvision.ai' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('password123', salt);
      await User.create({
        name: 'System Administrator',
        email: 'admin@fitvision.ai',
        password: hash,
        role: 'admin',
        status: 'active',
        fitnessScore: 100,
        streakCount: 0
      });
      console.log('\x1b[32m[MongoDB]\x1b[0m Seeded default admin@fitvision.ai account');
    } else {
      // Ensure admin role and verified password hash
      const isMatch = await existingAdmin.comparePassword('password123');
      if (!isMatch || existingAdmin.role !== 'admin') {
        const salt = await bcrypt.genSalt(10);
        existingAdmin.password = await bcrypt.hash('password123', salt);
        existingAdmin.role = 'admin';
        existingAdmin.status = 'active';
        await existingAdmin.save();
        console.log('\x1b[32m[MongoDB]\x1b[0m Synchronized admin@fitvision.ai credentials');
      }
    }
  } catch (error) {
    console.warn(`\n\x1b[33m[MongoDB Warning]\x1b[0m ${error.message}`);
    console.warn(`👉 Running with in-memory fallback store for local development.\n`);
  }
};
