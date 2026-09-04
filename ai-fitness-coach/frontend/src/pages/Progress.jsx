import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Camera, Sparkles, TrendingUp, Calendar, Award, Scale, Lock } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, ComposedChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';

export default function Progress() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Visual comparison uses the member's OWN uploaded snapshot (no stock photos).
  const ownPhoto = ['front', 'back', 'left', 'right']
    .map((k) => user?.profileImages?.[k])
    .find(Boolean) || null;
  const [beforePhoto] = useState(ownPhoto);
  const [afterPhoto] = useState(ownPhoto);

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

  const trendData = history.map((d, idx) => ({
    idx,
    date: d.date ? new Date(d.date).toLocaleDateString('en', { day: 'numeric', month: 'short' }) : `Day ${idx + 1}`,
    water: Math.round((d.waterMl || 0) / 100) / 10,
    sleep: d.sleepHours || 0,
    workout: d.workoutCompleted ? 1 : 0,
    weightKg: d.weightKg || null
  }));

  const chartTooltip = {
    backgroundColor: '#16181C',
    border: '1px solid #334155',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#FEF9F5',
    boxShadow: '0 12px 32px rgba(0,0,0,0.7)'
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="skeleton h-32 rounded-3xl bg-[#16181C]" />
        <div className="skeleton h-64 rounded-3xl bg-[#16181C]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-[#FEF9F5]">

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl flex items-center justify-between bg-[#16181C] border border-slate-800"
      >
        <div>
          <span className="badge-fitgreen inline-flex items-center gap-1 mb-2">
            <Award className="w-3 h-3" /> Consistency & Transformation Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FEF9F5] uppercase tracking-wide">
            Weekly Progress & Biometric Timeline
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track body composition shifts, habit trends, and AI posture feedback
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="p-4 rounded-2xl glass-card text-center bg-[#0B0C0E] border border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged Days</p>
            <p className="text-2xl font-black text-[#B8FD02] mt-0.5">{history.length}</p>
          </div>
        </div>
      </motion.div>

      {history.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 space-y-4"
        >
          <div className="w-16 h-16 rounded-3xl bg-[#B8FD02]/15 border border-[#B8FD02]/30 flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-[#B8FD02]" />
          </div>
          <h3 className="text-xl font-black text-[#FEF9F5] uppercase">No Progress Logged Yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            Head to your Dashboard and start logging meals, hydration, and workouts. Your biometric timeline will appear here.
          </p>
          <a href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B8FD02] text-[#0B0C0E] font-black text-sm uppercase tracking-wider hover:bg-[#CCFF00] transition-colors">
            Start Logging Today
          </a>
        </motion.div>
      )}

      {/* Weight Trend Chart — Hero Section */}
      {trendData.some((d) => d.weightKg) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 bg-[#16181C] border border-[#B8FD02]/30"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="badge-fitgreen inline-flex items-center gap-1.5 mb-2">
                <Scale className="w-3 h-3" /> Weight Trend Timeline
              </span>
              <h3 className="text-xl font-black text-[#FEF9F5] uppercase tracking-wide">Body Weight Progress</h3>
              <p className="text-xs text-slate-400 mt-1">Daily weigh-ins vs your target weight</p>
            </div>
            {user?.goals?.targetWeightKg && (
              <div className="bg-[#0B0C0E] border border-slate-800 px-4 py-3 rounded-2xl text-right shrink-0">
                <p className="text-xs text-slate-400 font-bold uppercase">Target</p>
                <p className="text-xl font-black text-[#B8FD02]">{user.goals.targetWeightKg} kg</p>
              </div>
            )}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#16181C', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#B8FD02' }}
              />
              {user?.goals?.targetWeightKg && (
                <ReferenceLine
                  y={user.goals.targetWeightKg}
                  stroke="rgba(184,253,2,0.4)"
                  strokeDasharray="6 3"
                  label={{ value: `Goal: ${user.goals.targetWeightKg}kg`, fill: '#B8FD02', fontSize: 10, position: 'insideTopRight' }}
                />
              )}
              <Line type="monotone" dataKey="weightKg" stroke="#B8FD02" strokeWidth={2.5} dot={{ r: 5, fill: '#B8FD02', strokeWidth: 0 }} connectNulls />
              <Scatter dataKey="weightKg" fill="#B8FD02" r={5} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Photo Comparison Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 bg-[#16181C] border border-slate-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-[#FEF9F5] flex items-center gap-2 uppercase tracking-wide">
              Visual Transformation Comparison <Camera className="w-5 h-5 text-[#B8FD02]" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Compare baseline posture scan against your current weekly update</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Baseline (Week 1)</span>
              <span className="text-[#B8FD02]">Front Angle</span>
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 relative group bg-[#0B0C0E]">
              {beforePhoto ? (
                <img src={beforePhoto} alt="Your baseline snapshot" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                  <Camera className="w-6 h-6 text-slate-500" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">Add a body snapshot in Profile → Body Snapshot to enable visual comparison</p>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-[#0B0C0E]/90 text-xs font-bold text-slate-300 border border-slate-700">
                Your Baseline Snapshot
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Current Progress (Latest)</span>
              <span className="text-[#B8FD02]">Front Angle</span>
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 relative group bg-[#0B0C0E]">
              {afterPhoto ? (
                <img src={afterPhoto} alt="Your latest snapshot" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                  <Camera className="w-6 h-6 text-slate-500" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">Update your snapshot over time and compare it here side by side</p>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-[#0B0C0E]/90 text-xs font-black text-[#B8FD02] border border-[#B8FD02]/40">
                Your Latest Snapshot
              </div>
            </div>
          </div>
        </div>

        {/* Consistency Note */}
        <div className="p-6 rounded-2xl bg-[#0B0C0E] border border-[#B8FD02]/30 space-y-2">
          <div className="flex items-center gap-2 text-[#B8FD02] font-black text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Consistency Snapshot
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Your current streak is {user?.streakCount || 0} day{user?.streakCount === 1 ? '' : 's'}. Photo-to-photo visual comparison and vision-based
            body measurements are not available yet — keep logging your habits and updating your snapshot to track real progress over time.
          </p>
        </div>
      </motion.div>

      {/* Trend Charts */}
      {trendData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 bg-[#16181C] border border-slate-800"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#B8FD02]" />
            <h3 className="text-xl font-black text-[#FEF9F5] uppercase tracking-wide">Habit & Recovery Analytics</h3>
            <p className="text-xs text-slate-400 mt-1 ml-auto">Consistency across {trendData.length} recorded {trendData.length === 1 ? 'day' : 'days'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Hydration</span>
                <span className="text-[#B8FD02]">Litres</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} barSize={14}>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={chartTooltip} cursor={{ fill: 'rgba(184,253,2,0.1)' }} />
                    <Bar dataKey="water" fill="#B8FD02" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Sleep Recovery</span>
                <span className="text-[#FEF9F5]">Hours</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 12]} />
                    <Tooltip contentStyle={chartTooltip} />
                    <Line type="monotone" dataKey="sleep" stroke="#FEF9F5" strokeWidth={2.5} dot={{ r: 4, fill: '#B8FD02', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Workout Adherence</span>
                <span className="text-[#B8FD02]">Completion</span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} barSize={24}>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 1]} ticks={[0, 1]} />
                    <Tooltip contentStyle={chartTooltip} cursor={{ fill: 'rgba(184,253,2,0.1)' }} />
                    <Bar dataKey="workout" fill="#B8FD02" radius={[6, 6, 0, 0]} />
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
        className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 bg-[#16181C] border border-slate-800"
      >
        <h3 className="text-xl font-black text-[#FEF9F5] flex items-center gap-2 uppercase tracking-wide">
          Daily Log Archive <Calendar className="w-5 h-5 text-[#B8FD02]" />
        </h3>

        {history.length === 0 ? (
          <p className="text-slate-400 text-sm">No historical logs recorded yet. Start logging on your Dashboard!</p>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#0B0C0E] border border-slate-800 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#B8FD02]/15 border border-[#B8FD02]/30 flex items-center justify-center font-black text-[#B8FD02] text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-[#FEF9F5]">{item.date}</p>
                    <p className="text-xs text-slate-400">Sleep: {item.sleepHours} hrs • Water: {item.waterMl} ml</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${item.workoutCompleted ? 'badge-fitgreen' : 'bg-[#16181C] text-slate-400 border border-slate-800'}`}>
                    {item.workoutCompleted ? 'Workout Finished' : 'Rest Day'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      {/* Badges Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 bg-[#16181C] border border-slate-800"
      >
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#B8FD02]" />
          <h3 className="text-xl font-black text-[#FEF9F5] uppercase tracking-wide">Achievements</h3>
        </div>

        {(() => {
          const BADGE_DEFS = [
            { id: 'first_log', name: 'Day One', emoji: '🌱', desc: 'Complete your first daily log' },
            { id: 'ignition', name: 'Ignition', emoji: '🔥', desc: 'Log your first workout' },
            { id: 'week_streak', name: 'Week Crusher', emoji: '⚡', desc: '7-day streak' },
            { id: 'warrior', name: 'Warrior', emoji: '🏆', desc: '30-day streak' },
            { id: 'hydration_hero', name: 'Hydration Hero', emoji: '💧', desc: '7 days with 2L+ water' },
            { id: 'body_check', name: 'Body Check', emoji: '📸', desc: 'Complete all 4 posture photos' },
            { id: 'on_target', name: 'On Target', emoji: '🎯', desc: 'Hit calorie goal 5 days in a row' },
            { id: 'sleep_champion', name: 'Sleep Champion', emoji: '😴', desc: '5 nights of 7h+ sleep' },
          ];
          const earned = new Set((user?.badges || []).map((b) => b.id));
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BADGE_DEFS.map((badge) => {
                const isEarned = earned.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      isEarned
                        ? 'bg-[#B8FD02]/10 border-[#B8FD02]/40'
                        : 'bg-[#0B0C0E] border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{isEarned ? badge.emoji : '🔒'}</div>
                    <p className={`text-xs font-black uppercase tracking-wide ${isEarned ? 'text-[#B8FD02]' : 'text-slate-500'}`}>
                      {badge.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{badge.desc}</p>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </motion.div>

      {/* Bottom padding for mobile nav */}
      <div className="h-20 sm:h-4" />
    </div>
  );
}
