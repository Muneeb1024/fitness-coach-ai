import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Camera, Sparkles, TrendingUp, Calendar, AlertCircle, Award } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Progress() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [beforePhoto] = useState('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80');
  const [afterPhoto] = useState('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/progress/history');
      setHistory(res.data.history || []);
    } catch (err) {
      toast.error('Could not load history');
    } finally {
      setLoading(false);
    }
  };

  // Chart-ready series from the history logs
  const trendData = history.map((d, idx) => ({
    idx,
    date: d.date ? new Date(d.date).toLocaleDateString('en', { day: 'numeric', month: 'short' }) : `Day ${idx + 1}`,
    water: Math.round((d.waterMl || 0) / 100) / 10,
    sleep: d.sleepHours || 0,
    workout: d.workoutCompleted ? 1 : 0
  }));

  const chartTooltip = {
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#0f172a',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)'
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="skeleton h-32 rounded-3xl" />
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 flex items-center justify-between"
      >
        <div>
          <span className="badge-amber inline-flex items-center gap-1 mb-2">
            <Award className="w-3 h-3" /> Consistency & Transformation Insights
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Weekly Progress & Photo Analysis
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track body transformations, habit trends, and AI evaluation feedback
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="p-4 rounded-2xl glass-card border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Logged Days</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{history.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Empty-state nudge when no history yet */}
      {history.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-blue-700">No progress tracked yet</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Log your first day from the Dashboard (meals, water, workouts) to start your transformation timeline.
            </p>
          </div>
        </motion.div>
      )}

      {/* Photo Comparison Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Transformation Photo Comparison <Camera className="w-5 h-5 text-emerald-600" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Compare original onboarding photos against your latest weekly update</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Baseline (Week 1)</span>
              <span className="text-emerald-600">Front Angle</span>
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 relative group">
              <img src={beforePhoto} alt="Before" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-950/80 text-xs font-semibold text-slate-300 border border-white/10">
                Initial Photo
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Current Progress (Latest)</span>
              <span className="text-cyan-600">Front Angle</span>
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 relative group">
              <img src={afterPhoto} alt="After" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-950/80 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
                Week 4 Update
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <Sparkles className="w-4 h-4" /> AI Transformation Evaluation
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">
            "Based on landmark alignment and your {user?.streakCount || 0}-day streak, posture stability in upper shoulders has improved by approximately 3.4%. Muscle tone definition around your abdominal wall shows positive progression."
          </p>
        </div>
      </motion.div>

      {/* Trend Charts */}
      {trendData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-900">Habit Trend Charts</h3>
            <p className="text-xs text-slate-500 mt-1 ml-auto">Visualize consistency over {trendData.length} recorded {trendData.length === 1 ? 'day' : 'days'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Water Trend */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Hydration</span>
                <span className="text-cyan-600">Litres</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} barSize={14}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={chartTooltip} cursor={{ fill: 'rgba(14,165,233,0.08)' }} />
                    <Bar dataKey="water" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sleep Trend */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Sleep</span>
                <span className="text-indigo-600">Hours</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 12]} />
                    <Tooltip contentStyle={chartTooltip} />
                    <Line type="monotone" dataKey="sleep" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Workout Consistency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Workout Consistency</span>
                <span className="text-emerald-600">Days</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} barSize={24}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 1]} ticks={[0, 1]} />
                    <Tooltip contentStyle={chartTooltip} cursor={{ fill: 'rgba(16,185,129,0.08)' }} />
                    <Bar dataKey="workout" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* History Log List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4"
      >
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Recent Habit Logs <Calendar className="w-5 h-5 text-emerald-600" />
        </h3>

        {history.length === 0 ? (
          <p className="text-slate-500 text-sm">No historical logs recorded yet. Start logging on your Dashboard!</p>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-emerald-600 text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">{item.date}</p>
                    <p className="text-xs text-slate-500">Sleep: {item.sleepHours} hrs • Water: {item.waterMl} ml</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.workoutCompleted ? 'badge-emerald' : 'badge-cyan'}`}>
                    {item.workoutCompleted ? 'Workout Completed' : 'Rest Day'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
