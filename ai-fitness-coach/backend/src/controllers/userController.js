import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';
import { analyzeBodyImages } from '../services/visionService.js';
import { generateFitnessPlan } from '../services/planGeneratorService.js';
import { memoryStore } from '../services/store.js';

export const completeOnboarding = async (req, res) => {
  try {
    const { primaryGoal, targetWeightKg, allergies, workoutPreference, heightCm, weightKg, age, gender, images } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    // 1. Run Vision Analysis
    const visionAnalysis = await analyzeBodyImages({
      heightCm: heightCm || 175,
      weightKg: weightKg || 70,
      images: images || {}
    });

    const goalData = {
      primaryGoal: primaryGoal || 'Maintenance',
      targetWeightKg: targetWeightKg || weightKg || 70,
      allergies: Array.isArray(allergies) ? allergies : allergies ? allergies.split(',').map((s) => s.trim()) : [],
      workoutPreference: workoutPreference || 'Gym'
    };

    const metricsData = {
      heightCm: heightCm || 175,
      weightKg: weightKg || 70,
      age: age || 25,
      gender: gender || 'unspecified',
      estimatedBmi: visionAnalysis.estimatedBmi,
      postureStatus: visionAnalysis.postureStatus,
      bodyLandmarks: visionAnalysis.bodyLandmarks,
      disclaimer: visionAnalysis.disclaimer
    };

    // 2. Generate Plan Data
    const generatedPlanData = await generateFitnessPlan({
      primaryGoal: goalData.primaryGoal,
      targetWeightKg: goalData.targetWeightKg,
      allergies: goalData.allergies,
      workoutPreference: goalData.workoutPreference,
      bodyMetrics: metricsData
    });

    if (isDbConnected) {
      const user = await User.findById(req.user._id);
      user.goals = goalData;
      user.bodyMetrics = metricsData;
      await user.save();

      let userPlan = await Plan.findOne({ userId: user._id });
      if (userPlan) {
        userPlan.dietPlan = generatedPlanData.dietPlan;
        userPlan.workoutPlan = generatedPlanData.workoutPlan;
        userPlan.title = generatedPlanData.title;
        userPlan.version += 1;
        await userPlan.save();
      } else {
        userPlan = await Plan.create({ userId: user._id, title: generatedPlanData.title, dietPlan: generatedPlanData.dietPlan, workoutPlan: generatedPlanData.workoutPlan });
      }

      return res.json({ message: 'Onboarding completed', user, plan: userPlan, visionAnalysis });
    }

    // In-memory fallback
    const memUser = memoryStore.users.find((u) => String(u._id) === String(req.user._id));
    if (memUser) {
      memUser.goals = goalData;
      memUser.bodyMetrics = metricsData;
    }

    let memPlan = memoryStore.plans.find((p) => String(p.userId) === String(req.user._id));
    if (memPlan) {
      memPlan.dietPlan = generatedPlanData.dietPlan;
      memPlan.workoutPlan = generatedPlanData.workoutPlan;
      memPlan.title = generatedPlanData.title;
      memPlan.version += 1;
    } else {
      memPlan = { _id: `plan_${Date.now()}`, userId: req.user._id, title: generatedPlanData.title, dietPlan: generatedPlanData.dietPlan, workoutPlan: generatedPlanData.workoutPlan, version: 1 };
      memoryStore.plans.push(memPlan);
    }

    res.json({ message: 'Onboarding completed (Local Storage)', user: memUser || req.user, plan: memPlan, visionAnalysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fields a member may edit through the profile/onboarding UI.
// Anything else (role, status, streakCount, fitnessScore, _id) is never applied.
const PROFILE_EDITABLE = [
  'name', 'email', 'password', 'goals', 'bodyMetrics',
  'targetWeightKg', 'profileImages', 'activityLevel'
];

export const updateProfile = async (req, res) => {
  try {
    const patch = {};
    for (const key of PROFILE_EDITABLE) {
      if (req.body?.[key] !== undefined) patch[key] = req.body[key];
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const user = await User.findByIdAndUpdate(req.user._id, patch, { new: true }).select('-password');
      return res.json({ message: 'Profile updated', user });
    }
    const memUser = memoryStore.users.find((u) => String(u._id) === String(req.user._id));
    if (memUser) Object.assign(memUser, patch);
    res.json({ message: 'Profile updated', user: memUser || req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
