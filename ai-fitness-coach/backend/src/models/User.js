import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'banned'], default: 'active' },
    profileImages: {
      front: { type: String, default: '' },
      back: { type: String, default: '' },
      left: { type: String, default: '' },
      right: { type: String, default: '' }
    },
    bodyMetrics: {
      heightCm: { type: Number, default: 175 },
      weightKg: { type: Number, default: 70 },
      age: { type: Number, default: 25 },
      gender: { type: String, default: 'unspecified' },
      estimatedBmi: { type: Number, default: 22.8 },
      postureStatus: { type: String, default: 'Normal posture detected' },
      bodyLandmarks: { type: Object, default: {} },
      disclaimer: {
        type: String,
        default: 'Note: Visual body analysis & BMI estimates are automated approximations and not medically certified.'
      }
    },
    goals: {
      primaryGoal: {
        type: String,
        enum: ['Weight Loss', 'Weight Gain', 'Muscle Gain', 'Maintenance'],
        default: 'Maintenance'
      },
      targetWeightKg: { type: Number, default: 70 },
      allergies: [{ type: String }],
      activityLevel: { type: String, default: 'Moderate' },
      workoutPreference: { type: String, enum: ['Home', 'Gym', 'Hybrid'], default: 'Gym' }
    },
    streakCount: { type: Number, default: 0 },
    lastStreakDate: { type: String, default: '' },
    lastActiveDate: { type: Date, default: Date.now },
    fitnessScore: { type: Number, default: 75 },
    subscription: {
      tier: { type: String, enum: ['free', 'pro', 'elite'], default: 'free' },
      status: { type: String, enum: ['active', 'canceled', 'past_due'], default: 'active' },
      billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
      renewsAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
