import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../services/api';
import { Sliders, User, Utensils, Dumbbell, Save, Sparkles, AlertCircle } from 'lucide-react';

export default function PlanOverride() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedUserId = queryParams.get('userId');

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(preselectedUserId || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable Plan State
  const [dailyCalories, setDailyCalories] = useState(2400);
  const [proteinGrams, setProteinGrams] = useState(165);
  const [carbsGrams, setCarbsGrams] = useState(240);
  const [fatGrams, setFatGrams] = useState(75);
  const [splitType, setSplitType] = useState('Upper / Lower Body Split');
  const [frequencyDaysPerWeek, setFrequencyDaysPerWeek] = useState(4);
  const [overrideNotes, setOverrideNotes] = useState('Manually tailored plan override by Administrator');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      const uList = res.data.users || [];
      setUsers(uList);
      if (!selectedUserId && uList.length > 0) {
        setSelectedUserId(uList[0]._id);
      }
    } catch (err) {
      toast.error('Could not fetch users list');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOverride = async () => {
    if (!selectedUserId) return toast.error('Please select a target user');

    setSaving(true);
    const toastId = toast.loading('Applying custom plan override...');

    try {
      const payload = {
        dietPlan: {
          dailyCalories: Number(dailyCalories),
          macros: {
            proteinGrams: Number(proteinGrams),
            carbsGrams: Number(carbsGrams),
            fatGrams: Number(fatGrams)
          },
          meals: [
            { name: 'Breakfast', time: '08:00 AM', description: 'Custom Power Breakfast', calories: Math.round(dailyCalories * 0.25), protein: Math.round(proteinGrams * 0.25), carbs: Math.round(carbsGrams * 0.25), fat: Math.round(fatGrams * 0.25) },
            { name: 'Lunch', time: '01:00 PM', description: 'Custom Clean Lunch', calories: Math.round(dailyCalories * 0.35), protein: Math.round(proteinGrams * 0.35), carbs: Math.round(carbsGrams * 0.35), fat: Math.round(fatGrams * 0.35) },
            { name: 'Snack', time: '04:30 PM', description: 'Custom High Protein Snack', calories: Math.round(dailyCalories * 0.15), protein: Math.round(proteinGrams * 0.15), carbs: Math.round(carbsGrams * 0.15), fat: Math.round(fatGrams * 0.15) },
            { name: 'Dinner', time: '07:30 PM', description: 'Custom Recovery Dinner', calories: Math.round(dailyCalories * 0.25), protein: Math.round(proteinGrams * 0.25), carbs: Math.round(carbsGrams * 0.25), fat: Math.round(fatGrams * 0.25) }
          ]
        },
        workoutPlan: {
          splitType,
          frequencyDaysPerWeek: Number(frequencyDaysPerWeek),
          schedule: [
            {
              day: 'Day 1 - Push Focus',
              focus: 'Chest & Shoulders',
              exercises: [
                { name: 'Custom Barbell Press', sets: 4, reps: '8-12', restSec: 90, notes: 'Admin custom exercise' },
                { name: 'Overhead Press', sets: 3, reps: '10-12', restSec: 60, notes: 'Focus on form' }
              ]
            }
          ]
        },
        notes: overrideNotes
      };

      await API.put(`/admin/plans/${selectedUserId}/override`, payload);
      toast.success('Custom Plan Override assigned successfully! 🎉', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to override plan', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const selectedUserObj = users.find((u) => String(u._id) === String(selectedUserId));

  return (
    <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden min-w-0 text-[#FEF9F5]">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#B8FD02]/15 border border-[#B8FD02]/40 text-[#B8FD02] text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Plan Override Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FEF9F5] tracking-tight uppercase">
              Custom Plan Override Studio
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Manually edit workout splits, caloric targets & macros to assign personalized overrides
            </p>
          </div>

          <button
            onClick={handleSaveOverride}
            disabled={saving || !selectedUserId}
            className="btn-primary text-xs px-5 py-2.5 uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-[#B8FD02]/20"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Publishing Override...' : 'Publish Plan Override'}
          </button>
        </motion.div>

        {/* User Picker */}
        <div className="glass-card p-6 rounded-3xl bg-[#16181C] border border-slate-800 space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[#B8FD02]" /> Select Target Athlete Account
          </label>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="input-field bg-[#0B0C0E] text-xs"
          >
            <option value="">-- Choose User Account --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email}) — Goal: {u.goals?.primaryGoal || 'Maintenance'}
              </option>
            ))}
          </select>

          {selectedUserObj && (
            <div className="p-3 rounded-2xl bg-[#0B0C0E] border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Active Target:</span>
              <strong className="text-[#FEF9F5]">{selectedUserObj.name}</strong>
              <span className="text-[#B8FD02] font-black uppercase">• Goal: {selectedUserObj.goals?.primaryGoal || 'Maintenance'}</span>
              <span className="text-cyan-400 font-bold">• BMI: {selectedUserObj.bodyMetrics?.estimatedBmi || 22.8}</span>
              <span className="text-slate-400">• Weight: {selectedUserObj.bodyMetrics?.weightKg || 70}kg</span>
            </div>
          )}
        </div>

        {/* Override Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Diet Override */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-4">
            <h3 className="font-black text-[#FEF9F5] text-sm uppercase tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#B8FD02]" /> Custom Diet & Macro Target Override
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Daily Energy (kcal)</label>
                <input
                  type="number"
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(e.target.value)}
                  className="input-field mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Protein (g)</label>
                <input
                  type="number"
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(e.target.value)}
                  className="input-field mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Carbohydrates (g)</label>
                <input
                  type="number"
                  value={carbsGrams}
                  onChange={(e) => setCarbsGrams(e.target.value)}
                  className="input-field mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Healthy Fats (g)</label>
                <input
                  type="number"
                  value={fatGrams}
                  onChange={(e) => setFatGrams(e.target.value)}
                  className="input-field mt-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Workout Override */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-4">
            <h3 className="font-black text-[#FEF9F5] text-sm uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-cyan-400" /> Custom Workout Split Override
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Routine Split Title</label>
                <input
                  type="text"
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="input-field mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Frequency (Days / Week)</label>
                <select
                  value={frequencyDaysPerWeek}
                  onChange={(e) => setFrequencyDaysPerWeek(e.target.value)}
                  className="input-field bg-[#0B0C0E] mt-1 text-xs"
                >
                  <option value={3}>3 Days / Week</option>
                  <option value={4}>4 Days / Week</option>
                  <option value={5}>5 Days / Week</option>
                  <option value={6}>6 Days / Week</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Admin Coaching Notes for Athlete</label>
                <input
                  type="text"
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  className="input-field mt-1 text-xs"
                />
              </div>
            </div>
          </div>

        </div>
    </main>
  );
}