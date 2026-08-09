import { z } from 'zod';

// Shared validation schemas for auth & user endpoints.
const emailSchema = z.string().trim().toLowerCase().email('A valid email is required').max(120);
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(128);

export const authSchemas = {
  register: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    email: emailSchema,
    password: passwordSchema,
    // role is intentionally NOT accepted here — public registration is always 'user'.
    goals: z.object({
      // Supported both snake_case keys (Signup UI) and Title Case (onboarding/DB)
      primaryGoal: z.string().trim().max(40).optional(),
      targetWeightKg: z.number().optional(),
      allergies: z.array(z.string()).optional(),
      activityLevel: z.string().optional(),
      workoutPreference: z.string().optional()
    }).optional()
  }),

  login: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
  }),

  planOverride: z.object({
    dietPlan: z.object({
      dailyCalories: z.number().int().min(800).max(8000),
      macros: z.object({
        proteinGrams: z.number().int().min(0).max(1000),
        carbsGrams: z.number().int().min(0).max(1000),
        fatGrams: z.number().int().min(0).max(1000)
      }).optional(),
      meals: z.array(z.object({
        name: z.string(),
        time: z.string(),
        description: z.string(),
        calories: z.number().int().min(0).max(8000).optional(),
        protein: z.number().int().min(0).optional(),
        carbs: z.number().int().min(0).optional(),
        fat: z.number().int().min(0).optional()
      })).optional()
    }).optional(),
    workoutPlan: z.object({
      splitType: z.string().min(1).max(120),
      frequencyDaysPerWeek: z.number().int().min(1).max(7),
      schedule: z.array(z.object({
        day: z.string(),
        focus: z.string(),
        exercises: z.array(z.object({
          name: z.string(),
          sets: z.number().int().min(1).max(20),
          reps: z.string(),
          restSec: z.number().int().min(0).max(600),
          notes: z.string().optional()
        }))
      })).optional()
    }).optional(),
    notes: z.string().max(500).optional()
  })
};

// Convenience wrapper: validate req.body against a schema, strip unknown keys.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues[0]?.message || 'Invalid request payload';
    return res.status(400).json({ success: false, message });
  }
  // Replace body with sanitized, validated data (drops extra fields like role).
  req.body = result.data;
  return next();
};