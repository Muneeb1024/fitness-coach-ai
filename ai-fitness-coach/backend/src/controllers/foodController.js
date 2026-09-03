import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { memoryStore } from '../services/store.js';

// In-memory food log store (per user, per day)
// Structure: { [userId_date]: [{ ...entry }] }
const foodLogCache = {};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Analyze food image with Gemini Vision ─────────────────────────────────────
export const analyzeFood = async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert nutritionist AI for FitVision fitness app.

Analyze this food image and return a detailed nutrition breakdown in STRICT JSON format.

Rules:
- Estimate realistic portion sizes visible in the image
- If multiple food items are visible, include each separately and give totals
- Be accurate with calorie estimates — do NOT underestimate
- Health score: 1 (junk food) to 10 (very healthy whole food)
- Always respond ONLY with valid JSON, no extra text

Return this exact JSON structure:
{
  "foodName": "Name of the dish/food",
  "servingSize": "Estimated portion (e.g., '1 slice (150g)')",
  "items": [
    { "name": "Food item 1", "portion": "100g", "calories": 200 },
    { "name": "Food item 2", "portion": "50g", "calories": 120 }
  ],
  "nutrition": {
    "calories": 320,
    "protein": 12,
    "carbs": 40,
    "fat": 10,
    "fiber": 3,
    "sugar": 8,
    "sodium": 450
  },
  "healthScore": 7,
  "healthLabel": "Balanced Meal",
  "tip": "One specific nutrition tip for this food",
  "mealType": "breakfast|lunch|dinner|snack"
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
      prompt,
    ]);

    const rawText = result.response.text()?.trim();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || rawText.match(/(\{[\s\S]*\})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawText;

    let nutritionData;
    try {
      nutritionData = JSON.parse(jsonStr);
    } catch {
      return res.status(422).json({ message: 'Could not parse AI nutrition response', raw: rawText });
    }

    res.json({ success: true, nutrition: nutritionData });
  } catch (error) {
    console.error('[Food Analyze Error]', error.message);
    res.status(500).json({ message: 'AI analysis failed: ' + error.message });
  }
};

// ─── Log a food entry ──────────────────────────────────────────────────────────
export const logFood = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheKey = `${userId}_${todayStr}`;

    const { foodName, nutrition, servingSize, mealType, imageThumb } = req.body;

    const entry = {
      id: `food_${Date.now()}`,
      userId,
      date: todayStr,
      loggedAt: new Date().toISOString(),
      foodName,
      servingSize: servingSize || '',
      mealType: mealType || 'snack',
      imageThumb: imageThumb || '',
      nutrition: {
        calories: Number(nutrition?.calories) || 0,
        protein: Number(nutrition?.protein) || 0,
        carbs: Number(nutrition?.carbs) || 0,
        fat: Number(nutrition?.fat) || 0,
        fiber: Number(nutrition?.fiber) || 0,
      },
    };

    if (!foodLogCache[cacheKey]) foodLogCache[cacheKey] = [];
    foodLogCache[cacheKey].unshift(entry);

    // Keep max 50 entries per day
    if (foodLogCache[cacheKey].length > 50) foodLogCache[cacheKey].length = 50;

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get today's food log ──────────────────────────────────────────────────────
export const getTodayLog = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheKey = `${userId}_${todayStr}`;

    const entries = foodLogCache[cacheKey] || [];

    // Compute totals
    const totals = entries.reduce(
      (acc, e) => {
        acc.calories += e.nutrition?.calories || 0;
        acc.protein += e.nutrition?.protein || 0;
        acc.carbs += e.nutrition?.carbs || 0;
        acc.fat += e.nutrition?.fat || 0;
        acc.fiber += e.nutrition?.fiber || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    res.json({ success: true, entries, totals, date: todayStr });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete a food log entry ───────────────────────────────────────────────────
export const deleteFoodEntry = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const { entryId } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheKey = `${userId}_${todayStr}`;

    if (foodLogCache[cacheKey]) {
      foodLogCache[cacheKey] = foodLogCache[cacheKey].filter((e) => e.id !== entryId);
    }

    res.json({ success: true, message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
