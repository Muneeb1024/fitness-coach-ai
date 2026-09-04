import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  User as UserIcon, Activity, Dumbbell, Utensils, HeartPulse,
  Camera, ShieldCheck, Download, RefreshCw, Save, CheckCircle2,
  AlertCircle, Sparkles, Scale, Clock, Award
} from 'lucide-react';

const DIET_STYLES = ['Balanced', 'High Protein', 'Halal', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'];
const COMMON_ALLERGIES = ['Dairy/Lactose', 'Gluten', 'Peanuts', 'Tree Nuts', 'Shellfish', 'Soy', 'Eggs'];
const EQUIPMENT_LIST = ['Full Commercial Gym', 'Barbell & Plates', 'Dumbbells', 'Adjustable Bench', 'Pull-up Bar', 'Resistance Bands', 'Cable Machine', 'Kettlebells', 'Bodyweight Only'];
const INJURIES_LIST = ['Lower Back Pain', 'Knee Joint Issues', 'Shoulder Impingement', 'Wrist Strain', 'Neck/Cervical Tension', 'None'];
const GOALS_LIST = [
  { id: 'weight_loss', label: 'Weight Loss & Fat Shred', emoji: '🔥' },
  { id: 'muscle_gain', label: 'Hypertrophy & Muscle Gain', emoji: '💪' },
  { id: 'maintenance', label: 'Fitness & Body Maintenance', emoji: '⚖️' },
  { id: 'athletic', label: 'Athletic Conditioning & Agility', emoji: '⚡' },
  { id: 'recomposition', label: 'Body Recomposition (Lose Fat + Build Muscle)', emoji: '🧬' }
];

export default function Profile() {
  const { user, updateUserState } = useAuth();
  const [activeTab, setActiveTab] = useState('biometrics');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    heightCm: user?.bodyMetrics?.heightCm || 175,
    weightKg: user?.bodyMetrics?.weightKg || 70,
    targetWeightKg: user?.goals?.targetWeightKg || user?.bodyMetrics?.targetWeightKg || 70,
    age: user?.bodyMetrics?.age || 25,
    gender: user?.bodyMetrics?.gender || 'unspecified',
    bodyFatPct: user?.bodyMetrics?.bodyFatPct || 18,
    primaryGoal: user?.goals?.primaryGoal || 'maintenance',
    experienceLevel: user?.goals?.experienceLevel || 'Beginner',
    targetTimeline: user?.goals?.targetTimeline || '60 days',
    dietPreference: user?.goals?.dietPreference || 'Balanced',
    allergies: user?.goals?.allergies || [],
    mealsPerDay: user?.goals?.mealsPerDay || 4,
    activityLevel: user?.goals?.activityLevel || 'Moderate',
    workoutPreference: user?.goals?.workoutPreference || 'Gym',
    availableEquipment: user?.goals?.availableEquipment || ['Dumbbells'],
    daysPerWeek: user?.goals?.daysPerWeek || 4,
    workoutDurationMin: user?.goals?.workoutDurationMin || 45,
    injuries: user?.goals?.injuries || [],
    customLimitations: user?.goals?.customLimitations || '',
    dailyWaterTargetMl: user?.goals?.dailyWaterTargetMl || 2500,
    dailySleepTargetHours: user?.goals?.dailySleepTargetHours || 8,
    profileImages: {
      front: user?.profileImages?.front || '',
      back: user?.profileImages?.back || '',
      left: user?.profileImages?.left || '',
      right: user?.profileImages?.right || ''
    }
  });

  const [newImages, setNewImages] = useState({
    front: '',
    back: '',
    left: '',
    right: ''
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        avatar: user.avatar !== undefined ? user.avatar : prev.avatar,
        heightCm: user.bodyMetrics?.heightCm || prev.heightCm,
        weightKg: user.bodyMetrics?.weightKg || prev.weightKg,
        targetWeightKg: user.goals?.targetWeightKg || prev.targetWeightKg,
        age: user.bodyMetrics?.age || prev.age,
        gender: user.bodyMetrics?.gender || prev.gender,
        bodyFatPct: user.bodyMetrics?.bodyFatPct || prev.bodyFatPct,
        primaryGoal: user.goals?.primaryGoal || prev.primaryGoal,
        experienceLevel: user.goals?.experienceLevel || prev.experienceLevel,
        targetTimeline: user.goals?.targetTimeline || prev.targetTimeline,
        dietPreference: user.goals?.dietPreference || prev.dietPreference,
        allergies: user.goals?.allergies || prev.allergies,
        mealsPerDay: user.goals?.mealsPerDay || prev.mealsPerDay,
        activityLevel: user.goals?.activityLevel || prev.activityLevel,
        workoutPreference: user.goals?.workoutPreference || prev.workoutPreference,
        availableEquipment: user.goals?.availableEquipment || prev.availableEquipment,
        daysPerWeek: user.goals?.daysPerWeek || prev.daysPerWeek,
        workoutDurationMin: user.goals?.workoutDurationMin || prev.workoutDurationMin,
        injuries: user.goals?.injuries || prev.injuries,
        customLimitations: user.goals?.customLimitations || prev.customLimitations,
        dailyWaterTargetMl: user.goals?.dailyWaterTargetMl || prev.dailyWaterTargetMl,
        dailySleepTargetHours: user.goals?.dailySleepTargetHours || prev.dailySleepTargetHours,
        profileImages: {
          front: user.profileImages?.front || prev.profileImages.front,
          back: user.profileImages?.back || prev.profileImages.back,
          left: user.profileImages?.left || prev.profileImages.left,
          right: user.profileImages?.right || prev.profileImages.right
        }
      }));
    }
  }, [user]);

  // Live BMI Calculation
  const heightM = (formData.heightCm || 175) / 100;
  const liveBmi = Number(((formData.weightKg || 70) / (heightM * heightM)).toFixed(1));
  const bmiCategory = liveBmi < 18.5 ? 'Underweight' : liveBmi < 25 ? 'Normal / Healthy' : liveBmi < 30 ? 'Overweight' : 'Obese';

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter((x) => x !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Please select a photo under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, avatar: reader.result }));
      toast.success('📷 Profile photo selected! Click "Save Profile" to keep it.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, avatar: '' }));
    toast('Profile photo removed.', { icon: '🗑️' });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        avatar: formData.avatar,
        bodyMetrics: {
          heightCm: Number(formData.heightCm),
          weightKg: Number(formData.weightKg),
          targetWeightKg: Number(formData.targetWeightKg),
          age: Number(formData.age),
          gender: formData.gender,
          bodyFatPct: Number(formData.bodyFatPct),
          estimatedBmi: liveBmi
        },
        goals: {
          primaryGoal: formData.primaryGoal,
          targetWeightKg: Number(formData.targetWeightKg),
          targetTimeline: formData.targetTimeline,
          experienceLevel: formData.experienceLevel,
          allergies: formData.allergies,
          dietPreference: formData.dietPreference,
          mealsPerDay: Number(formData.mealsPerDay),
          activityLevel: formData.activityLevel,
          workoutPreference: formData.workoutPreference,
          availableEquipment: formData.availableEquipment,
          daysPerWeek: Number(formData.daysPerWeek),
          workoutDurationMin: Number(formData.workoutDurationMin),
          injuries: formData.injuries,
          customLimitations: formData.customLimitations,
          dailyWaterTargetMl: Number(formData.dailyWaterTargetMl),
          dailySleepTargetHours: Number(formData.dailySleepTargetHours)
        }
      };

      const res = await API.put('/user/profile', payload);
      updateUserState(res.data.user);
      toast.success('🎉 Complete profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRegeneratePlan = async () => {
    setRegenerating(true);
    try {
      // Save profile first
      await handleSaveProfile();
      const res = await API.post('/plan/regenerate');
      toast.success(`✨ New AI Plan Generated (v${res.data.plan?.version || 2}) tailored to your updated profile!`);
    } catch (err) {
      toast.error('Could not regenerate plan. Try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleImageUpload = (angle, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImages((prev) => ({ ...prev, [angle]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRunPostureScan = async () => {
    if (!newImages.front && !newImages.back && !newImages.left && !newImages.right) {
      toast.error('Please select at least one photo to update your posture scan.');
      return;
    }
    setScanning(true);
    try {
      const mergedImages = {
        front: newImages.front || formData.profileImages.front,
        back: newImages.back || formData.profileImages.back,
        left: newImages.left || formData.profileImages.left,
        right: newImages.right || formData.profileImages.right
      };

      const res = await API.post('/user/posture-scan', { images: mergedImages });
      updateUserState(res.data.user);
      setFormData((prev) => ({ ...prev, profileImages: mergedImages }));
      setNewImages({ front: '', back: '', left: '', right: '' });
      toast.success('🎯 Computer Vision Posture Scan updated & analyzed!');
    } catch (err) {
      toast.error('Posture scan analysis failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleExportData = async () => {
    try {
      toast.loading('Preparing health data export...', { id: 'export-toast' });
      const res = await API.get('/user/export');
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `fitvision-health-data-${user?.name?.replace(/\s+/g, '_') || 'user'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('📥 Health data JSON downloaded!', { id: 'export-toast' });
    } catch (err) {
      toast.error('Could not export data.', { id: 'export-toast' });
    }
  };

  const tabs = [
    { id: 'biometrics', label: 'Biometrics & Body', icon: Activity },
    { id: 'posture', label: '4-Angle Posture Scan', icon: Camera },
    { id: 'training', label: 'Training & Equipment', icon: Dumbbell },
    { id: 'nutrition', label: 'Diet & Allergies', icon: Utensils },
    { id: 'health', label: 'Injuries & Lifestyle', icon: HeartPulse },
    { id: 'account', label: 'Account & Data', icon: ShieldCheck }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-[#FEF9F5]">

      {/* Hero Profile Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8FD02]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Interactive Avatar Upload Box */}
            <div className="relative group">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#0B0C0E] border-2 border-[#B8FD02]/60 overflow-hidden flex items-center justify-center shadow-xl shadow-[#B8FD02]/20 relative">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.name || 'User Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#B8FD02] text-[#0B0C0E] font-black text-2xl sm:text-3xl flex items-center justify-center">
                    {user?.name?.slice(0, 2).toUpperCase() || 'FV'}
                  </div>
                )}

                {/* Hover Camera Overlay */}
                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer text-[10px] font-black uppercase text-[#FEF9F5]">
                  <Camera className="w-5 h-5 text-[#B8FD02]" />
                  <span>{formData.avatar ? 'Change' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Quick Remove Button if Avatar is present */}
              {formData.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  title="Remove Profile Picture"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow hover:bg-rose-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#FEF9F5] tracking-tight">
                  {formData.name || 'Athletic User'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#B8FD02]/20 text-[#B8FD02] border border-[#B8FD02]/40">
                  {user?.role === 'admin' ? 'SYSTEM ADMIN' : 'FOUNDER PRO'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {user?.email} • Goal: <span className="text-[#B8FD02] font-bold uppercase">{formData.primaryGoal.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-primary text-xs sm:text-sm px-5 py-2.5 flex-1 md:flex-initial uppercase tracking-wider"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              onClick={handleRegeneratePlan}
              disabled={regenerating}
              className="btn-secondary text-xs sm:text-sm px-4 py-2.5 flex-1 md:flex-initial"
              title="Regenerates your workout and meal plan according to your updated profile settings"
            >
              <RefreshCw className={`w-4 h-4 text-[#B8FD02] ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Generating Plan...' : 'Re-Generate Plan'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02] shadow-lg shadow-[#B8FD02]/20 font-black'
                  : 'bg-[#16181C] text-slate-400 border-slate-800 hover:text-[#FEF9F5] hover:border-slate-700'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >

          {/* TAB 1: BIOMETRICS & BODY */}
          {activeTab === 'biometrics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal & Stats */}
                <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-6">
                  <h3 className="text-lg font-black uppercase text-[#FEF9F5] flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#B8FD02]" /> Physical Biometrics
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="input-field bg-[#111317]"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="unspecified">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Current Weight (kg)</label>
                      <input
                        type="number"
                        value={formData.weightKg}
                        onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Target Weight (kg)</label>
                      <input
                        type="number"
                        value={formData.targetWeightKg}
                        onChange={(e) => setFormData({ ...formData, targetWeightKg: e.target.value })}
                        className="input-field border-[#B8FD02]/40"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Height (cm)</label>
                      <input
                        type="number"
                        value={formData.heightCm}
                        onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Age (Years)</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Estimated Body Fat (%)</label>
                      <input
                        type="number"
                        value={formData.bodyFatPct}
                        onChange={(e) => setFormData({ ...formData, bodyFatPct: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Target Timeline</label>
                      <input
                        type="text"
                        value={formData.targetTimeline}
                        onChange={(e) => setFormData({ ...formData, targetTimeline: e.target.value })}
                        placeholder="e.g. 60 days, 12 weeks"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                {/* BMI Card & Goal */}
                <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-3xl bg-[#16181C] border border-[#B8FD02]/30 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#B8FD02]">Live Biometric Readout</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-[#FEF9F5]">{liveBmi}</span>
                      <span className="text-xs font-bold text-[#B8FD02] px-2.5 py-0.5 rounded-full bg-[#B8FD02]/15 border border-[#B8FD02]/40">
                        {bmiCategory}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Calculated using standard metric formula from height ({formData.heightCm}cm) & weight ({formData.weightKg}kg).
                    </p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl bg-[#16181C] border border-slate-800 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Experience Level</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, experienceLevel: lvl })}
                          className={`py-2 rounded-xl text-xs font-black uppercase transition-all border ${
                            formData.experienceLevel === lvl
                              ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02]'
                              : 'bg-[#0B0C0E] text-slate-400 border-slate-800 hover:text-[#FEF9F5]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Goal Selector */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-4">
                <h3 className="text-lg font-black uppercase text-[#FEF9F5] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#B8FD02]" /> Primary Fitness & Physique Goal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {GOALS_LIST.map((g) => {
                    const isSelected = formData.primaryGoal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, primaryGoal: g.id })}
                        className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'bg-[#B8FD02]/15 border-[#B8FD02] text-[#FEF9F5]'
                            : 'bg-[#0B0C0E] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl">{g.emoji}</span>
                        <div>
                          <p className="text-xs sm:text-sm font-black uppercase">{g.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 4-ANGLE POSTURE SCAN */}
          {activeTab === 'posture' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black uppercase text-[#FEF9F5] flex items-center gap-2">
                      <Camera className="w-5 h-5 text-[#B8FD02]" /> 4-Angle Body Snapshot & Metrics
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Store Front, Back, Left, and Right photos as your visual baseline. BMI & body-fat estimates are calculated from your measurements.
                    </p>
                  </div>

                  <button
                    onClick={handleRunPostureScan}
                    disabled={scanning}
                    className="btn-primary text-xs px-5 py-2.5 uppercase tracking-wider"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                    {scanning ? 'Updating metrics...' : 'Save Photos & Recalculate'}
                  </button>
                </div>

                {/* Status Box */}
                <div className="p-4 rounded-2xl bg-[#0B0C0E] border border-[#B8FD02]/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#B8FD02]/20 text-[#B8FD02] flex items-center justify-center font-black">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#FEF9F5] uppercase">Snapshot Status</p>
                      <p className="text-xs text-[#B8FD02] font-semibold">{user?.bodyMetrics?.postureStatus || 'No snapshot yet — save your photos above.'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:block">
                    Metrics Estimated (no CV model)
                  </span>
                </div>

                {/* 4 Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'front', label: 'Front Angle' },
                    { id: 'back', label: 'Back Angle' },
                    { id: 'left', label: 'Left Side Angle' },
                    { id: 'right', label: 'Right Side Angle' }
                  ].map((angle) => {
                    const currentImg = newImages[angle.id] || formData.profileImages[angle.id];
                    return (
                      <div key={angle.id} className="p-4 rounded-2xl bg-[#0B0C0E] border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-slate-300">{angle.label}</span>
                          {currentImg && <span className="text-[10px] text-[#B8FD02] font-black">ACTIVE</span>}
                        </div>

                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#16181C] border border-slate-800 relative flex items-center justify-center group">
                          {currentImg ? (
                            <img src={currentImg} alt={angle.label} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-4 text-slate-500 space-y-1">
                              <Camera className="w-8 h-8 mx-auto text-slate-600" />
                              <p className="text-[11px] font-bold">No photo uploaded</p>
                            </div>
                          )}

                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer text-xs font-bold text-white">
                            <Camera className="w-5 h-5 text-[#B8FD02]" />
                            <span>Replace Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(angle.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRAINING & EQUIPMENT */}
          {activeTab === 'training' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-6">
                <h3 className="text-lg font-black uppercase text-[#FEF9F5] flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-[#B8FD02]" /> Training Environment & Hardware
                </h3>

                {/* Workout Location Preference */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Training Environment</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Gym', 'Home', 'Hybrid'].map((env) => (
                      <button
                        key={env}
                        type="button"
                        onClick={() => setFormData({ ...formData, workoutPreference: env })}
                        className={`p-3 rounded-2xl border font-black text-xs uppercase tracking-wider transition-all ${
                          formData.workoutPreference === env
                            ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02]'
                            : 'bg-[#0B0C0E] text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {env === 'Gym' ? '🏋️ Commercial Gym' : env === 'Home' ? '🏠 Home Workouts' : '⚡ Hybrid (Both)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Days Available Per Week ({formData.daysPerWeek} Days)
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="6"
                      value={formData.daysPerWeek}
                      onChange={(e) => setFormData({ ...formData, daysPerWeek: Number(e.target.value) })}
                      className="w-full accent-[#B8FD02]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
                      <span>2 Days</span>
                      <span>3 Days</span>
                      <span>4 Days</span>
                      <span>5 Days</span>
                      <span>6 Days</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Session Duration ({formData.workoutDurationMin} Minutes)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[30, 45, 60, 90].map((min) => (
                        <button
                          key={min}
                          type="button"
                          onClick={() => setFormData({ ...formData, workoutDurationMin: min })}
                          className={`py-2 rounded-xl text-xs font-black uppercase transition-all border ${
                            formData.workoutDurationMin === min
                              ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02]'
                              : 'bg-[#0B0C0E] text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {min}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Available Equipment Checklist */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Available Equipment (AI will only program exercises for selected gear)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {EQUIPMENT_LIST.map((eq) => {
                      const isChecked = formData.availableEquipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => toggleArrayItem('availableEquipment', eq)}
                          className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                            isChecked
                              ? 'bg-[#B8FD02]/15 border-[#B8FD02] text-[#FEF9F5]'
                              : 'bg-[#0B0C0E] border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{eq}</span>
                          {isChecked && <CheckCircle2 className="w-4 h-4 text-[#B8FD02]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NUTRITION & ALLERGIES */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-6">
                <h3 className="text-lg font-black uppercase text-[#FEF9F5] flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#B8FD02]" /> Nutrition & Dietary Protocol
                </h3>

                {/* Diet Style Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Primary Diet Preference</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {DIET_STYLES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormData({ ...formData, dietPreference: d })}
                        className={`p-3 rounded-xl border font-black text-xs uppercase tracking-wider transition-all ${
                          formData.dietPreference === d
                            ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02]'
                            : 'bg-[#0B0C0E] text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meals per day */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Meals per Day Preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { count: 3, label: '3 Meals (Breakfast, Lunch, Dinner)' },
                      { count: 4, label: '4 Meals (Includes Afternoon Snack)' },
                      { count: 5, label: '5 Smaller Meals (Bodybuilding split)' }
                    ].map((m) => (
                      <button
                        key={m.count}
                        type="button"
                        onClick={() => setFormData({ ...formData, mealsPerDay: m.count })}
                        className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                          formData.mealsPerDay === m.count
                            ? 'bg-[#B8FD02]/15 border-[#B8FD02] text-[#FEF9F5]'
                            : 'bg-[#0B0C0E] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <p className="font-black uppercase">{m.count} Meals</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{m.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergies & Dislikes */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Allergies & Food Intolerances (Filtered from all meal plans)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {COMMON_ALLERGIES.map((alg) => {
                      const isSelected = formData.allergies.includes(alg);
                      return (
                        <button
                          key={alg}
                          type="button"
                          onClick={() => toggleArrayItem('allergies', alg)}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                              : 'bg-[#0B0C0E] border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{alg}</span>
                          {isSelected && <span className="text-xs font-black">✕</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INJURIES & LIFESTYLE */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-6">
                <h3 className="text-lg font-black uppercase text-[#FEF9F5] flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-[#B8FD02]" /> Physical Limitations, Joint Health & Lifestyle
                </h3>

                {/* Injuries Checklist */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Physical Limitations & Injuries (AI Coach will strictly avoid aggravating movements)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {INJURIES_LIST.map((inj) => {
                      const isSelected = formData.injuries.includes(inj);
                      return (
                        <button
                          key={inj}
                          type="button"
                          onClick={() => toggleArrayItem('injuries', inj)}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                              : 'bg-[#0B0C0E] border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{inj}</span>
                          {isSelected && <span className="text-xs font-black">⚠️</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Custom Limitations or Medical Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.customLimitations}
                    onChange={(e) => setFormData({ ...formData, customLimitations: e.target.value })}
                    placeholder="e.g. Mild scoliosis, previous right ankle sprain, avoid heavy overhead presses"
                    className="input-field"
                  />
                </div>

                {/* Daily Lifestyle Targets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Daily Activity Level</label>
                    <select
                      value={formData.activityLevel}
                      onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                      className="input-field bg-[#111317]"
                    >
                      <option value="Sedentary">Sedentary (Desk Job)</option>
                      <option value="Light">Light Activity</option>
                      <option value="Moderate">Moderate Activity (Gym 3-4x)</option>
                      <option value="Very Active">Very Active (Athlete / Manual Labor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Daily Hydration Target (ml)</label>
                    <input
                      type="number"
                      value={formData.dailyWaterTargetMl}
                      onChange={(e) => setFormData({ ...formData, dailyWaterTargetMl: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Target Sleep (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.dailySleepTargetHours}
                      onChange={(e) => setFormData({ ...formData, dailySleepTargetHours: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ACCOUNT & DATA */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-6">
                <h3 className="text-lg font-black uppercase text-[#FEF9F5] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#B8FD02]" /> Account Credentials & Data Portability
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Registered Email</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="input-field opacity-60 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Account Role</label>
                    <input
                      type="text"
                      disabled
                      value={user?.role === 'admin' ? 'Administrator' : 'Standard Member'}
                      className="input-field opacity-60 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Data Portability Box */}
                <div className="p-6 rounded-2xl bg-[#0B0C0E] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-[#FEF9F5] uppercase">Export Your Health Data (JSON)</h4>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-md">
                      Download your full biometric metrics, AI plan versions, and daily habit logs in an open standard JSON format.
                    </p>
                  </div>

                  <button
                    onClick={handleExportData}
                    className="btn-secondary text-xs px-5 py-2.5 uppercase tracking-wider whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 text-[#B8FD02]" /> Export My Data
                  </button>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
