import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    mealsLogged: [
      {
        mealName: String,
        consumed: Boolean,
        calories: Number
      }
    ],
    waterMl: { type: Number, default: 0 }, // e.g. 2500
    sleepHours: { type: Number, default: 7 },
    workoutCompleted: { type: Boolean, default: false },
    weightKg: { type: Number },
    progressPhotos: [{ type: String }],
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Progress = mongoose.model('Progress', progressSchema);
