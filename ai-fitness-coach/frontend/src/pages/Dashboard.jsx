import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Droplets, Dumbbell, Sparkles, CheckCircle2,
  Trophy, Activity, AlertCircle, Moon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

// Skeleton card loader
function SkeletonCard() {
  return <div className="skeleton h-36 rounded-3xl" />;
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs">
        <p className="text-slate-500">{label}</p>
        <p className="font-bold text-blue-600">{payload[0].value} {payload[0].unit}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user, updateUserState } = useAuth();
  const [progress, setProgress] = useState(null);
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [progRes, histRes, planRes] = await Promise.all([
        API.get('/progress/daily'),
        API.get('/progress/history'),
        API.get('/plan/my-plan').catch(() => ({ data: { plan: null } }))
      ]);
      setProgress(progRes.data.progress);
      setPlan(planRes.data.plan);

      // Build last 7 days of chart data
      const days = histRes.data.history?.slice(0, 7).reverse() || [];
      setHistory(days.map((d) => ({
        day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        water: Math.round((d.waterMl || 0) / 100) / 10,
        workout: d.workoutCompleted ? 1 : 0,
        sleep: d.sleepHours || 0
      })));
    } catch (err) {
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates, successMsg) => {
    if (!progress) return;
    const updKey = Object.keys(updates)[0];
    setUpdating(updKey);
    try {
      const res = await API.post('/progress/daily', { date: progress.date, ...updates });
      setProgress(res.data.progress);

      // Update streak in context
      if (res.data.streakCount && res.data.streakCount > (user?.streakCount || 0)) {
        updateUserState({ streakCount: res.data.streakCount });
        if (res.data.streakCount % 7 === 0) {
          toast.success(`🔥 ${res.data.streakCount}-Day Streak! You're unstoppable!`, { duration: 5000 });
        }
      }

      if (successMsg) toast.success(successMsg);
    } catch (err) {
      toast.error('Failed to update. Try again.');
    } finally {
      setUpdating('');
    }
  };

  const handleToggleMeal = (index) => {
    const updatedMeals = [...progress.mealsLogged];
    updatedMeals[index].consumed = !updatedMeals[index].consumed;
    const msg = updatedMeals[index].consumed
      ? `✅ ${updatedMeals[index].mealName} logged!`
      : null;
    updateProgress({ mealsLogged: updatedMeals }, msg);
  };

  const handleWaterAdd = (amount) => {
    const newWater = Math.max(0, (progress.waterMl || 0) + amount);
    const msg = amount > 0 ? `💧 +${amount}ml water logged!` : null;
    updateProgress({ waterMl: newWater }, msg);
  };

  const handleWorkoutToggle = () => {
    const done = !progress.workoutCompleted;
    updateProgress({ workoutCompleted: done }, done ? '💪 Workout completed! Great work!' : null);
  };

  // Dynamic calorie target calculation from active AI plan or body metrics
  const targetCalories = plan?.dietPlan?.dailyCalories || user?.goals?.dailyCalories || 2200;
  const consumedCalories = progress?.mealsLogged?.filter((m) => m.consumed).reduce((a, m) => a + (m.calories || 0), 0) || 0;
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));
  const waterPercent = Math.min(100, Math.round(((progress?.waterMl || 0) / 3000) * 100));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="skeleton h-40 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="badge-emerald inline-flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3 h-3" /> AI Fitness Engine Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
              <span className="text-blue-600">{user?.name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Goal: <span className="text-slate-700 font-semibold">{user?.goals?.primaryGoal || 'Maintenance'}</span>
              {' '}• BMI: <span className="text-emerald-600 font-semibold">{user?.bodyMetrics?.estimatedBmi || 22.8}</span>
              {' '}• Workout Split: <span className="text-cyan-600 font-semibold">{plan?.workoutPlan?.splitType || 'Upper / Lower Split'}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card px-5 py-4 rounded-2xl border border-slate-200 text-center"
            >
              <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-orange-600">
                <span className="fire-animate">🔥</span> {user?.streakCount || 0}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-semibold uppercase tracking-wider">Day Streak</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card px-5 py-4 rounded-2xl border border-slate-200 text-center hidden sm:block"
            >
              <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-emerald-600">
                <Trophy className="w-5 h-5" /> {user?.fitnessScore || 75}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-semibold uppercase tracking-wider">Fitness Score</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Medical Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs"
      >
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
        AI body metrics, BMI estimates and dietary recommendations are automated approximations and are not medically certified.
      </motion.div>

      {/* Today at a glance */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-panel px-4 py-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <span className="text-slate-500 font-bold uppercase tracking-wider">Today</span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold">
            🔥 {consumedCalories} kcal logged
          </span>
          <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1 rounded-full font-bold">
            💧 {((progress?.waterMl || 0) / 1000).toFixed(2)}L water
          </span>
          <span className={`border px-3 py-1 rounded-full font-bold ${
            progress?.workoutCompleted
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            💪 {progress?.workoutCompleted ? 'Workout done' : 'Workout pending'}
          </span>
        </div>
      </motion.div>

      {/* Three Dynamic Trackers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* Dynamic Calorie Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-3xl border border-slate-200 flex flex-col gap-4 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-emerald-600" /> Dynamic Calories
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{consumedCalories}/{targetCalories}</span>
          </div>

          {/* Circular progress */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="38" fill="none"
                  stroke="#2563EB" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - caloriePercent / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-slate-900">{caloriePercent}%</span>
                <span className="text-[9px] text-slate-500 font-semibold">of target</span>
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-emerald-600">{plan?.dietPlan?.macros?.proteinGrams || 150}g</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Protein</p>
              </div>
              <div className="py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-amber-600">{plan?.dietPlan?.macros?.carbsGrams || 220}g</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Carbs</p>
              </div>
              <div className="py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-violet-600">{plan?.dietPlan?.macros?.fatGrams || 70}g</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Fat</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center">
              {caloriePercent >= 100 ? '🎉 Calorie target reached!' : `${targetCalories - consumedCalories} kcal remaining`}
            </p>
          </div>
        </motion.div>

        {/* Dynamic Hydration Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 rounded-3xl border border-slate-200 flex flex-col gap-4 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Droplets className="w-4 h-4 text-cyan-600" /> Hydration
            </h3>
            <span className="text-xs text-cyan-600 font-bold">{((progress?.waterMl || 0) / 1000).toFixed(2)}L / 3.0L</span>
          </div>

          {/* Water level bar */}
          <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${waterPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-cyan-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 750].map((amt) => (
              <button
                key={amt}
                onClick={() => handleWaterAdd(amt)}
                disabled={updating === 'waterMl'}
                className="py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold hover:bg-cyan-100 transition-all active:scale-95 disabled:opacity-50"
              >
                +{amt}ml
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Workout Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-3xl border border-slate-200 flex flex-col gap-4 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Dumbbell className="w-4 h-4 text-violet-600" /> Today's Workout
            </h3>
            <span className={`text-xs font-bold ${progress?.workoutCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
              {progress?.workoutCompleted ? '✓ Done' : 'Pending'}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleWorkoutToggle}
            disabled={updating === 'workoutCompleted'}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              progress?.workoutCompleted
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {progress?.workoutCompleted ? 'Workout Finished ✓' : 'Mark as Complete'}
          </motion.button>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-slate-500">Sleep Log</p>
              <p className="text-sm font-bold text-slate-900">{progress?.sleepHours || 7} hrs</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Meal Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" /> Today's Dynamic AI Meal Plan
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {progress?.mealsLogged?.filter((m) => m.consumed).length || 0}/{progress?.mealsLogged?.length || 4} consumed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {progress?.mealsLogged?.map((meal, idx) => (
              <motion.div
                key={meal.mealName || idx}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggleMeal(idx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                  meal.consumed
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <p className={`font-bold text-sm ${meal.consumed ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {meal.mealName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{meal.calories} kcal</p>
                </div>

                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                  meal.consumed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 bg-white'
                }`}>
                  {meal.consumed && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Weekly Charts */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Water Chart */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600" /> Weekly Hydration (Litres)
            </h4>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={history}>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="water" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.18} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sleep Chart */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" /> Weekly Sleep (Hours)
            </h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={history} barSize={20}>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sleep" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}