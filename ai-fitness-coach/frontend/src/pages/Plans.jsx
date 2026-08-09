import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../services/api';
import { Sparkles, Utensils, Dumbbell, ShieldCheck, RefreshCw, AlertCircle, Clock } from 'lucide-react';

export default function Plans() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('diet');

  useEffect(() => {
    fetchMyPlan();
  }, []);

  const fetchMyPlan = async () => {
    try {
      const res = await API.get('/plan/my-plan');
      setPlan(res.data.plan);
    } catch (err) {
      toast.error('Could not load fitness plan');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    const toastId = toast.loading('Gemini AI is crafting your new routine...');
    try {
      const res = await API.post('/plan/regenerate');
      setPlan(res.data.plan);
      toast.success('Your new AI plan is ready! 🎉', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to regenerate plan', { id: toastId });
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="skeleton h-32 rounded-3xl" />
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }

  const diet = plan?.dietPlan;
  const workout = plan?.workoutPlan;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge-emerald flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Gemini AI Engine
            </span>
            {plan?.isCustomOverride && (
              <span className="badge-purple flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Admin Custom Overridden
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {plan?.title || 'Personalized AI Fitness Plan'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Version {plan?.version || 1} • Allergy-aware nutrition & customized workout split
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRegenerate}
          disabled={regenerating}
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-blue-600 ${regenerating ? 'animate-spin' : ''}`} />
          {regenerating ? 'Regenerating...' : 'Regenerate Plan'}
        </motion.button>
      </motion.div>

      {/* Disclaimer */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
        AI plans are automated recommendations and should be reviewed by a certified professional for medical or health conditions.
      </div>

      {/* Empty state when no AI plan exists yet */}
      {!plan ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-10 sm:p-14 rounded-3xl border border-slate-200 text-center"
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">No AI plan generated yet</h2>
          <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
            Complete your onboarding and the Gemini AI engine will craft your personalized diet & workout plan.
            Hit the button below to generate one now.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRegenerate}
            disabled={regenerating}
            className="btn-primary mt-6 inline-flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Generating...' : 'Generate My AI Plan'}
          </motion.button>
        </motion.div>
      ) : (
      <>
      {/* Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('diet')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'diet'
              ? 'bg-blue-600 text-white'
              : 'glass-card text-slate-500 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Utensils className="w-4 h-4" /> AI Diet Plan & Macros
        </button>
        <button
          onClick={() => setActiveTab('workout')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'workout'
              ? 'bg-blue-600 text-white'
              : 'glass-card text-slate-500 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Dumbbell className="w-4 h-4" /> Workout Schedule & Splits
        </button>
      </div>

      {/* DIET TAB */}
      {activeTab === 'diet' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Macro Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Daily Calories</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{diet?.dailyCalories || 2200}</p>
              <p className="text-[11px] text-slate-500 mt-1">kcal / day</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Protein Target</p>
              <p className="text-3xl font-extrabold text-cyan-600 mt-1">{diet?.macros?.proteinGrams || 150}g</p>
              <p className="text-[11px] text-slate-500 mt-1">Muscle Building</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Carbohydrates</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">{diet?.macros?.carbsGrams || 220}g</p>
              <p className="text-[11px] text-slate-500 mt-1">Energy & Stamina</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Healthy Fats</p>
              <p className="text-3xl font-extrabold text-violet-600 mt-1">{diet?.macros?.fatGrams || 70}g</p>
              <p className="text-[11px] text-slate-500 mt-1">Hormone Support</p>
            </div>
          </div>

          {/* Meals Schedule */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              Scheduled Daily Meals <Sparkles className="w-4 h-4 text-emerald-600" />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {diet?.meals?.map((meal, idx) => (
                <div key={idx} className="glass-card p-6 rounded-3xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge-emerald">{meal.name}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {meal.time}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-base">{meal.description}</p>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>🔥 {meal.calories} kcal</span>
                    <span>🍗 P: {meal.protein}g</span>
                    <span>🍞 C: {meal.carbs}g</span>
                    <span>🥑 F: {meal.fat}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* WORKOUT TAB */}
      {activeTab === 'workout' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-card p-6 rounded-3xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Routine Type</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{workout?.splitType || 'Upper / Lower Split'}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Frequency</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{workout?.frequencyDaysPerWeek || 4} Days / Week</p>
            </div>
          </div>

          <div className="space-y-5">
            {workout?.schedule?.map((daySplit, idx) => (
              <div key={idx} className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="font-extrabold text-slate-900 text-lg">{daySplit.day}</h4>
                  <span className="badge-emerald">
                    Focus: {daySplit.focus}
                  </span>
                </div>

                <div className="space-y-3">
                  {daySplit.exercises?.map((ex, exIdx) => (
                    <div key={exIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{ex.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{ex.notes}</p>
                      </div>
                      <div className="text-right text-xs">
                        <span className="font-bold text-emerald-600">{ex.sets} Sets</span> × <span className="text-slate-500">{ex.reps} Reps</span>
                        <p className="text-slate-500 text-[10px] mt-0.5">Rest: {ex.restSec}s</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      </>
      )}
    </div>
  );
}
