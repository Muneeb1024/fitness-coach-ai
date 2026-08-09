import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { memoryStore } from '../services/store.js';

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isDbConnected = mongoose.connection.readyState === 1;

    let user = null;
    if (isDbConnected) {
      user = await User.findById(decoded.userId).select('-password');
    }

    if (!user) {
      user = memoryStore.users.find((u) => String(u._id) === String(decoded.userId));
    }

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User no longer exists' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Account is banned. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};
