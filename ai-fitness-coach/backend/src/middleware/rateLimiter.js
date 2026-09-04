import rateLimit from 'express-rate-limit';

// Limits are overridable via env (useful for tests/demos and ops tuning).
const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// General API limiter (default 1000 req / 15 min per IP)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: num(process.env.API_RATE_MAX, 1000),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again in 15 minutes.' }
});

// Auth limiter (default 500 req / 15 min per IP) — protects register, login,
// forgot-password and reset-password, including the admin login (same route).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: num(process.env.AUTH_RATE_MAX, 500),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
});

// AI plan regeneration (default 100 per day per IP)
export const planLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: num(process.env.PLAN_RATE_MAX, 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Plan generation limit reached for today. Try again tomorrow.' }
});

// Chat (default 500 per hour per IP)
export const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: num(process.env.CHAT_RATE_MAX, 500),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Chat limit reached. Slow down, champ! 💪' }
});
