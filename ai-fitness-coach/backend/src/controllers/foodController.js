import mongoose from 'mongoose';
import { FoodLog } from '../models/FoodLog.js';
import { memoryStore } from '../services/store.js';
import { GEMINI_MODEL as PRIMARY_MODEL, GEMINI_BASE } from '../config/gemini.js';

// In-memory food log store — used ONLY as the offline/dev fallback.
// When MongoDB is connected, food logs persist in the FoodLog collection and
// survive server restarts.
const foodLogCache = {};

// Read key lazily at call time (not at module init) — ESM imports run before dotenv.config()
const getApiKey = () => (process.env.GEMINI_API_KEY || '').trim();

// ── Call the canonical Gemini model directly ─────────────────────────────────
async function generateFoodAnalysis(imageBase64, mimeType, prompt) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env');

  console.log(`[Food AI] 🚀 Requesting analysis from ${PRIMARY_MODEL}...`);
  const url = `${GEMINI_BASE}/${PRIMARY_MODEL}:generateContent?key=${apiKey}`;
  
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      }],
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    const err = new Error(`[${resp.status}] ${PRIMARY_MODEL}: ${errBody.substring(0, 150)}`);
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error(`${PRIMARY_MODEL}: received empty response`);
  console.log(`[Food AI] ✅ Success with ${PRIMARY_MODEL}`);
  return text;
}


// ─── Analyze food image with Gemini Vision ─────────────────────────────────────
export const analyzeFood = async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: 'Image data is required' });
    }

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

    const rawText = await generateFoodAnalysis(imageBase64, mimeType, prompt);

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
    const is503 = error.message?.includes('503') || error.message?.includes('overloaded') || error.message?.includes('high demand');
    const is404 = error.message?.includes('404') || error.message?.includes('no longer available');
    
    if (is503) {
      return res.status(503).json({ 
        message: '🔄 Google AI is temporarily busy due to high demand. Please wait 10–15 seconds and try again.' 
      });
    }
    if (is404) {
      return res.status(503).json({ 
        message: '⚠️ AI model update in progress. Please try again in a moment.' 
      });
    }
    res.status(500).json({ message: 'AI analysis failed. Please try again.' });
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

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        const doc = await FoodLog.create({
          userId: req.user._id,
          date: todayStr,
          foodName,
          servingSize: entry.servingSize,
          mealType: entry.mealType,
          imageThumb: entry.imageThumb,
          nutrition: entry.nutrition
        });
        return res.status(201).json({ success: true, entry: { ...entry, _id: doc._id } });
      } catch (dbErr) {
        console.warn('[Food Log DB Write Warning]', dbErr.message);
        // Fall through to the in-memory cache as a degraded fallback.
      }
    }

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

    let entries = [];
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        const docs = await FoodLog.find({ userId: req.user._id, date: todayStr })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        entries = docs.map((d) => ({
          id: String(d._id),
          _id: d._id,
          userId,
          date: d.date,
          loggedAt: d.createdAt?.toISOString?.() || new Date().toISOString(),
          foodName: d.foodName,
          servingSize: d.servingSize,
          mealType: d.mealType,
          imageThumb: d.imageThumb,
          nutrition: d.nutrition
        }));
      } catch (dbErr) {
        console.warn('[Food Log DB Read Warning]', dbErr.message);
      }
    }

    if (entries.length === 0 && (!isDbConnected || foodLogCache[cacheKey])) {
      entries = foodLogCache[cacheKey] || [];
    }

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

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const { deletedCount } = await FoodLog.deleteOne({ _id: entryId, userId: req.user._id });
      if (deletedCount === 0) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      return res.json({ success: true, message: 'Entry removed' });
    }

    if (foodLogCache[cacheKey]) {
      foodLogCache[cacheKey] = foodLogCache[cacheKey].filter((e) => e.id !== entryId);
    }

    res.json({ success: true, message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

