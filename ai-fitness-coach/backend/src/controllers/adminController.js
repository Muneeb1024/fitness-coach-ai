import crypto from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';
import { ChatLog } from '../models/ChatLog.js';
import { AdminLog } from '../models/AdminLog.js';
import { memoryStore } from '../services/store.js';
import { emitPlanOverride } from '../services/socketEmitter.js';
import { getSystemPrompt, setSystemPrompt, defaultSystemPrompt } from '../services/promptTemplateService.js';

/** Labels for the last 7 calendar days (oldest first). */
function lastSevenDayLabels() {
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push({ key: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US', { weekday: 'short' }) });
  }
  return labels;
}

function fillTrend(countsByDate) {
  return lastSevenDayLabels().map(({ key, label }) => ({
    day: label,
    date: key,
    users: countsByDate.users[key] || 0,
    plans: countsByDate.plans[key] || 0,
    chats: countsByDate.chats[key] || 0
  }));
}

function round1(n) {
  return Math.round((n || 0) * 10) / 10;
}

export const getAdminAnalytics = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0);

      const totalUsers = await User.countDocuments({ role: 'user' });
      const activeUsers = await User.countDocuments({ role: 'user', status: 'active' });
      const bannedUsers = await User.countDocuments({ role: 'user', status: 'banned' });
      const totalPlansGenerated = await Plan.countDocuments();
      const flaggedChatsCount = await ChatLog.countDocuments({ flagged: true });

      // Real averages — never fabricated.
      const avgAgg = await User.aggregate([
        { $match: { role: 'user', fitnessScore: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$fitnessScore' } } }
      ]);
      const averageFitnessScore = round1(avgAgg[0]?.avg);

      const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('-password');
      const recentAdminLogs = await AdminLog.find().sort({ createdAt: -1 }).limit(10).populate('adminId', 'name email');
      const recentPlans = await Plan.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title dietPlan workoutPlan isCustomOverride version createdAt')
        .lean();

      // Weekly trend from real counts.
      const usersByDate = await User.aggregate([
        { $match: { role: 'user', createdAt: { $gte: weekAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } }
      ]);
      const plansByDate = await Plan.aggregate([
        { $match: { createdAt: { $gte: weekAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } }
      ]);
      const chatByDate = await ChatLog.aggregate([
        { $unwind: '$messages' },
        { $match: { 'messages.sender': 'ai', 'messages.timestamp': { $gte: weekAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$messages.timestamp' } }, n: { $sum: 1 } } }
      ]);
      const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.n]));
      const weeklyTrend = fillTrend({
        users: toMap(usersByDate),
        plans: toMap(plansByDate),
        chats: toMap(chatByDate)
      });

      return res.json({
        analytics: {
          totalUsers,
          activeUsers,
          bannedUsers,
          totalPlansGenerated,
          flaggedChatsCount,
          averageFitnessScore,
          // Plan completion is not tracked yet — null, never a fake percentage.
          planCompletionRate: null,
          weeklyTrend
        },
        recentUsers,
        recentAdminLogs,
        recentPlans
      });
    }

    const storeUsers = memoryStore.users || [];
    const storePlans = memoryStore.plans || [];
    const storeChats = memoryStore.chatLogs || [];

    const users = storeUsers.filter((u) => u.role === 'user');
    const counts = { users: {}, plans: {}, chats: {} };
    const dayKey = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');
    users.forEach((u) => { const k = dayKey(u.createdAt); if (k) counts.users[k] = (counts.users[k] || 0) + 1; });
    storePlans.forEach((p) => { const k = dayKey(p.createdAt); if (k) counts.plans[k] = (counts.plans[k] || 0) + 1; });
    storeChats.forEach((c) => {
      (c.messages || []).forEach((m) => {
        if (m.sender === 'ai') { const k = dayKey(m.timestamp); if (k) counts.chats[k] = (counts.chats[k] || 0) + 1; }
      });
    });

    const scored = users.filter((u) => Number(u.fitnessScore || 0) > 0);
    const averageFitnessScore = scored.length
      ? round1(scored.reduce((s, u) => s + Number(u.fitnessScore || 0), 0) / scored.length)
      : null;

    res.json({
      analytics: {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === 'active').length,
        bannedUsers: users.filter((u) => u.status === 'banned').length,
        totalPlansGenerated: storePlans.length,
        flaggedChatsCount: storeChats.filter((c) => c.flagged).length,
        averageFitnessScore,
        planCompletionRate: null,
        weeklyTrend: fillTrend(counts)
      },
      recentUsers: users.slice(0, 5),
      recentAdminLogs: memoryStore.adminLogs || [],
      recentPlans: storePlans.slice(0, 10)
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
      emitPlanOverride(userId, { planId: String(plan._id), version: plan.version, message: 'Your fitness plan was just updated by your coach.' });
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
    emitPlanOverride(userId, { planId: String(plan._id || ''), version: plan.version, message: 'Your fitness plan was just updated by your coach.' });

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

// ─── Forgot / Reset Password (user self-service) ─────────────────────────────

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

// No email transport exists in the stack yet (founder decision pending: add a
// mailer such as Resend/Nodemailer). Until then, reset tokens can only be
// surfaced in development — never accept a password change without proof.
const RESET_EMAIL_CONFIGURED = false;

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function sameHex(a, b) {
  const ba = Buffer.from(String(a ?? ''), 'hex');
  const bb = Buffer.from(String(b ?? ''), 'hex');
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/**
 * Step 1 — request a reset token.
 * Accepts ONLY an email. Creates a single-use token (stored hashed, 30 min
 * expiry) and surfaces it via the dev-mode channel. NEVER changes the password
 * in this call. Responds uniformly so emails cannot be enumerated.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) return res.status(400).json({ message: 'Email is required' });

    // Production: refuse politely until an email transport is configured.
    if (process.env.NODE_ENV === 'production' && !RESET_EMAIL_CONFIGURED) {
      return res.status(503).json({
        message: 'Password reset is not available yet. Please contact support.'
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    const genericMessage = 'If an account exists for that email, a reset token has been issued.';
    const devVisible = process.env.NODE_ENV !== 'production' || process.env.RESET_TOKEN_DEBUG === 'true';
    const includeTokenInResponse = process.env.RESET_TOKEN_DEBUG === 'true';

    const issueToken = async (user) => {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      if (isDbConnected) {
        user.passwordResetTokenHash = sha256Hex(token);
        user.passwordResetExpiresAt = expiresAt;
        await user.save();
      } else {
        user.resetTokenHash = sha256Hex(token);
        user.resetTokenExpiresAt = expiresAt;
      }
      if (devVisible) {
        console.log(`\x1b[33m[Auth]\x1b[0m Password reset token for ${user.email}: ${token}  (expires in 30 minutes)`);
      }
      return token;
    };

    const payload = { message: genericMessage };

    if (isDbConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) return res.json(payload);
      const token = await issueToken(user);
      if (includeTokenInResponse) payload.devToken = token;
      return res.json(payload);
    }

    const user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return res.json(payload);
    const token = await issueToken(user);
    if (includeTokenInResponse) payload.devToken = token;
    return res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Step 2 — redeem a reset token.
 * Requires email + token + newPassword. Token must exist, be unexpired, and
 * match the stored hash; it is single-use and cleared after success.
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanToken = String(token || '').trim();
    if (!cleanEmail || !cleanToken) {
      return res.status(400).json({ message: 'Email and reset token are required' });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    const fail = () => res.status(400).json({ message: 'Invalid or expired reset token.' });

    if (isDbConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user || !user.passwordResetTokenHash || !user.passwordResetExpiresAt) return fail();
      if (new Date() > user.passwordResetExpiresAt) return fail();
      if (!sameHex(user.passwordResetTokenHash, sha256Hex(cleanToken))) return fail();

      user.password = String(newPassword);
      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;
      await user.save();
      return res.json({ message: 'Password updated successfully. You can now sign in.' });
    }

    const user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) return fail();
    if (new Date() > user.resetTokenExpiresAt) return fail();
    if (!sameHex(user.resetTokenHash, sha256Hex(cleanToken))) return fail();

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(String(newPassword), salt);
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    return res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
