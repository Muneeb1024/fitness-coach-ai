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
import QuickLogSheet from '../components/QuickLogSheet';
import DailyInsightCard from '../components/DailyInsightCard';
import MacroRings from '../components/MacroRings';
import ProfileStrengthBar from '../components/ProfileStrengthBar';
import DateNavigator from '../components/DateNavigator';

function SkeletonCard() {
  return <div className="skeleton h-36 rounded-3xl bg-[#16181C]" />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#16181C] px-3.5 py-2 rounded-xl border border-slate-700 shadow-xl text-xs text-[#FEF9F5]">
        <p className="text-slate-400 text-[10px] uppercase font-bold">{label}</p>
        <p className="font-black text-[#B8FD02]">{payload[0].value} {payload[0].unit || ''}</p>
      </div>
    );
  }
  return null;
};

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Dashboard() {
  const { user, updateUserState } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [progress, setProgress] = useState(null);
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [rawHistory, setRawHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [dateLoading, setDateLoading] = useState(false);
  const [updating, setUpdating] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoadError('');
    try {
      const [progRes, histRes, planRes] = await Promise.all([
        API.get(`/progress/daily?date=${selectedDate}`),
        API.get('/progress/history'),
        API.get('/plan/my-plan').catch(() => ({ data: { plan: null } }))
      ]);
      setProgress(progRes.data.progress);
      setPlan(planRes.data.plan);
      setRawHistory(histRes.data.history || []);

      const days = histRes.data.history?.slice(0, 7).reverse() || [];
      setHistory(days.map((d) => ({
        day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        water: Math.round((d.waterMl || 0) / 100) / 10,
        workout: d.workoutCompleted ? 1 : 0,
        sleep: d.sleepHours || 0
      })));
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load dashboard data. Check your connection and try again.';
      setLoadError(msg);
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (newDate) => {
    setSelectedDate(newDate);
    setDateLoading(true);
    try {
      const res = await API.get(`/progress/daily?date=${newDate}`);
      setProgress(res.data.progress);
    } catch (err) {
      toast.error('Failed to load records for selected date');
    } finally {
      setDateLoading(false);
    }
  };

  const updateProgress = async (updates, successMsg) => {
    if (!progress) return;
    const updKey = Object.keys(updates)[0];
    setUpdating(updKey);
    try {
      const res = await API.post('/progress/daily', { date: progress.date, ...updates });
      setProgress(res.data.progress);

      if (res.data.streakCount && res.data.streakCount > (user?.streakCount || 0)) {
        updateUserState({ streakCount: res.data.streakCount });
        if (res.data.streakCount % 7 === 0) {
          toast.success(`🔥 ${res.data.streakCount}-Day Streak! You're unstoppable!`, { duration: 5000 });
        }
      }

      // Badge notifications
      if (res.data.newBadges?.length) {
        res.data.newBadges.forEach((badge) => {
          toast.success(`${badge.emoji} Badge Earned: ${badge.name}!`, { duration: 6000 });
        });
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

  const targetCalories = plan?.dietPlan?.dailyCalories || user?.goals?.dailyCalories || 2200;
  const consumedCalories = progress?.mealsLogged?.filter((m) => m.consumed).reduce((a, m) => a + (m.calories || 0), 0) || 0;
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));
  const waterPercent = Math.min(100, Math.round(((progress?.waterMl || 0) / 3000) * 100));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="skeleton h-40 rounded-3xl bg-[#16181C]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="skeleton h-64 rounded-3xl bg-[#16181C]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-[#FEF9F5]">

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{loadError}</span>
          <button
            onClick={fetchData}
            className="px-4 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-[#16181C] border border-slate-800"
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="badge-fitgreen inline-flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3 h-3" /> SoftnoveX AI Fitness Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FEF9F5] tracking-tight uppercase">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
              <span className="text-[#B8FD02]">{user?.name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Goal: <span className="text-[#FEF9F5] font-bold">{user?.goals?.primaryGoal || 'Maintenance'}</span>
              {' '}• BMI: <span className="text-[#B8FD02] font-black">{user?.bodyMetrics?.estimatedBmi || 22.8}</span>
              {' '}• Routine: <span className="text-slate-300 font-bold">{plan?.workoutPlan?.splitType || 'Upper / Lower Split'}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card px-5 py-4 rounded-2xl text-center bg-[#0B0C0E] border border-slate-800"
            >
              <div className="flex items-center justify-center gap-1 text-2xl font-black text-orange-400">
                <span className="fire-animate">🔥</span> {user?.streakCount || 0}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Day Streak</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card px-5 py-4 rounded-2xl text-center hidden sm:block bg-[#0B0C0E] border border-slate-800"
            >
              <div className="flex items-center justify-center gap-1 text-2xl font-black text-[#B8FD02]">
                <Trophy className="w-5 h-5" /> {user?.fitnessScore || 75}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Fitness Score</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#16181C] border border-amber-500/30 text-amber-300 text-xs"
      >
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
        AI biometric estimation and nutrition algorithms provide lifestyle approximations and do not constitute clinical medical advice.
      </motion.div>

      {/* Interactive Date Switcher & Historical Strip */}
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        history={rawHistory}
      />

      {/* AI Daily Insight */}
      <DailyInsightCard />

      {/* Profile Completion */}
      <ProfileStrengthBar />

      {/* Today at a glance */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-panel px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs bg-[#16181C] border border-slate-800"
      >
        <span className="text-slate-400 font-bold uppercase tracking-wider">
          {selectedDate === getTodayStr() ? "Today's Protocol" : `Protocol: ${selectedDate}`}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#B8FD02]/15 text-[#B8FD02] border border-[#B8FD02]/40 px-3 py-1 rounded-full font-black uppercase">
            🔥 {consumedCalories} kcal logged
          </span>
          <span className="bg-[#FEF9F5]/10 text-[#FEF9F5] border border-slate-700 px-3 py-1 rounded-full font-bold">
            💧 {((progress?.waterMl || 0) / 1000).toFixed(2)}L water
          </span>
          <span className={`border px-3 py-1 rounded-full font-bold ${
            progress?.workoutCompleted
              ? 'bg-[#B8FD02]/15 text-[#B8FD02] border-[#B8FD02]/40'
              : 'bg-[#0B0C0E] text-slate-400 border-slate-800'
          }`}>
            💪 {progress?.workoutCompleted ? 'Workout completed' : 'Workout pending'}
          </span>
        </div>
      </motion.div>

      {/* Three Trackers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* Calorie Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-3xl flex flex-col gap-4 card-hover bg-[#16181C] border border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#FEF9F5] flex items-center gap-2 text-sm uppercase tracking-wide">
              <Activity className="w-4 h-4 text-[#B8FD02]" /> Energy Target
            </h3>
            <span className="text-xs text-slate-400 font-bold">{consumedCalories} / {targetCalories} kcal</span>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="#23272F" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="38" fill="none"
                  stroke="#B8FD02" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - caloriePercent / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[#FEF9F5]">{caloriePercent}%</span>
                <span className="text-[9px] text-[#B8FD02] font-bold">consumed</span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <MacroRings
              consumed={{
                protein: Math.round((consumedCalories * 0.3) / 4),
                carbs: Math.round((consumedCalories * 0.45) / 4),
                fat: Math.round((consumedCalories * 0.25) / 9)
              }}
              targets={{
                proteinGrams: plan?.dietPlan?.macros?.proteinGrams || 150,
                carbsGrams: plan?.dietPlan?.macros?.carbsGrams || 220,
                fatGrams: plan?.dietPlan?.macros?.fatGrams || 70
              }}
            />
            <p className="text-xs text-slate-400 text-center font-medium mt-3">
              {caloriePercent >= 100 ? '🎉 Calorie target reached!' : `${targetCalories - consumedCalories} kcal remaining`}
            </p>
          </div>
        </motion.div>

        {/* Hydration Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 rounded-3xl flex flex-col gap-4 card-hover bg-[#16181C] border border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#FEF9F5] flex items-center gap-2 text-sm uppercase tracking-wide">
              <Droplets className="w-4 h-4 text-[#B8FD02]" /> Daily Hydration
            </h3>
            <span className="text-xs text-[#B8FD02] font-black">{((progress?.waterMl || 0) / 1000).toFixed(2)}L / 3.0L</span>
          </div>

          <div className="w-full bg-[#23272F] h-4 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${waterPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-[#B8FD02]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 750].map((amt) => (
              <button
                key={amt}
                onClick={() => handleWaterAdd(amt)}
                disabled={updating === 'waterMl'}
                className="py-2.5 rounded-xl bg-[#0B0C0E] border border-slate-800 text-[#B8FD02] text-xs font-black hover:border-[#B8FD02] transition-all active:scale-95 disabled:opacity-50"
              >
                +{amt}ml
              </button>
            ))}
          </div>
        </motion.div>

        {/* Workout Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-3xl flex flex-col gap-4 card-hover bg-[#16181C] border border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[#FEF9F5] flex items-center gap-2 text-sm uppercase tracking-wide">
              <Dumbbell className="w-4 h-4 text-[#B8FD02]" /> Training Session
            </h3>
            <span className={`text-xs font-black ${progress?.workoutCompleted ? 'text-[#B8FD02]' : 'text-slate-400'}`}>
              {progress?.workoutCompleted ? '✓ Done' : 'Pending'}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleWorkoutToggle}
            disabled={updating === 'workoutCompleted'}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
              progress?.workoutCompleted
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {progress?.workoutCompleted ? 'Workout Finished ✓' : 'Mark as Completed'}
          </motion.button>

          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#0B0C0E] border border-slate-800">
            <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Night Sleep Log</p>
              <p className="text-sm font-black text-[#FEF9F5]">{progress?.sleepHours || 7} hrs recorded</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Meal Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 bg-[#16181C] border border-slate-800"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg text-[#FEF9F5] flex items-center gap-2 uppercase tracking-wide">
            <Sparkles className="w-5 h-5 text-[#B8FD02]" /> Daily AI Meal Schedule
          </h3>
          <span className="text-xs text-slate-400 font-bold">
            {progress?.mealsLogged?.filter((m) => m.consumed).length || 0}/{progress?.mealsLogged?.length || 4} logged
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
                    ? 'bg-[#B8FD02]/15 border-[#B8FD02]/50'
                    : 'bg-[#0B0C0E] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <p className={`font-bold text-sm ${meal.consumed ? 'text-[#B8FD02]' : 'text-[#FEF9F5]'}`}>
                    {meal.mealName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{meal.calories} kcal</p>
                </div>

                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                  meal.consumed
                    ? 'bg-[#B8FD02] border-[#B8FD02] text-[#0B0C0E]'
                    : 'border-slate-700 bg-[#16181C]'
                }`}>
                  {meal.consumed && <CheckCircle2 className="w-4 h-4 font-black" />}
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
          <div className="glass-card p-6 rounded-3xl space-y-4 bg-[#16181C] border border-slate-800">
            <h4 className="font-black text-sm text-[#FEF9F5] flex items-center gap-2 uppercase tracking-wide">
              <Droplets className="w-4 h-4 text-[#B8FD02]" /> Weekly Hydration (Litres)
            </h4>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={history}>
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="water" stroke="#B8FD02" fill="#B8FD02" fillOpacity={0.25} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4 bg-[#16181C] border border-slate-800">
            <h4 className="font-black text-sm text-[#FEF9F5] flex items-center gap-2 uppercase tracking-wide">
              <Moon className="w-4 h-4 text-[#B8FD02]" /> Weekly Sleep Recovery (Hours)
            </h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={history} barSize={20}>
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sleep" fill="#B8FD02" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Quick Log Bottom Sheet */}
      <QuickLogSheet
        progress={progress}
        onUpdate={async (updates, label) => {
          await updateProgress(updates, label);
        }}
      />

      {/* Bottom padding for mobile nav */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}