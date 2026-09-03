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
    const toastId = toast.loading('SoftnoveX AI engine is crafting your updated routine...');
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
        <div className="skeleton h-32 rounded-3xl bg-[#16181C]" />
        <div className="skeleton h-64 rounded-3xl bg-[#16181C]" />
      </div>
    );
  }

  const diet = plan?.dietPlan;
  const workout = plan?.workoutPlan;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-[#FEF9F5]">

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden bg-[#16181C] border border-slate-800"
      >
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge-fitgreen flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> SoftnoveX Gemini AI Plan Engine
            </span>
            {plan?.isCustomOverride && (
              <span className="badge-cyan flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Trainer Custom Override
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FEF9F5] uppercase tracking-wide">
            {plan?.title || 'Personalized AI Fitness Plan'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Version {plan?.version || 1} • Allergy-aware nutrition & biometric workout split
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRegenerate}
          disabled={regenerating}
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-[#B8FD02] ${regenerating ? 'animate-spin' : ''}`} />
          {regenerating ? 'Regenerating...' : 'Regenerate Plan'}
        </motion.button>
      </motion.div>

      {/* Disclaimer */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#16181C] border border-amber-500/30 text-amber-300 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
        AI plans are automated protocols designed for lifestyle optimization. Consult a medical professional before starting new exercise regimens.
      </div>

      {/* Empty state when no AI plan exists yet */}
      {!plan ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-10 sm:p-14 rounded-3xl text-center bg-[#16181C] border border-slate-800"
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#B8FD02]/15 border border-[#B8FD02]/40 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-[#B8FD02]" />
          </div>
          <h2 className="text-xl font-black text-[#FEF9F5] uppercase tracking-wide">No AI plan generated yet</h2>
          <p className="text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
            Complete your biometric photo scan and the Gemini AI engine will craft your personalized nutrition & workout plan.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRegenerate}
            disabled={regenerating}
            className="btn-primary mt-6 inline-flex items-center gap-2 disabled:opacity-60 uppercase tracking-wider"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Generating...' : 'Generate My AI Plan'}
          </motion.button>
        </motion.div>
      ) : (
      <>
      {/* Tabs */}
      <div className="flex gap-3 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('diet')}
          className={`px-5 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 uppercase tracking-wider ${
            activeTab === 'diet'
              ? 'btn-primary'
              : 'btn-secondary text-slate-400 hover:text-[#FEF9F5]'
          }`}
        >
          <Utensils className="w-4 h-4" /> AI Diet Plan & Macros
        </button>
        <button
          onClick={() => setActiveTab('workout')}
          className={`px-5 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 uppercase tracking-wider ${
            activeTab === 'workout'
              ? 'btn-primary'
              : 'btn-secondary text-slate-400 hover:text-[#FEF9F5]'
          }`}
        >
          <Dumbbell className="w-4 h-4" /> Workout Splits & Schedule
        </button>
      </div>

      {/* DIET TAB */}
      {activeTab === 'diet' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl text-center card-hover bg-[#16181C] border border-slate-800">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Energy</p>
              <p className="text-3xl font-black text-[#FEF9F5] mt-1">{diet?.dailyCalories || 2200}</p>
              <p className="text-[11px] text-[#B8FD02] font-black mt-1 uppercase">kcal / day</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center card-hover bg-[#16181C] border border-slate-800">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Protein Target</p>
              <p className="text-3xl font-black text-[#B8FD02] mt-1">{diet?.macros?.proteinGrams || 150}g</p>
              <p className="text-[11px] text-slate-400 mt-1 font-bold">Muscle Synthesis</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center card-hover bg-[#16181C] border border-slate-800">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Carbohydrates</p>
              <p className="text-3xl font-black text-amber-400 mt-1">{diet?.macros?.carbsGrams || 220}g</p>
              <p className="text-[11px] text-slate-400 mt-1 font-bold">Glycogen Replenish</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center card-hover bg-[#16181C] border border-slate-800">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Healthy Lipids</p>
              <p className="text-3xl font-black text-[#FEF9F5] mt-1">{diet?.macros?.fatGrams || 70}g</p>
              <p className="text-[11px] text-slate-400 mt-1 font-bold">Hormone Health</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-lg text-[#FEF9F5] flex items-center gap-2 uppercase tracking-wide">
              Daily Nutrition Protocols <Sparkles className="w-4 h-4 text-[#B8FD02]" />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {diet?.meals?.map((meal, idx) => (
                <div key={idx} className="glass-card p-6 rounded-3xl space-y-3 card-hover bg-[#16181C] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="badge-fitgreen">{meal.name}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {meal.time}
                    </span>
                  </div>

                  <p className="font-bold text-[#FEF9F5] text-base">{meal.description}</p>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bold">
                    <span>🔥 {meal.calories} kcal</span>
                    <span className="text-[#B8FD02]">🍗 P: {meal.protein}g</span>
                    <span className="text-amber-400">🍞 C: {meal.carbs}g</span>
                    <span className="text-slate-300">🥑 F: {meal.fat}g</span>
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
          <div className="glass-card p-6 rounded-3xl flex items-center justify-between bg-[#16181C] border border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Protocol Architecture</p>
              <h3 className="text-xl font-black text-[#FEF9F5] mt-0.5">{workout?.splitType || 'Upper / Lower Split'}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weekly Volume</p>
              <p className="text-xl font-black text-[#B8FD02] mt-0.5">{workout?.frequencyDaysPerWeek || 4} Training Days</p>
            </div>
          </div>

          <div className="space-y-5">
            {workout?.schedule?.map((daySplit, idx) => (
              <div key={idx} className="glass-card p-6 rounded-3xl space-y-4 bg-[#16181C] border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-black text-[#FEF9F5] text-lg uppercase">{daySplit.day}</h4>
                  <span className="badge-fitgreen">
                    Target: {daySplit.focus}
                  </span>
                </div>

                <div className="space-y-3">
                  {daySplit.exercises?.map((ex, exIdx) => (
                    <div key={exIdx} className="p-4 rounded-2xl bg-[#0B0C0E] border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#FEF9F5] text-sm">{ex.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{ex.notes}</p>
                      </div>
                      <div className="text-right text-xs">
                        <span className="font-black text-[#B8FD02]">{ex.sets} Sets</span> × <span className="text-slate-300 font-bold">{ex.reps} Reps</span>
                        <p className="text-slate-400 text-[10px] mt-0.5 font-semibold">Rest: {ex.restSec}s</p>
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
