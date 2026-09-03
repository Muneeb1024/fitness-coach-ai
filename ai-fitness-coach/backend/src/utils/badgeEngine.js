/**
 * Badge definitions and award logic for FitVision AI.
 * Each badge has: id, name, emoji, and a check(user, todayProgress, last7) function.
 */

export const BADGE_DEFINITIONS = [
  {
    id: 'ignition',
    name: 'Ignition',
    emoji: '🔥',
    description: 'Log your first workout',
    check: (user, todayProgress) => todayProgress?.workoutCompleted === true,
  },
  {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    emoji: '💧',
    description: '7 days with 2,000ml+ water',
    check: (user, todayProgress, last7) =>
      last7.filter((p) => (p.waterMl || 0) >= 2000).length >= 7,
  },
  {
    id: 'body_check',
    name: 'Body Check',
    emoji: '📸',
    description: 'Complete all 4 posture photos',
    check: (user) => {
      const pics = user.profileImages || {};
      return pics.front && pics.back && pics.left && pics.right;
    },
  },
  {
    id: 'warrior',
    name: 'Warrior',
    emoji: '🏆',
    description: '30-day streak',
    check: (user) => (user.streakCount || 0) >= 30,
  },
  {
    id: 'week_streak',
    name: 'Week Crusher',
    emoji: '⚡',
    description: '7-day streak',
    check: (user) => (user.streakCount || 0) >= 7,
  },
  {
    id: 'on_target',
    name: 'On Target',
    emoji: '🎯',
    description: 'Hit calorie goal 5 days in a row',
    check: (user, todayProgress, last7, plan) => {
      const target = plan?.dietPlan?.dailyCalories || 2200;
      const tolerance = 0.15; // within 15%
      return last7.slice(0, 5).every((p) => {
        const consumed = (p.mealsLogged || [])
          .filter((m) => m.consumed)
          .reduce((s, m) => s + (m.calories || 0), 0);
        return consumed >= target * (1 - tolerance) && consumed <= target * (1 + tolerance);
      });
    },
  },
  {
    id: 'sleep_champion',
    name: 'Sleep Champion',
    emoji: '😴',
    description: '5 nights of 7h+ sleep',
    check: (user, todayProgress, last7) =>
      last7.filter((p) => (p.sleepHours || 0) >= 7).length >= 5,
  },
  {
    id: 'first_log',
    name: 'Day One',
    emoji: '🌱',
    description: 'Complete your first daily log',
    check: (user, todayProgress, last7) => last7.length >= 1,
  },
];

/**
 * Checks and awards any new badges the user has earned.
 * Returns an array of newly awarded badge objects.
 */
export const checkAndAwardBadges = async (user, todayProgress, last7, plan) => {
  const existingIds = new Set((user.badges || []).map((b) => b.id));
  const newBadges = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (existingIds.has(badge.id)) continue; // already earned
    try {
      const earned = badge.check(user, todayProgress, last7, plan);
      if (earned) {
        const newBadge = {
          id: badge.id,
          name: badge.name,
          emoji: badge.emoji,
          earnedAt: new Date(),
        };
        user.badges.push(newBadge);
        newBadges.push(newBadge);
        existingIds.add(badge.id);
      }
    } catch (_) {}
  }

  return newBadges;
};
