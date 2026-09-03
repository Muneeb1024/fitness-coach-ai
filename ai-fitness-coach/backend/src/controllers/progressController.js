import mongoose from 'mongoose';
import { Progress } from '../models/Progress.js';
import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';
import { memoryStore } from '../services/store.js';
import { checkAndAwardBadges } from '../utils/badgeEngine.js';

export const getDailyProgress = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let progress = await Progress.findOne({ userId: req.user._id, date: targetDate });
      if (!progress) {
        let initialMeals = [
          { mealName: 'Breakfast', consumed: false, calories: 500 },
          { mealName: 'Lunch', consumed: false, calories: 650 },
          { mealName: 'Snack', consumed: false, calories: 300 },
          { mealName: 'Dinner', consumed: false, calories: 650 }
        ];

        const userPlan = await Plan.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        if (userPlan?.dietPlan?.meals?.length) {
          initialMeals = userPlan.dietPlan.meals.map((m) => ({
            mealName: `${m.name || 'Meal'}: ${m.description ? m.description.slice(0, 30) : ''}`,
            consumed: false,
            calories: m.calories || 500
          }));
        }

        progress = await Progress.create({
          userId: req.user._id,
          date: targetDate,
          mealsLogged: initialMeals,
          waterMl: 0,
          sleepHours: 7,
          workoutCompleted: false
        });
      }
      return res.json({ progress });
    }

    let progress = memoryStore.progressLogs.find((p) => String(p.userId) === String(req.user._id) && p.date === targetDate);
    if (!progress) {
      let initialMeals = [
        { mealName: 'Breakfast', consumed: false, calories: 500 },
        { mealName: 'Lunch', consumed: false, calories: 650 },
        { mealName: 'Snack', consumed: false, calories: 300 },
        { mealName: 'Dinner', consumed: false, calories: 650 }
      ];

      const userPlan = (memoryStore.plans || []).find((p) => String(p.userId) === String(req.user._id));
      if (userPlan?.dietPlan?.meals?.length) {
        initialMeals = userPlan.dietPlan.meals.map((m) => ({
          mealName: `${m.name || 'Meal'}: ${m.description ? m.description.slice(0, 30) : ''}`,
          consumed: false,
          calories: m.calories || 500
        }));
      }

      progress = {
        _id: `prog_${Date.now()}`,
        userId: req.user._id,
        date: targetDate,
        mealsLogged: initialMeals,
        waterMl: 0,
        sleepHours: 7,
        workoutCompleted: false
      };
      memoryStore.progressLogs.push(progress);
    }
    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDailyProgress = async (req, res) => {
  try {
    const { date, mealsLogged, waterMl, sleepHours, workoutCompleted, weightKg, notes } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let progress = await Progress.findOne({ userId: req.user._id, date: targetDate });
      if (!progress) progress = new Progress({ userId: req.user._id, date: targetDate });

      if (mealsLogged !== undefined) progress.mealsLogged = mealsLogged;
      if (waterMl !== undefined) progress.waterMl = waterMl;
      if (sleepHours !== undefined) progress.sleepHours = sleepHours;
      if (workoutCompleted !== undefined) progress.workoutCompleted = workoutCompleted;
      if (weightKg !== undefined) progress.weightKg = weightKg;
      if (notes !== undefined) progress.notes = notes;

      await progress.save();
      const user = await User.findById(req.user._id);
      const todayStr = new Date().toISOString().split('T')[0];

      if ((progress.workoutCompleted || progress.waterMl >= 2000) && user.lastStreakDate !== todayStr) {
        user.streakCount += 1;
        user.lastStreakDate = todayStr;
        user.fitnessScore = Math.min(100, user.fitnessScore + 1);
      }

      // Badge check: fetch last 7 days + plan for context
      const last7 = await Progress.find({ userId: req.user._id }).sort({ date: -1 }).limit(7);
      const plan = await Plan.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      const newBadges = await checkAndAwardBadges(user, progress, last7, plan);

      await user.save();
      return res.json({ message: 'Progress updated', progress, streakCount: user.streakCount, newBadges });
    }

    let progress = memoryStore.progressLogs.find((p) => String(p.userId) === String(req.user._id) && p.date === targetDate);
    if (!progress) {
      progress = { _id: `prog_${Date.now()}`, userId: req.user._id, date: targetDate, mealsLogged: [], waterMl: 0, sleepHours: 7, workoutCompleted: false };
      memoryStore.progressLogs.push(progress);
    }

    if (mealsLogged !== undefined) progress.mealsLogged = mealsLogged;
    if (waterMl !== undefined) progress.waterMl = waterMl;
    if (sleepHours !== undefined) progress.sleepHours = sleepHours;
    if (workoutCompleted !== undefined) progress.workoutCompleted = workoutCompleted;
    if (weightKg !== undefined) progress.weightKg = weightKg;
    if (notes !== undefined) progress.notes = notes;

    const memUser = memoryStore.users.find((u) => String(u._id) === String(req.user._id));
    const todayStr = new Date().toISOString().split('T')[0];
    if (memUser && (progress.workoutCompleted || progress.waterMl >= 2000) && memUser.lastStreakDate !== todayStr) {
      memUser.streakCount += 1;
      memUser.lastStreakDate = todayStr;
      memUser.fitnessScore = Math.min(100, memUser.fitnessScore + 1);
    }

    res.json({ message: 'Progress updated', progress, streakCount: memUser?.streakCount || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProgressHistory = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const history = await Progress.find({ userId: req.user._id }).sort({ date: -1 }).limit(30);
      return res.json({ history });
    }

    const history = memoryStore.progressLogs.filter((p) => String(p.userId) === String(req.user._id));
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
