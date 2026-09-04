import mongoose from 'mongoose';

const foodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD (UTC)
    foodName: { type: String, default: '' },
    servingSize: { type: String, default: '' },
    mealType: { type: String, default: 'snack' },
    imageThumb: { type: String, default: '' },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

foodLogSchema.index({ userId: 1, date: 1, createdAt: -1 });

export const FoodLog = mongoose.model('FoodLog', foodLogSchema);
