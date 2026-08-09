import bcrypt from 'bcryptjs';

// In-Memory Fallback Storage
export const memoryStore = {
  users: [
    {
      _id: 'user_demo_1',
      name: 'John Doe (Demo)',
      email: 'user@fitvision.ai',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: 'user',
      status: 'active',
      profileImages: {
        front: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80',
        back: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80',
        left: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
        right: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80'
      },
      bodyMetrics: { heightCm: 175, weightKg: 70, age: 25, gender: 'Male', estimatedBmi: 22.8, postureStatus: 'Normal posture detected', bodyLandmarks: {} },
      goals: { primaryGoal: 'Muscle Gain', targetWeightKg: 75, allergies: ['Peanuts'], activityLevel: 'Moderate', workoutPreference: 'Gym' },
      streakCount: 5,
      fitnessScore: 82,
      subscription: { tier: 'pro', status: 'active', billingCycle: 'monthly', renewsAt: new Date(Date.now() + 30*86400000) },
      createdAt: new Date()
    },
    {
      _id: 'admin_demo_1',
      name: 'System Administrator',
      email: 'admin@fitvision.ai',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: 'admin',
      status: 'active',
      profileImages: {},
      bodyMetrics: {},
      goals: {},
      streakCount: 0,
      fitnessScore: 100,
      subscription: { tier: 'elite', status: 'active', billingCycle: 'yearly', renewsAt: new Date(Date.now() + 365*86400000) },
      createdAt: new Date()
    }
  ],

  plans: [
    {
      _id: 'plan_1',
      userId: 'user_demo_1',
      title: 'Customized Muscle Gain AI Plan (Gym)',
      dietPlan: {
        dailyCalories: 2400,
        macros: { proteinGrams: 165, carbsGrams: 240, fatGrams: 75 },
        meals: [
          { name: 'Breakfast', time: '08:00 AM', description: 'Oatmeal with whey protein & banana', calories: 500, protein: 35, carbs: 65, fat: 10 },
          { name: 'Lunch', time: '01:00 PM', description: 'Grilled chicken breast & quinoa salad', calories: 650, protein: 50, carbs: 70, fat: 15 },
          { name: 'Snack', time: '04:30 PM', description: 'Greek yogurt & almonds', calories: 300, protein: 20, carbs: 25, fat: 12 },
          { name: 'Dinner', time: '07:30 PM', description: 'Baked salmon & asparagus', calories: 650, protein: 45, carbs: 50, fat: 25 }
        ],
        allergiesConsidered: ['Peanuts']
      },
      workoutPlan: {
        frequencyDaysPerWeek: 4,
        splitType: 'Upper / Lower Body Split',
        schedule: [
          {
            day: 'Day 1 - Upper Body Focus',
            focus: 'Chest, Back, Shoulders, Arms',
            exercises: [
              { name: 'Incline Dumbbell Press', sets: 4, reps: '8-12', restSec: 90, notes: 'Focus on upper chest' },
              { name: 'Lat Pulldowns', sets: 4, reps: '10-12', restSec: 90, notes: 'Squeeze lats' },
              { name: 'Overhead Dumbbell Press', sets: 3, reps: '10-12', restSec: 60, notes: 'Keep core tight' }
            ]
          },
          {
            day: 'Day 2 - Lower Body Focus',
            focus: 'Quadriceps, Hamstrings, Core',
            exercises: [
              { name: 'Barbell Squats', sets: 4, reps: '8-10', restSec: 120, notes: 'Maintain neutral spine' },
              { name: 'Romanian Deadlifts', sets: 3, reps: '10', restSec: 90, notes: 'Hinge at hips' }
            ]
          }
        ]
      },
      isCustomOverride: false,
      version: 1
    }
  ],

  progressLogs: [
    {
      _id: 'prog_1',
      userId: 'user_demo_1',
      date: new Date().toISOString().split('T')[0],
      mealsLogged: [
        { mealName: 'Breakfast', consumed: true, calories: 500 },
        { mealName: 'Lunch', consumed: true, calories: 650 },
        { mealName: 'Snack', consumed: false, calories: 300 },
        { mealName: 'Dinner', consumed: false, calories: 650 }
      ],
      waterMl: 1750,
      sleepHours: 8,
      workoutCompleted: true
    }
  ],

  chatLogs: [],
  adminLogs: []
};
