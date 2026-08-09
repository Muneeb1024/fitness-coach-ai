import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Camera, Sparkles, AlertCircle, ArrowRight, CheckCircle2, Sliders, ShieldAlert } from 'lucide-react';

export default function Onboarding() {
  const { updateUserState } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Form State
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('Male');
  const [primaryGoal, setPrimaryGoal] = useState('Muscle Gain');
  const [targetWeightKg, setTargetWeightKg] = useState(75);
  const [workoutPreference, setWorkoutPreference] = useState('Gym');
  const [allergies, setAllergies] = useState('Peanuts, Dairy');

  // Images state (Front, Back, Left, Right)
  const [images, setImages] = useState({
    front: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    back: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80',
    left: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    right: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
  });

  const [loading, setLoading] = useState(false);

  const handleImageChange = (key, val) => {
    setImages((prev) => ({ ...prev, [key]: val }));
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    const toastId = toast.loading('Running MediaPipe analysis & generating Gemini AI plan...');

    try {
      const res = await API.post('/user/onboarding', {
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        age: Number(age),
        gender,
        primaryGoal,
        targetWeightKg: Number(targetWeightKg),
        workoutPreference,
        allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
        images
      });

      updateUserState(res.data.user);
      toast.success('AI Onboarding Complete! 🎉', { id: toastId });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete AI onboarding.', { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Body Metrics' },
          { num: 2, label: '4-Angle Photos' },
          { num: 3, label: 'Goals & Restrictions' }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs transition-all ${
                step === s.num
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-sm font-semibold hidden sm:inline ${step === s.num ? 'text-slate-900' : 'text-slate-500'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Body Metrics */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6"
        >
          <div>
            <span className="badge-emerald inline-flex items-center gap-1.5 mb-2">
              <Sliders className="w-3 h-3" /> Step 1 of 3
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Basic Body Profile</h2>
            <p className="text-sm text-slate-500 mt-1">Provide your initial measurements for MediaPipe landmark comparison</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Current Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="btn-primary flex items-center gap-2"
            >
              Continue to Photos <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: 4-Angle Photo Upload */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6"
        >
          <div>
            <span className="badge-cyan inline-flex items-center gap-1.5 mb-2">
              <Camera className="w-3 h-3" /> Step 2 of 3
            </span>
            <h2 className="text-2xl font-bold text-slate-900">4-Angle Photo Analysis</h2>
            <p className="text-sm text-slate-500 mt-1">Upload Front, Back, Left, and Right photos for MediaPipe posture detection</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
            <span>Note: Visual body analysis provides posture alignment & estimated BMI approximations. All uploads are encrypted.</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['front', 'back', 'left', 'right'].map((angle) => (
              <div key={angle} className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider text-center capitalize">{angle} View</label>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-500 transition-all group bg-slate-100 flex flex-col items-center justify-center">
                  {images[angle] ? (
                    <img src={images[angle]} alt={angle} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="p-4 text-center space-y-1">
                      <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-[11px] font-semibold text-slate-500">Upload {angle} photo</p>
                    </div>
                  )}

                  {/* File Upload Overlay */}
                  <label className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity p-3 text-center space-y-2">
                    <Camera className="w-6 h-6 text-white" />
                    <span className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-xl shadow-md">
                      Upload Real Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleImageChange(angle, reader.result);
                            toast.success(`Loaded ${angle} photo!`);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="btn-secondary">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="btn-primary flex items-center gap-2"
            >
              Set Goals & Restrictions <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Goals & Restrictions */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6"
        >
          <div>
            <span className="badge-purple inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3" /> Step 3 of 3
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Goals & Restrictions</h2>
            <p className="text-sm text-slate-500 mt-1">Configure your primary goal and food allergies for Gemini AI plan generation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Primary Fitness Goal</label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="input-field"
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Weight Gain">Weight Gain</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Target Weight (kg)</label>
              <input
                type="number"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Workout Preference</label>
              <select
                value={workoutPreference}
                onChange={(e) => setWorkoutPreference(e.target.value)}
                className="input-field"
              >
                <option value="Gym">Gym Equipment Split</option>
                <option value="Home">Home Bodyweight Split</option>
                <option value="Hybrid">Hybrid Mix</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Food Allergies / Intolerances</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Peanuts, Shellfish, Lactose"
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-200">
            <button onClick={() => setStep(2)} className="btn-secondary">
              Back
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCompleteOnboarding}
              disabled={loading}
              className="btn-primary px-8 py-3.5 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generating Gemini AI Plan...
                </>
              ) : (
                <>
                  Generate AI Diet & Workout Plan <Sparkles className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
