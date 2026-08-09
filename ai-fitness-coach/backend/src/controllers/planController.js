import mongoose from 'mongoose';
import { Plan } from '../models/Plan.js';
import { User } from '../models/User.js';
import { generateFitnessPlan } from '../services/planGeneratorService.js';
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

export const regenerateMyPlan = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const generated = await generateFitnessPlan({
      primaryGoal: req.user.goals?.primaryGoal || 'Maintenance',
      targetWeightKg: req.user.goals?.targetWeightKg || 70,
      allergies: req.user.goals?.allergies || [],
      workoutPreference: req.user.goals?.workoutPreference || 'Gym',
      bodyMetrics: req.user.bodyMetrics
    });

    if (isDbConnected) {
      let plan = await Plan.findOne({ userId: req.user._id });
      if (plan) {
        plan.dietPlan = generated.dietPlan;
        plan.workoutPlan = generated.workoutPlan;
        plan.title = generated.title;
        plan.isCustomOverride = false;
        plan.version += 1;
        await plan.save();
      } else {
        plan = await Plan.create({ userId: req.user._id, title: generated.title, dietPlan: generated.dietPlan, workoutPlan: generated.workoutPlan });
      }
      return res.json({ message: 'Plan regenerated with AI', plan });
    }

    let plan = memoryStore.plans.find((p) => String(p.userId) === String(req.user._id));
    if (plan) {
      plan.dietPlan = generated.dietPlan;
      plan.workoutPlan = generated.workoutPlan;
      plan.title = generated.title;
      plan.isCustomOverride = false;
      plan.version += 1;
    } else {
      plan = { _id: `plan_${Date.now()}`, userId: req.user._id, title: generated.title, dietPlan: generated.dietPlan, workoutPlan: generated.workoutPlan, version: 1 };
      memoryStore.plans.push(plan);
    }

    res.json({ message: 'Plan regenerated with AI', plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
