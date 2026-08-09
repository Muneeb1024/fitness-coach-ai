import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Personalized AI Fitness & Diet Plan' },
    dietPlan: {
      dailyCalories: { type: Number, default: 2200 },
      macros: {
        proteinGrams: { type: Number, default: 150 },
        carbsGrams: { type: Number, default: 220 },
        fatGrams: { type: Number, default: 70 }
      },
      meals: [
        {
          name: { type: String }, // Breakfast, Lunch, Dinner, Snack
          time: { type: String },
          description: { type: String },
          calories: { type: Number },
          protein: { type: Number },
          carbs: { type: Number },
          fat: { type: Number }
        }
      ],
      allergiesConsidered: [{ type: String }]
    },
    workoutPlan: {
      frequencyDaysPerWeek: { type: Number, default: 4 },
      splitType: { type: String, default: 'Upper / Lower Split' },
      schedule: [
        {
          day: { type: String }, // e.g., Day 1 - Upper Body
          focus: { type: String },
          exercises: [
            {
              name: { type: String },
              sets: { type: Number },
              reps: { type: String },
              restSec: { type: Number },
              notes: { type: String }
            }
          ]
        }
      ]
    },
    isCustomOverride: { type: Boolean, default: false },
    overriddenByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    overrideNotes: { type: String, default: '' },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const Plan = mongoose.model('Plan', planSchema);
