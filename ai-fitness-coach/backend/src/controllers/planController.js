import mongoose from 'mongoose';
import { Plan } from '../models/Plan.js';
import { User } from '../models/User.js';
import { generateFitnessPlan } from '../services/planGeneratorService.js';
import { TIER_LIMITS } from './subscriptionController.js';
import { memoryStore } from '../services/store.js';

export const getMyPlan = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      let plan = await Plan.findOne({ userId: req.user._id });
      if (!plan) {
        const user = await User.findById(req.user._id);
        const generated = await generateFitnessPlan({
          primaryGoal: user.goals?.primaryGoal || 'Maintenance',
          targetWeightKg: user.goals?.targetWeightKg || 70,
          allergies: user.goals?.allergies || [],
          workoutPreference: user.goals?.workoutPreference || 'Gym',
          bodyMetrics: user.bodyMetrics
        });
        plan = await Plan.create({ userId: user._id, title: generated.title, dietPlan: generated.dietPlan, workoutPlan: generated.workoutPlan });
      }
      return res.json({ plan });
    }

    let plan = memoryStore.plans.find((p) => String(p.userId) === String(req.user._id));
    if (!plan) {
      const generated = await generateFitnessPlan({
        primaryGoal: req.user.goals?.primaryGoal || 'Maintenance',
        targetWeightKg: req.user.goals?.targetWeightKg || 70,
        allergies: req.user.goals?.allergies || [],
        workoutPreference: req.user.goals?.workoutPreference || 'Gym',
        bodyMetrics: req.user.bodyMetrics
      });
      plan = { _id: `plan_${Date.now()}`, userId: req.user._id, title: generated.title, dietPlan: generated.dietPlan, workoutPlan: generated.workoutPlan, version: 1 };
      memoryStore.plans.push(plan);
    }
    res.json({ plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** Month key like '2026-09' (UTC). */
function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export const regenerateMyPlan = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    // Tier enforcement — monthly AI-regeneration budget, checked BEFORE any
    // model call so blocked requests cost nothing.
    // Free = 10 regenerations per calendar month; Pro/Elite = effectively
    // unlimited (999). First-time plan creation is NOT a regeneration and does
    // not consume the budget. Admin plan overrides are separate and also do not
    // consume the member's regeneration budget.
    const tier = req.user.subscription?.tier || 'free';
    const tierLimits = TIER_LIMITS[tier] || TIER_LIMITS.free;
    const allowance = tierLimits.plansPerMonth;
    const monthKey = currentMonthKey();

    const existingPlan = isDbConnected
      ? await Plan.findOne({ userId: req.user._id })
      : memoryStore.plans.find((p) => String(p.userId) === String(req.user._id));

    if (existingPlan) {
      const usedThisMonth = existingPlan.regenMonth === monthKey ? (existingPlan.regenCount || 0) : 0;
      if (usedThisMonth >= allowance) {
        return res.status(403).json({
          message: `Your ${tierLimits.title} includes ${allowance} AI plan regenerations per month. Upgrade to Pro Coach or Elite VIP for unlimited plan regeneration.`,
          code: 'PLAN_REGENERATE_LIMIT'
        });
      }
    }

    const generated = await generateFitnessPlan({
      primaryGoal: req.user.goals?.primaryGoal || 'Maintenance',
      targetWeightKg: req.user.goals?.targetWeightKg || 70,
      allergies: req.user.goals?.allergies || [],
      workoutPreference: req.user.goals?.workoutPreference || 'Gym',
      bodyMetrics: req.user.bodyMetrics
    });

    if (existingPlan) {
      existingPlan.dietPlan = generated.dietPlan;
      existingPlan.workoutPlan = generated.workoutPlan;
      existingPlan.title = generated.title;
      existingPlan.isCustomOverride = false;
      existingPlan.version += 1;
      if (existingPlan.regenMonth !== monthKey) {
        existingPlan.regenMonth = monthKey;
        existingPlan.regenCount = 0;
      }
      existingPlan.regenCount = (existingPlan.regenCount || 0) + 1;
      if (isDbConnected) await existingPlan.save();
      return res.json({ message: 'Plan regenerated with AI', plan: existingPlan });
    }

    let newPlan;
    if (isDbConnected) {
      newPlan = await Plan.create({ userId: req.user._id, title: generated.title, dietPlan: generated.dietPlan, workoutPlan: generated.workoutPlan });
    } else {
      newPlan = { _id: `plan_${Date.now()}`, userId: req.user._id, title: generated.title, dietPlan: generated.dietPlan, workoutPlan: generated.workoutPlan, version: 1 };
      memoryStore.plans.push(newPlan);
    }
    res.json({ message: 'Plan regenerated with AI', plan: newPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
