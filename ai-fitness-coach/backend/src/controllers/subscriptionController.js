import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { memoryStore } from '../services/store.js';

// Tier capabilities lookup
export const TIER_LIMITS = {
  free: {
    title: 'Free Plan',
    plansPerMonth: 1,
    ragMessagesPerDay: 5,
    postureAnalysis: 'Basic BMI & Estimated Fat',
    customOverrides: false,
    prioritySupport: false
  },
  pro: {
    title: 'Pro Coach',
    plansPerMonth: 999,
    ragMessagesPerDay: 999,
    postureAnalysis: 'Full 33-Landmark Posture Scan',
    customOverrides: false,
    prioritySupport: true
  },
  elite: {
    title: 'Elite VIP',
    plansPerMonth: 999,
    ragMessagesPerDay: 999,
    postureAnalysis: 'Full 33-Landmark Posture Scan + 3D Mesh',
    customOverrides: true,
    prioritySupport: true
  }
};

// Upgrade or change subscription tier
export const upgradeSubscription = async (req, res) => {
  try {
    const { tier, billingCycle = 'monthly' } = req.body;
    if (!['free', 'pro', 'elite'].includes(tier)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription tier selected' });
    }

    const durationDays = billingCycle === 'yearly' ? 365 : 30;
    const renewsAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const subscriptionData = {
      tier,
      status: 'active',
      billingCycle,
      renewsAt
    };

    if (mongoose.connection.readyState === 1) {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { subscription: subscriptionData } },
        { new: true }
      ).select('-password');

      return res.json({
        success: true,
        message: `Successfully upgraded to ${tier.toUpperCase()} tier! 🎉`,
        user
      });
    }

    // In-Memory Fallback
    const memUser = memoryStore.users.find((u) => String(u._id) === String(req.user._id));
    if (memUser) {
      memUser.subscription = subscriptionData;
      return res.json({
        success: true,
        message: `Successfully upgraded to ${tier.toUpperCase()} tier! 🎉`,
        user: memUser
      });
    }

    return res.status(404).json({ success: false, message: 'User account not found' });
  } catch (err) {
    console.error('[Subscription Upgrade Error]', err);
    return res.status(500).json({ success: false, message: 'Server error processing subscription' });
  }
};

// Get current subscription status & limits
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userTier = req.user.subscription?.tier || 'free';
    const limits = TIER_LIMITS[userTier] || TIER_LIMITS.free;

    return res.json({
      success: true,
      subscription: req.user.subscription || { tier: 'free', status: 'active', billingCycle: 'monthly' },
      limits
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve subscription details' });
  }
};
