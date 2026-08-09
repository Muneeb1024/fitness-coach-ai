import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';
import { ChatLog } from '../models/ChatLog.js';
import { AdminLog } from '../models/AdminLog.js';
import { memoryStore } from '../services/store.js';
import { getSystemPrompt, setSystemPrompt, defaultSystemPrompt } from '../services/promptTemplateService.js';

export const getAdminAnalytics = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const totalUsers = await User.countDocuments({ role: 'user' });
      const activeUsers = await User.countDocuments({ role: 'user', status: 'active' });
      const bannedUsers = await User.countDocuments({ role: 'user', status: 'banned' });
      const totalPlansGenerated = await Plan.countDocuments();
      const flaggedChatsCount = await ChatLog.countDocuments({ flagged: true });
      const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('-password');
      const recentAdminLogs = await AdminLog.find().sort({ createdAt: -1 }).limit(10).populate('adminId', 'name email');

      return res.json({
        analytics: { totalUsers, activeUsers, bannedUsers, totalPlansGenerated, flaggedChatsCount, averageFitnessScore: 78.4, planCompletionRate: 84.2 },
        recentUsers,
        recentAdminLogs
      });
    }

    const totalUsers = memoryStore.users.filter((u) => u.role === 'user').length;
    const activeUsers = memoryStore.users.filter((u) => u.role === 'user' && u.status === 'active').length;
    const bannedUsers = memoryStore.users.filter((u) => u.role === 'user' && u.status === 'banned').length;
    const totalPlansGenerated = memoryStore.plans.length;
    const flaggedChatsCount = memoryStore.chatLogs.filter((c) => c.flagged).length;

    res.json({
      analytics: { totalUsers, activeUsers, bannedUsers, totalPlansGenerated, flaggedChatsCount, averageFitnessScore: 78.4, planCompletionRate: 84.2 },
      recentUsers: memoryStore.users.filter((u) => u.role === 'user'),
      recentAdminLogs: memoryStore.adminLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json({ users });
    }
    res.json({ users: memoryStore.users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleUserBanStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.status = action === 'ban' ? 'banned' : 'active';
      await user.save();
      await AdminLog.create({ adminId: req.user._id, action: action === 'ban' ? 'BAN_USER' : 'UNBAN_USER', targetUserId: user._id, details: `Admin ${req.user.name} ${action}ned user ${user.name}` });
      return res.json({ message: `User account has been ${user.status}`, user });
    }

    const user = memoryStore.users.find((u) => String(u._id) === String(userId));
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = action === 'ban' ? 'banned' : 'active';

    memoryStore.adminLogs.push({
      _id: `log_${Date.now()}`,
      adminId: { name: req.user.name, email: req.user.email },
      action: action === 'ban' ? 'BAN_USER' : 'UNBAN_USER',
      details: `Admin ${req.user.name} ${action}ned user ${user.name}`,
      createdAt: new Date()
    });

    res.json({ message: `User account has been ${user.status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const overrideUserPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { dietPlan, workoutPlan, notes } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let plan = await Plan.findOne({ userId });
      if (!plan) plan = new Plan({ userId });
      if (dietPlan) plan.dietPlan = dietPlan;
      if (workoutPlan) plan.workoutPlan = workoutPlan;
      plan.isCustomOverride = true;
      plan.overriddenByAdminId = req.user._id;
      plan.overrideNotes = notes || 'Manually customized by system administrator';
      plan.version += 1;
      await plan.save();
      return res.json({ message: 'User plan overridden successfully', plan });
    }

    let plan = memoryStore.plans.find((p) => String(p.userId) === String(userId));
    if (!plan) {
      plan = { _id: `plan_${Date.now()}`, userId, version: 1 };
      memoryStore.plans.push(plan);
    }
    if (dietPlan) plan.dietPlan = dietPlan;
    if (workoutPlan) plan.workoutPlan = workoutPlan;
    plan.isCustomOverride = true;
    plan.overrideNotes = notes || 'Manually customized by system administrator';
    plan.version += 1;

    res.json({ message: 'User plan overridden successfully', plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlaggedChatLogs = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const flaggedLogs = await ChatLog.find({ flagged: true }).populate('userId', 'name email');
      return res.json({ flaggedLogs });
    }
    const flaggedLogs = memoryStore.chatLogs.filter((c) => c.flagged);
    res.json({ flaggedLogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPromptTemplate = async (_req, res) => {
  try {
    const prompt = await getSystemPrompt();
    res.json({ prompt, defaultPrompt: defaultSystemPrompt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setPromptTemplate = async (req, res) => {
  try {
    const { prompt } = req.body;
    const saved = await setSystemPrompt(prompt);
    res.json({ message: 'System prompt template updated', prompt: saved });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const moderateChatLog = async (req, res) => {
  try {
    const { chatId } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const chatLog = await ChatLog.findById(chatId);
      if (!chatLog) return res.status(404).json({ message: 'Chat log not found' });
      chatLog.flagged = false;
      chatLog.moderatedByAdmin = true;
      await chatLog.save();
      return res.json({ message: 'Chat log flag resolved by admin', chatLog });
    }

    const chatLog = memoryStore.chatLogs.find((c) => String(c._id) === String(chatId));
    if (!chatLog) return res.status(404).json({ message: 'Chat log not found' });
    chatLog.flagged = false;
    res.json({ message: 'Chat log flag resolved by admin', chatLog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
