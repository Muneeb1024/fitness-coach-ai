import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';
import { Progress } from '../models/Progress.js';
import { analyzeBodyImages } from '../services/visionService.js';
import { generateFitnessPlan } from '../services/planGeneratorService.js';
import { memoryStore } from '../services/store.js';

export const completeOnboarding = async (req, res) => {
  try {
    const { primaryGoal, targetWeightKg, allergies, workoutPreference, heightCm, weightKg, age, gender, images, experienceLevel, availableEquipment, injuries } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    // 1. Run Vision Analysis
    const visionAnalysis = await analyzeBodyImages({
      heightCm: heightCm || 175,
      weightKg: weightKg || 70,
      images: images || {}
    });

    const goalData = {
      primaryGoal: primaryGoal || 'maintenance',
      targetWeightKg: targetWeightKg || weightKg || 70,
      experienceLevel: experienceLevel || 'Beginner',
      allergies: Array.isArray(allergies) ? allergies : allergies ? allergies.split(',').map((s) => s.trim()) : [],
      workoutPreference: workoutPreference || 'Gym',
      availableEquipment: Array.isArray(availableEquipment) ? availableEquipment : [],
      injuries: Array.isArray(injuries) ? injuries : []
    };

    const metricsData = {
      heightCm: heightCm || 175,
      weightKg: weightKg || 70,
      targetWeightKg: targetWeightKg || weightKg || 70,
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
      user.goals = { ...user.goals, ...goalData };
      user.bodyMetrics = { ...user.bodyMetrics, ...metricsData };
      if (images) user.profileImages = images;
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
      memUser.goals = { ...memUser.goals, ...goalData };
      memUser.bodyMetrics = { ...memUser.bodyMetrics, ...metricsData };
      if (images) memUser.profileImages = images;
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

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, bodyMetrics, goals, profileImages } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    // Recalculate BMI if height or weight provided
    const height = bodyMetrics?.heightCm || req.user.bodyMetrics?.heightCm || 175;
    const weight = bodyMetrics?.weightKg || req.user.bodyMetrics?.weightKg || 70;
    const heightM = height / 100;
    const calculatedBmi = Number((weight / (heightM * heightM)).toFixed(1));

    const updatedMetrics = {
      ...(req.user.bodyMetrics || {}),
      ...(bodyMetrics || {}),
      estimatedBmi: calculatedBmi
    };

    const updatedGoals = {
      ...(req.user.goals || {}),
      ...(goals || {})
    };

    if (isDbConnected) {
      const user = await User.findById(req.user._id);
      if (name) user.name = name;
      if (avatar !== undefined) user.avatar = avatar;
      user.bodyMetrics = updatedMetrics;
      user.goals = updatedGoals;
      if (profileImages) user.profileImages = { ...user.profileImages, ...profileImages };
      await user.save();

      return res.json({ message: 'Profile updated successfully', user });
    }

    const memUser = memoryStore.users.find((u) => String(u._id) === String(req.user._id));
    if (memUser) {
      if (name) memUser.name = name;
      if (avatar !== undefined) memUser.avatar = avatar;
      memUser.bodyMetrics = updatedMetrics;
      memUser.goals = updatedGoals;
      if (profileImages) memUser.profileImages = { ...memUser.profileImages, ...profileImages };
    }
    res.json({ message: 'Profile updated successfully (Local Storage)', user: memUser || req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePostureScan = async (req, res) => {
  try {
    const { images } = req.body;
    if (!images) {
      return res.status(400).json({ message: 'Images payload required' });
    }

    const height = req.user.bodyMetrics?.heightCm || 175;
    const weight = req.user.bodyMetrics?.weightKg || 70;

    const visionAnalysis = await analyzeBodyImages({
      heightCm: height,
      weightKg: weight,
      images: images
    });

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const user = await User.findById(req.user._id);
      user.profileImages = { ...user.profileImages, ...images };
      user.bodyMetrics.postureStatus = visionAnalysis.postureStatus;
      user.bodyMetrics.bodyLandmarks = visionAnalysis.bodyLandmarks;
      user.bodyMetrics.estimatedBmi = visionAnalysis.estimatedBmi;
      await user.save();

      return res.json({ message: 'Posture scan updated', user, visionAnalysis });
    }

    const memUser = memoryStore.users.find((u) => String(u._id) === String(req.user._id));
    if (memUser) {
      memUser.profileImages = { ...memUser.profileImages, ...images };
      memUser.bodyMetrics.postureStatus = visionAnalysis.postureStatus;
      memUser.bodyMetrics.bodyLandmarks = visionAnalysis.bodyLandmarks;
      memUser.bodyMetrics.estimatedBmi = visionAnalysis.estimatedBmi;
    }

    res.json({ message: 'Posture scan updated (Local Storage)', user: memUser || req.user, visionAnalysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportUserData = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let plan = null;
    let progressHistory = [];

    if (isDbConnected) {
      plan = await Plan.findOne({ userId: req.user._id });
      progressHistory = await Progress.find({ userId: req.user._id }).sort({ date: -1 });
    } else {
      plan = (memoryStore.plans || []).find((p) => String(p.userId) === String(req.user._id));
      progressHistory = (memoryStore.progressLogs || []).filter((p) => String(p.userId) === String(req.user._id));
    }

    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      platform: 'FitVision AI by SoftnoveX',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        bodyMetrics: req.user.bodyMetrics,
        goals: req.user.goals,
        profileImages: req.user.profileImages,
        streakCount: req.user.streakCount,
        fitnessScore: req.user.fitnessScore,
        badges: req.user.badges || [],
        createdAt: req.user.createdAt
      },
      activePlan: plan,
      dailyProgressHistory: progressHistory
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=fitvision-data-${req.user._id}.json`);
    res.json(exportPayload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
