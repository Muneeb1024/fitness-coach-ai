import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Sliders, User, Utensils, Dumbbell, Save } from 'lucide-react';

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
    <div className="flex min-h-[calc(100vh-73px)] bg-[#F3F6FB] text-slate-900">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="badge-purple inline-flex items-center gap-1.5 mb-2">
              <Sliders className="w-3.5 h-3.5" /> Plan Override Studio
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Custom Plan Override Studio</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manually edit routines, calories, macros & assign custom overrides directly to users</p>
          </div>

          <button
            onClick={handleSaveOverride}
            disabled={saving || !selectedUserId}
            className="btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Override...' : 'Publish Plan Override'}
          </button>
        </div>

        {/* User Picker */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-violet-600" /> Select Target User
          </label>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Choose User Account --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email}) - Goal: {u.goals?.primaryGoal || 'Maintenance'}
              </option>
            ))}
          </select>

          {selectedUserObj && (
            <p className="text-xs text-slate-500 mt-2">
              Selected: <span className="text-slate-900 font-bold">{selectedUserObj.name}</span> • Goal: <span className="text-emerald-600 font-bold">{selectedUserObj.goals?.primaryGoal || 'Maintenance'}</span> • Current BMI: {selectedUserObj.bodyMetrics?.estimatedBmi || 22.8}
            </p>
          )}
        </div>

        {/* Override Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Diet Override */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" /> Custom Diet & Macro Override
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Daily Calories (kcal)</label>
                <input
                  type="number"
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Protein (grams)</label>
                <input
                  type="number"
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Carbohydrates (grams)</label>
                <input
                  type="number"
                  value={carbsGrams}
                  onChange={(e) => setCarbsGrams(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Healthy Fats (grams)</label>
                <input
                  type="number"
                  value={fatGrams}
                  onChange={(e) => setFatGrams(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Workout Override */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-cyan-600" /> Custom Workout Split Override
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Routine Split Title</label>
                <input
                  type="text"
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Frequency (Days / Week)</label>
                <select
                  value={frequencyDaysPerWeek}
                  onChange={(e) => setFrequencyDaysPerWeek(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 mt-1 focus:outline-none focus:border-blue-500"
                >
                  <option value={3}>3 Days / Week</option>
                  <option value={4}>4 Days / Week</option>
                  <option value={5}>5 Days / Week</option>
                  <option value={6}>6 Days / Week</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Admin Notes for User</label>
                <input
                  type="text"
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}