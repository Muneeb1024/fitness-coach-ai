import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { memoryStore } from '../services/store.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, goals } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Role is never attacker-supplied: public registration is always 'user'.
      // Administrators are provisioned via seed data or a dedicated admin flow.
      const newUser = await User.create({
        name,
        email,
        password,
        role: 'user',
        goals: goals || { primaryGoal: 'Maintenance' }
      });

      const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.status(201).json({
        message: 'Account registered successfully',
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status, goals: newUser.goals, bodyMetrics: newUser.bodyMetrics }
      });
    }

    // In-memory fallback
    const existing = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `user_${Date.now()}`,
      name,
      email,
      passwordHash: hash,
      role: 'user',
      status: 'active',
      profileImages: {},
      bodyMetrics: { heightCm: 175, weightKg: 70, age: 25, estimatedBmi: 22.8 },
      goals: goals || { primaryGoal: 'Maintenance' },
      streakCount: 0,
      fitnessScore: 75
    };

    memoryStore.users.push(newUser);
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'Account registered successfully (Local Storage)',
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status, goals: newUser.goals, bodyMetrics: newUser.bodyMetrics }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
      if (user.status === 'banned') return res.status(403).json({ message: 'Account is banned by administrator.' });

      user.lastActiveDate = new Date();
      await user.save();

      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.json({
        message: 'Login successful',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, goals: user.goals, bodyMetrics: user.bodyMetrics, streakCount: user.streakCount, fitnessScore: user.fitnessScore }
      });
    }

    // In-memory fallback handler
    const user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Enforce the real password in every case — no seeded plaintext bypass.
    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    } else if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Account is banned by administrator.' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, goals: user.goals, bodyMetrics: user.bodyMetrics, streakCount: user.streakCount, fitnessScore: user.fitnessScore }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    // Issue a fresh token so sessions silently auto-extend on page load
    const freshToken = jwt.sign(
      { userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const userOut = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar || '',
      role: req.user.role,
      status: req.user.status,
      goals: req.user.goals,
      bodyMetrics: req.user.bodyMetrics,
      profileImages: req.user.profileImages,
      streakCount: req.user.streakCount,
      fitnessScore: req.user.fitnessScore,
      badges: req.user.badges || [],
      weeklyChallenge: req.user.weeklyChallenge || {}
    };

    res.json({ user: userOut, token: freshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
