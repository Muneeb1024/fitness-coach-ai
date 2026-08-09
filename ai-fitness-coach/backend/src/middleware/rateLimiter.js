import rateLimit from 'express-rate-limit';

// General API limiter (1000 req / 15 min per IP)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again in 15 minutes.' }
});

// Auth limiter — generous limit during dev/testing (500 req / 15 min per IP)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
});

// AI plan regeneration (100 per day per IP for smooth testing)
export const planLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Plan generation limit reached for today. Try again tomorrow.' }
});

// Chat (500 per hour per IP)
export const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Chat limit reached. Slow down, champ! 💪' }
});
