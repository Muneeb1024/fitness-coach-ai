import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Plan } from '../models/Plan.js';
import { Progress } from '../models/Progress.js';
import { memoryStore } from './store.js';

import { getSystemPrompt, setSystemPrompt } from './promptTemplateService.js';

/**
 * RAG Chat Service: Injects user's profile, diet/workout plan, and recent daily progress into prompt context.
 * Gracefully supports both MongoDB and memoryStore when offline.
 */
export const answerUserChatQuery = async ({ user, query }) => {
  // Check for potentially harmful / off-topic content for moderation flagging
  const harmfulKeywords = ['suicide', 'starve', 'anorexia', 'illegal drugs', 'extreme purging', 'steroid abuse'];
  const isHarmful = harmfulKeywords.some((kw) => query.toLowerCase().includes(kw));

  let activePlan = null;
  let recentProgress = [];

  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      activePlan = await Plan.findOne({ userId: user._id }).sort({ createdAt: -1 });
      recentProgress = await Progress.find({ userId: user._id }).sort({ date: -1 }).limit(3);
    } catch (err) {
      console.warn('[RAG Chat DB Fetch Warning]', err.message);
    }
  } else {
    // Memory store fallback
    const plans = memoryStore.plans || [];
    const logs = memoryStore.progressLogs || memoryStore.progress || [];
    activePlan = plans.find((p) => String(p.userId) === String(user._id));
    recentProgress = logs.filter((p) => String(p.userId) === String(user._id)).slice(0, 3);
  }

  // Ensure recentProgress is always an array
  if (!Array.isArray(recentProgress)) recentProgress = [];

  // === REAL-TIME TODAY CONTEXT: fetch today's actual progress ===
  const todayStr = new Date().toISOString().split('T')[0];
  let todayProgress = null;
  try {
    if (isDbConnected) {
      todayProgress = await Progress.findOne({ userId: user._id, date: todayStr });
    } else {
      todayProgress = (memoryStore.progressLogs || []).find(
        (p) => String(p.userId) === String(user._id) && p.date === todayStr
      );
    }
  } catch (_) {}

  const mealsConsumed = todayProgress?.mealsLogged?.filter((m) => m.consumed) || [];
  const caloriesConsumedToday = mealsConsumed.reduce((sum, m) => sum + (m.calories || 0), 0);
  const mealTarget = activePlan?.dietPlan?.dailyCalories || 2200;
  const caloriesRemaining = Math.max(0, mealTarget - caloriesConsumedToday);
  const mealsConsumedNames = mealsConsumed.map((m) => m.mealName).join(', ') || 'None yet';
  const waterToday = todayProgress?.waterMl || 0;
  const workoutDoneToday = todayProgress?.workoutCompleted || false;
  const sleepLastNight = todayProgress?.sleepHours ?? 7;
  // ================================================================

  const contextData = {
    userName: user?.name || 'User',
    goal: user?.goals?.primaryGoal || 'Fitness Maintenance',
    experienceLevel: user?.goals?.experienceLevel || 'Beginner',
    dietPreference: user?.goals?.dietPreference || 'Balanced',
    allergies: user?.goals?.allergies || [],
    availableEquipment: user?.goals?.availableEquipment || [],
    injuries: user?.goals?.injuries || [],
    customLimitations: user?.goals?.customLimitations || '',
    postureStatus: user?.bodyMetrics?.postureStatus || 'Normal posture detected',
    estimatedBmi: user?.bodyMetrics?.estimatedBmi || 22.8,
    weightKg: user?.bodyMetrics?.weightKg || 70,
    targetWeightKg: user?.goals?.targetWeightKg || 70,
    activityLevel: user?.goals?.activityLevel || 'Moderate',
    workoutPreference: user?.goals?.workoutPreference || 'Gym',
    dailyCalories: activePlan?.dietPlan?.dailyCalories || 2200,
    macros: activePlan?.dietPlan?.macros || null,
    meals: activePlan?.dietPlan?.meals || [],
    workoutSplit: activePlan?.workoutPlan?.splitType || 'Full Body',
    workoutSchedule: activePlan?.workoutPlan?.frequencyDaysPerWeek || 3,
    streakDays: user?.streakCount || 0,
    fitnessScore: user?.fitnessScore || 75,
    // Today's real-time data
    today: {
      date: todayStr,
      caloriesConsumed: caloriesConsumedToday,
      caloriesRemaining,
      mealsConsumedNames,
      waterMl: waterToday,
      workoutCompleted: workoutDoneToday,
      sleepHours: sleepLastNight
    },
    recentProgressLogs: recentProgress.map((p) => ({
      date: p.date,
      waterMl: p.waterMl,
      sleepHours: p.sleepHours,
      workoutDone: p.workoutCompleted
    }))
  };

  const editableSystemPrompt = await getSystemPrompt();

  const apiKey = process.env.GEMINI_API_KEY;
  let useGemini = false;
  let genAI = null;

  if (apiKey && (apiKey.startsWith('AIza') || apiKey.length > 20)) {
    try {
      genAI = new GoogleGenerativeAI(apiKey);
      useGemini = true;
    } catch (err) {
      console.warn('[Gemini Init Warning]', err.message);
    }
  }

  const mealSummary = contextData.meals.length
    ? contextData.meals.map((m) => `${m.name} (${m.time}) — ${m.description}`).join('; ')
    : 'No meals assigned yet.';

  const macroSummary = contextData.macros
    ? `P ${contextData.macros.proteinGrams}g / C ${contextData.macros.carbsGrams}g / F ${contextData.macros.fatGrams}g`
    : 'Not assigned yet.';

  const ragPrompt = `System Instructions:
${editableSystemPrompt}

You are the AI Fitness Coach for ${contextData.userName}, powered by SoftnoveX FitVision AI.

=== DETAILED ATHLETIC & BIOMETRIC PROFILE ===
- Primary Goal: ${contextData.goal} | Experience Level: ${contextData.experienceLevel}
- Body Weight: ${contextData.weightKg} kg | Target: ${contextData.targetWeightKg} kg | BMI: ${contextData.estimatedBmi}
- Posture Analysis: ${contextData.postureStatus}
- Available Equipment: ${contextData.availableEquipment.join(', ') || 'Standard gym / dumbbells'}
- Physical Injuries / Limitations: ${contextData.injuries.join(', ') || 'None reported'}${contextData.customLimitations ? ` (${contextData.customLimitations})` : ''}
- Diet Style: ${contextData.dietPreference} | Allergies: ${contextData.allergies.join(', ') || 'None'}
- Activity Level: ${contextData.activityLevel} | Location: ${contextData.workoutPreference}
- Habit Streak: ${contextData.streakDays} days | Fitness Score: ${contextData.fitnessScore}/100

=== ASSIGNED PLAN ===
- Daily Calorie Target: ${contextData.dailyCalories} kcal
- Daily Macros: ${macroSummary}
- Meal Plan: ${mealSummary}
- Workout Routine: ${contextData.workoutSplit} (${contextData.workoutSchedule} days/week)

=== TODAY'S REAL-TIME PROGRESS (${contextData.today.date}) ===
- Calories Consumed So Far: ${contextData.today.caloriesConsumed} kcal
- Calories Remaining Today: ${contextData.today.caloriesRemaining} kcal
- Meals Already Eaten: ${contextData.today.mealsConsumedNames}
- Water Intake Today: ${contextData.today.waterMl} ml (goal: 2500 ml)
- Workout Completed Today: ${contextData.today.workoutCompleted ? 'YES' : 'NOT YET'}
- Sleep Last Night: ${contextData.today.sleepHours} hours

=== RECENT HISTORY ===
${JSON.stringify(contextData.recentProgressLogs)}

User Question: "${query}"

=== RESPONSE GUIDELINES ===
- CRITICAL SAFETY: Never prescribe exercises that aggravate the user's listed injuries (${contextData.injuries.join(', ') || 'None'}). If they have knee or lower back issues, provide safe joint-friendly alternatives.
- Tailor all exercise suggestions to their Available Equipment (${contextData.availableEquipment.join(', ') || 'Gym'}).
- If they ask for food advice, strictly respect their Diet Style (${contextData.dietPreference}) and Allergies.
- Be encouraging, concise, and actionable. Max 150 words.
- You are an AI assistant, not a doctor. Do not make medical diagnoses.

Response:`;

  let responseText = '';

  if (useGemini && genAI) {
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.6-flash', 'gemini-3.6-flash'];
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(ragPrompt);
        responseText = result.response.text();
        if (responseText) break;
      } catch (err) {
        console.warn(`[Gemini Chat RAG Error with ${modelName}]:`, err.message);
      }
    }
    if (!responseText) {
      console.error('[Gemini Chat RAG] Gemini API call failed (Quota Exceeded or Invalid Key). Using local RAG fallback response.');
    }
  }

  if (!responseText) {
    // Intelligent RAG response generator fallback
    const qLower = query.toLowerCase();
    if (qLower.includes('water') || qLower.includes('hydrate')) {
      responseText = `Hey ${contextData.userName}! Based on your assigned daily plan (${contextData.dailyCalories} kcal), aim for at least 2.5 to 3 liters of water daily. Staying hydrated is key to maintaining your current ${contextData.streakDays}-day streak! 💧`;
    } else if (qLower.includes('workout') || qLower.includes('exercise') || qLower.includes('routine')) {
      responseText = `Your current routine is set to: **${contextData.workoutSplit}**. For your goal of **${contextData.goal}**, focus on progressive overload and proper recovery between sets. Stay consistent! 💪`;
    } else if (qLower.includes('diet') || qLower.includes('eat') || qLower.includes('meal') || qLower.includes('calorie') || qLower.includes('food')) {
      responseText = `Your target daily intake is **${contextData.dailyCalories} kcal**. We've made sure to keep your plan free from your listed allergies (${contextData.allergies.join(', ') || 'None'}). Keep your protein intake high to support muscle recovery! 🥗`;
    } else {
      responseText = `Great question, ${contextData.userName}! For your goal of **${contextData.goal}**, staying consistent with your target of ${contextData.dailyCalories} kcal and your ${contextData.workoutSplit} routine is key. Let me know if you want to tweak any meal or exercise in your plan! 🏋️‍♂️`;
    }
  }

  return {
    reply: responseText,
    flagged: isHarmful,
    flagReason: isHarmful ? 'Query contains potential safety or extreme health concern keywords.' : ''
  };
};
