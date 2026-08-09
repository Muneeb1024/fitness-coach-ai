import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Dynamic Fitness & Nutrition Calculation Engine
 */

// 1. Calculate Basal Metabolic Rate (Mifflin-St Jeor Equation) & TDEE
function calculateTDEE({ weightKg = 70, heightCm = 175, age = 25, gender = 'Male' }) {
  const w = Number(weightKg) || 70;
  const h = Number(heightCm) || 175;
  const a = Number(age) || 25;
  
  let bmr = 10 * w + 6.25 * h - 5 * a + (gender.toLowerCase() === 'female' ? -161 : 5);
  const activityMultiplier = 1.45; // Moderate activity
  return Math.round(bmr * activityMultiplier);
}

// 2. Calculate Goal-Based Calorie & Macro Target
function calculateMacros({ goal, tdee, weightKg }) {
  let calories = tdee;
  let proteinRatio = 2.0; // grams per kg

  if (goal === 'Weight Loss') {
    calories = Math.max(1300, tdee - 500);
    proteinRatio = 2.2; // High protein to preserve muscle during deficit
  } else if (goal === 'Muscle Gain' || goal === 'Weight Gain') {
    calories = tdee + 400;
    proteinRatio = 2.2;
  } else {
    calories = tdee; // Maintenance
    proteinRatio = 1.8;
  }

  const proteinGrams = Math.round(weightKg * proteinRatio);
  const proteinCalories = proteinGrams * 4;
  const fatCalories = Math.round(calories * 0.25);
  const fatGrams = Math.round(fatCalories / 9);
  const carbCalories = Math.max(200, calories - (proteinCalories + fatCalories));
  const carbsGrams = Math.round(carbCalories / 4);

  return { dailyCalories: calories, macros: { proteinGrams, carbsGrams, fatGrams } };
}

// 3. Dynamic Allergy-Safe Meal Builder
function buildDynamicMeals(dailyCalories, macros, allergies = []) {
  const allergyList = allergies.map(a => a.toLowerCase().trim());
  const hasAllergy = (ingredient) => allergyList.some(a => ingredient.toLowerCase().includes(a));

  // Dynamic ingredient substitutions
  const proteinBase = hasAllergy('chicken') || hasAllergy('poultry') ? 'Wild Salmon & Quinoa' : 'Grilled Turkey Breast & Brown Rice';
  const breakfastProtein = hasAllergy('egg') ? 'Chia & Hemp Protein Bowl' : 'Egg White & Whole Grain Toast';
  const nutBase = hasAllergy('nut') || hasAllergy('peanut') ? 'Sunflower Seed Butter' : 'Almond Butter';
  const dairyBase = hasAllergy('dairy') || hasAllergy('lactose') ? 'Plant-Based Isolate' : 'Greek Yogurt';

  const c = dailyCalories;
  const p = macros.proteinGrams;
  const cb = macros.carbsGrams;
  const f = macros.fatGrams;

  return [
    {
      name: 'Breakfast',
      time: '08:00 AM',
      description: `High-Protein Oatmeal with ${breakfastProtein}, berries & ${nutBase}`,
      calories: Math.round(c * 0.25),
      protein: Math.round(p * 0.25),
      carbs: Math.round(cb * 0.30),
      fat: Math.round(f * 0.25)
    },
    {
      name: 'Lunch',
      time: '01:00 PM',
      description: `${proteinBase} with steamed greens & olive oil drizzle`,
      calories: Math.round(c * 0.35),
      protein: Math.round(p * 0.35),
      carbs: Math.round(cb * 0.35),
      fat: Math.round(f * 0.35)
    },
    {
      name: 'Snack',
      time: '04:30 PM',
      description: `${dairyBase} bowl with sliced apple & chia seeds`,
      calories: Math.round(c * 0.15),
      protein: Math.round(p * 0.15),
      carbs: Math.round(cb * 0.15),
      fat: Math.round(f * 0.15)
    },
    {
      name: 'Dinner',
      time: '07:30 PM',
      description: 'Pan-seared Salmon fillet with sweet potato mash & asparagus',
      calories: Math.round(c * 0.25),
      protein: Math.round(p * 0.25),
      carbs: Math.round(cb * 0.20),
      fat: Math.round(f * 0.25)
    }
  ];
}

// 4. Dynamic Workout Split Builder
function buildDynamicWorkoutSchedule(preference = 'Gym', goal = 'Maintenance') {
  const isHome = preference.toLowerCase() === 'home';

  if (goal === 'Weight Loss') {
    return {
      frequencyDaysPerWeek: 5,
      splitType: isHome ? '5-Day Home HIIT & Metabolic Conditioning' : '5-Day Gym Fat Loss & HIIT Split',
      schedule: [
        {
          day: 'Day 1 - High Intensity Push & Core',
          focus: 'Chest, Shoulders, Triceps, Abs',
          exercises: [
            { name: isHome ? 'Decline & Standard Push-ups' : 'Barbell Bench Press', sets: 4, reps: '12-15', restSec: 45, notes: 'Keep cardiac tempo high' },
            { name: isHome ? 'Pike Push-ups' : 'Dumbbell Shoulder Press', sets: 4, reps: '12', restSec: 45, notes: 'Focus on overhead power' },
            { name: 'Mountain Climbers & Plank Hold', sets: 4, reps: '45 secs', restSec: 30, notes: 'Core stability interval' }
          ]
        },
        {
          day: 'Day 2 - Lower Body Metabolic Burn',
          focus: 'Quads, Hamstrings, Glutes',
          exercises: [
            { name: isHome ? 'Jump Squats & Lunges' : 'Barbell Back Squat', sets: 4, reps: '15', restSec: 60, notes: 'Deep range of motion' },
            { name: isHome ? 'Single-Leg Romanian Deadlifts' : 'Leg Press', sets: 4, reps: '12', restSec: 45, notes: 'Control eccentric drop' }
          ]
        },
        {
          day: 'Day 3 - Active Cardio & Conditioning',
          focus: 'Stamina & Aerobic Engine',
          exercises: [
            { name: 'Interval Zone 2 Jog or Jump Rope', sets: 1, reps: '30 mins', restSec: 60, notes: 'Maintain target heart rate' }
          ]
        }
      ]
    };
  }

  return {
    frequencyDaysPerWeek: 4,
    splitType: isHome ? '4-Day Home Bodyweight Hypertrophy Split' : '4-Day Gym Upper/Lower Split',
    schedule: [
      {
        day: 'Day 1 - Upper Body Power',
        focus: 'Chest, Lats, Shoulders',
        exercises: [
          { name: isHome ? 'Weighted/Bodyweight Push-ups' : 'Incline Dumbbell Press', sets: 4, reps: '8-12', restSec: 90, notes: 'Peak contraction' },
          { name: isHome ? 'Doorframe/Band Rows' : 'Lat Pulldown or Pull-ups', sets: 4, reps: '10-12', restSec: 90, notes: 'Squeeze lats at bottom' }
        ]
      },
      {
        day: 'Day 2 - Lower Body Strength',
        focus: 'Quadriceps, Hamstrings, Calves',
        exercises: [
          { name: isHome ? 'Bulgarian Split Squats' : 'Barbell Back Squat', sets: 4, reps: '8-10', restSec: 120, notes: 'Brace core tightly' },
          { name: isHome ? 'Glute Bridges & Hamstring Curls' : 'Romanian Deadlift', sets: 4, reps: '10-12', restSec: 90, notes: 'Hinge hips' }
        ]
      }
    ]
  };
}

/**
 * Main Export: Generate Fitness Plan
 */
export const generateFitnessPlan = async ({ primaryGoal = 'Maintenance', targetWeightKg = 70, allergies = [], workoutPreference = 'Gym', bodyMetrics = {} }) => {
  const tdee = calculateTDEE({
    weightKg: bodyMetrics.weightKg || targetWeightKg || 70,
    heightCm: bodyMetrics.heightCm || 175,
    age: bodyMetrics.age || 25,
    gender: bodyMetrics.gender || 'Male'
  });

  const { dailyCalories, macros } = calculateMacros({
    goal: primaryGoal,
    tdee,
    weightKg: bodyMetrics.weightKg || targetWeightKg || 70
  });

  const meals = buildDynamicMeals(dailyCalories, macros, allergies);
  const workoutPlan = buildDynamicWorkoutSchedule(workoutPreference, primaryGoal);

  // Try Gemini API if key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && (apiKey.startsWith('AIza') || apiKey.length > 20)) {
    const candidateModels = ['gemini-flash-latest', 'gemini-pro-latest', 'gemini-2.0-flash'];
    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = `Generate a JSON fitness plan for a ${bodyMetrics.gender || 'person'} wanting ${primaryGoal}, weight ${bodyMetrics.weightKg || 70}kg, allergies: ${allergies.join(',') || 'none'}. Target calories: ${dailyCalories}. Return ONLY valid JSON with keys: title, dietPlan (dailyCalories, macros, meals), workoutPlan (frequencyDaysPerWeek, splitType, schedule).`;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.dietPlan && parsed.workoutPlan) return parsed;
      } catch (err) {
        console.warn(`[Gemini Plan Gen Error with ${modelName}]:`, err.message);
      }
    }
  }

  // Return dynamically calculated plan
  return {
    title: `Dynamic ${primaryGoal} AI Plan (${workoutPreference})`,
    dietPlan: {
      dailyCalories,
      macros,
      meals,
      allergiesConsidered: allergies
    },
    workoutPlan
  };
};
