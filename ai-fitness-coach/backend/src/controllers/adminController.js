import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

// ─── Admin User CRUD ──────────────────────────────────────────────────────────

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' });
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const exists = await User.findOne({ email: email.trim().toLowerCase() });
      if (exists) return res.status(400).json({ message: 'A user with this email already exists' });
      const newUser = await User.create({ name, email: email.trim().toLowerCase(), password, role });
      await AdminLog.create({ adminId: req.user._id, action: 'CREATE_USER', targetUserId: newUser._id, details: `Admin created user ${newUser.email} with role ${role}` });
      const { password: _, ...safe } = newUser.toObject();
      return res.status(201).json({ message: 'User created successfully', user: safe });
    }

    const exists = memoryStore.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) return res.status(400).json({ message: 'A user with this email already exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = { _id: `user_${Date.now()}`, name, email: email.trim().toLowerCase(), passwordHash: hash, role, status: 'active', createdAt: new Date() };
    memoryStore.users.push(newUser);
    const { passwordHash: __, ...safe } = newUser;
    res.status(201).json({ message: 'User created successfully', user: safe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, status } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (name) user.name = name;
      if (email) user.email = email.trim().toLowerCase();
      if (role) user.role = role;
      if (status) user.status = status;
      await user.save();
      await AdminLog.create({ adminId: req.user._id, action: 'UPDATE_USER', targetUserId: user._id, details: `Admin updated user ${user.email}` });
      const { password: _, ...safe } = user.toObject();
      return res.json({ message: 'User updated successfully', user: safe });
    }

    const user = memoryStore.users.find((u) => String(u._id) === String(userId));
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email.trim().toLowerCase();
    if (role) user.role = role;
    if (status) user.status = status;
    const { passwordHash: _, ...safe } = user;
    res.json({ message: 'User updated successfully', user: safe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin account' });
      await User.findByIdAndDelete(userId);
      await AdminLog.create({ adminId: req.user._id, action: 'DELETE_USER', targetUserId: userId, details: `Admin deleted user ${user.email}` });
      return res.json({ message: 'User deleted successfully' });
    }

    const idx = memoryStore.users.findIndex((u) => String(u._id) === String(userId));
    if (idx === -1) return res.status(404).json({ message: 'User not found' });
    if (memoryStore.users[idx].role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin account' });
    memoryStore.users.splice(idx, 1);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.password = newPassword; // pre-save hook will hash it
      await user.save();
      await AdminLog.create({ adminId: req.user._id, action: 'RESET_PASSWORD', targetUserId: user._id, details: `Admin reset password for ${user.email}` });
      return res.json({ message: 'Password reset successfully' });
    }

    const user = memoryStore.users.find((u) => String(u._id) === String(userId));
    if (!user) return res.status(404).json({ message: 'User not found' });
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Forgot Password (user self-service) ─────────────────────────────────────

export const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: 'Email and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) return res.status(404).json({ message: 'No account found with this email' });
      user.password = newPassword;
      await user.save();
      return res.json({ message: 'Password updated successfully. You can now sign in.' });
    }

    const user = memoryStore.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return res.status(404).json({ message: 'No account found with this email' });
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
