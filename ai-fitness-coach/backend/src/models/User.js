import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
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
      targetWeightKg: { type: Number, default: 70 },
      age: { type: Number, default: 25 },
      gender: { type: String, default: 'unspecified' },
      bodyFatPct: { type: Number, default: 18 },
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
        enum: ['weight_loss', 'muscle_gain', 'maintenance', 'athletic', 'recomposition'],
        default: 'maintenance'
      },
      targetWeightKg: { type: Number, default: 70 },
      targetTimeline: { type: String, default: '60 days' },
      experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
      allergies: [{ type: String }],
      dietPreference: { type: String, default: 'Balanced' },
      mealsPerDay: { type: Number, default: 4 },
      activityLevel: { type: String, default: 'Moderate' },
      workoutPreference: { type: String, enum: ['Home', 'Gym', 'Hybrid'], default: 'Gym' },
      availableEquipment: [{ type: String }],
      daysPerWeek: { type: Number, default: 4 },
      workoutDurationMin: { type: Number, default: 45 },
      injuries: [{ type: String }],
      customLimitations: { type: String, default: '' },
      dailyWaterTargetMl: { type: Number, default: 2500 },
      dailySleepTargetHours: { type: Number, default: 8 }
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
    },
    badges: [
      {
        id: { type: String }, // e.g. 'first_workout', 'hydration_hero'
        name: { type: String },
        emoji: { type: String },
        earnedAt: { type: Date, default: Date.now }
      }
    ],
    weeklyChallenge: {
      challengeId: { type: String, default: '' },
      description: { type: String, default: '' },
      metric: { type: String, default: '' }, // 'water' | 'workout' | 'sleep'
      target: { type: Number, default: 0 },
      weekStart: { type: String, default: '' }, // YYYY-MM-DD of Monday
      completed: { type: Boolean, default: false },
      completedAt: { type: Date }
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
