import mongoose from 'mongoose';
import { Progress } from '../models/Progress.js';
import { Plan } from '../models/Plan.js';
import { User } from '../models/User.js';
import { memoryStore } from '../services/store.js';
import { GEMINI_MODEL, GEMINI_BASE } from '../config/gemini.js';

// In-memory cache: { userId: { insight, date } }
const insightCache = {};

export const getDailyInsight = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = String(req.user._id);

    // Return cached insight if already generated today
    if (insightCache[userId]?.date === todayStr) {
      return res.json({ insight: insightCache[userId].insight, cached: true });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    let last7 = [];
    let todayProgress = null;
    let plan = null;

    if (isDbConnected) {
      last7 = await Progress.find({ userId: req.user._id }).sort({ date: -1 }).limit(7);
      todayProgress = last7.find((p) => p.date === todayStr) || null;
      plan = await Plan.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    } else {
      last7 = (memoryStore.progressLogs || [])
        .filter((p) => String(p.userId) === userId)
        .slice(0, 7);
      todayProgress = last7.find((p) => p.date === todayStr) || null;
      plan = (memoryStore.plans || []).find((p) => String(p.userId) === userId);
    }

    // Compute analytics from last 7 days
    const workoutDays = last7.filter((p) => p.workoutCompleted).length;
    const avgWater = last7.length
      ? Math.round(last7.reduce((s, p) => s + (p.waterMl || 0), 0) / last7.length)
      : 0;
    const avgSleep = last7.length
      ? (last7.reduce((s, p) => s + (p.sleepHours || 7), 0) / last7.length).toFixed(1)
      : 7;
    const streak = req.user.streakCount || 0;
    const goal = req.user.goals?.primaryGoal || 'maintenance';
    const weightKg = req.user.bodyMetrics?.weightKg || 70;
    const targetKg = req.user.goals?.targetWeightKg || 70;
    const workoutSplit = plan?.workoutPlan?.splitType || 'Full Body';

    // Build insight prompt
    const insightPrompt = `You are a professional fitness coach AI for FitVision by SoftnoveX.

User stats for the last 7 days:
- Goal: ${goal} | Current weight: ${weightKg}kg | Target: ${targetKg}kg
- Workout days completed: ${workoutDays}/7
- Average water intake: ${avgWater}ml/day (goal: 2500ml)
- Average sleep: ${avgSleep}h/night
- Current streak: ${streak} days
- Assigned routine: ${workoutSplit}

Generate ONE short, highly personalized, actionable insight or tip (max 2 sentences). 
- Identify the user's WEAKEST metric from the data above.
- Give a specific, encouraging tip on how to improve it.
- Be direct. Use numbers. No fluff. No greetings.
- Examples: "You've only hit 2/7 workouts this week — try scheduling a 20-min session tonight before dinner." or "Your 1,800ml average is 700ml below target. Set an alarm at 2PM to drink a full glass."

Insight:`;

    let insight = '';

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (apiKey && apiKey.length > 10) {
      try {
        const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: insightPrompt }] }] }),
        });
        if (resp.ok) {
          const data = await resp.json();
          insight = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }
      } catch (err) {
        console.warn('[Daily Insight Gemini Error]', err.message);
      }
    }

    // Smart rule-based fallback
    if (!insight) {
      if (workoutDays < 3) {
        insight = `You've completed ${workoutDays}/7 workouts this week. Schedule your next session tonight — consistency beats intensity. Your ${streak}-day streak is on the line! 💪`;
      } else if (avgWater < 1800) {
        insight = `Your average water intake is ${avgWater}ml — ${2500 - avgWater}ml below your daily target. Set a 2PM alarm and drink a full glass right now.`;
      } else if (parseFloat(avgSleep) < 6.5) {
        insight = `${avgSleep}h average sleep is impacting your recovery. Aim for 7h tonight — poor sleep raises cortisol and slows fat loss.`;
      } else if (streak > 0 && streak % 7 === 0) {
        insight = `🔥 ${streak}-day streak achieved! You're in the top 10% of consistency. Keep this momentum — one more week makes it a habit.`;
      } else {
        insight = `You've nailed ${workoutDays} workouts this week with a ${streak}-day streak. Stay on your ${workoutSplit} routine and hit 2,500ml of water today.`;
      }
    }

    // Cache the result for today
    insightCache[userId] = { insight, date: todayStr };

    res.json({ insight, cached: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklySummary = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const userId = String(req.user._id);

    let last7 = [];
    if (isDbConnected) {
      last7 = await Progress.find({ userId: req.user._id }).sort({ date: -1 }).limit(7);
    } else {
      last7 = (memoryStore.progressLogs || []).filter((p) => String(p.userId) === userId).slice(0, 7);
    }

    if (!last7.length) return res.json({ summary: null });

    const workoutDays = last7.filter((p) => p.workoutCompleted).length;
    const avgWater = Math.round(last7.reduce((s, p) => s + (p.waterMl || 0), 0) / last7.length);
    const avgSleep = (last7.reduce((s, p) => s + (p.sleepHours || 7), 0) / last7.length).toFixed(1);
    const totalCalories = last7.reduce((s, p) =>
      s + (p.mealsLogged?.filter((m) => m.consumed).reduce((ms, m) => ms + (m.calories || 0), 0) || 0), 0
    );
    const avgCalories = Math.round(totalCalories / last7.length);
    const streak = req.user.streakCount || 0;

    res.json({
      summary: {
        workoutDays,
        avgWaterMl: avgWater,
        avgSleepHours: parseFloat(avgSleep),
        avgCalories,
        streak,
        daysTracked: last7.length,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
