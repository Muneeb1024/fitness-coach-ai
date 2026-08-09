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

  const contextData = {
    userName: user?.name || 'User',
    goal: user?.goals?.primaryGoal || 'Fitness Maintenance',
    allergies: user?.goals?.allergies || [],
    estimatedBmi: user?.bodyMetrics?.estimatedBmi || 22.8,
    dailyCalories: activePlan?.dietPlan?.dailyCalories || 2200,
    macros: activePlan?.dietPlan?.macros || null,
    meals: activePlan?.dietPlan?.meals || [],
    workoutSplit: activePlan?.workoutPlan?.splitType || 'Full Body',
    workoutSchedule: activePlan?.workoutPlan?.frequencyDaysPerWeek || 3,
    streakDays: user?.streakCount || 0,
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

You are the AI Fitness Coach for ${contextData.userName}.

Context Data:
- Primary Goal: ${contextData.goal}
- Allergies: ${contextData.allergies.join(', ') || 'None'}
- Estimated BMI: ${contextData.estimatedBmi}
- Assigned Diet Calories: ${contextData.dailyCalories} kcal/day
- Daily Macros: ${macroSummary}
- Today's Meal Plan: ${mealSummary}
- Assigned Workout Routine: ${contextData.workoutSplit} (${contextData.workoutSchedule} days/week)
- Current Habit Streak: ${contextData.streakDays} days
- Recent Progress History: ${JSON.stringify(contextData.recentProgressLogs)}

User Question: "${query}"

Guidelines:
- Give an encouraging, clear, and actionable response based on THEIR context above.
- When the user asks about meals or foods, reference the actual meal plan items listed above.
- When the user asks about workouts or exercises, reference their assigned routine.
- Respect their allergies.
- Reminder: You are an AI assistant and not a medical doctor.

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
