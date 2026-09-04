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
  const [primaryGoal, setPrimaryGoal] = useState('muscle_gain');
  const [targetWeightKg, setTargetWeightKg] = useState(75);
  const [workoutPreference, setWorkoutPreference] = useState('Gym');
  const [allergies, setAllergies] = useState('');

  // Images state (Front, Back, Left, Right) — optional body snapshot.
  // No stock photos are pre-filled; users upload their own or skip.
  const [images, setImages] = useState({ front: null, back: null, left: null, right: null });

  const [loading, setLoading] = useState(false);

  const handleImageChange = (key, val) => {
    setImages((prev) => ({ ...prev, [key]: val }));
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    const toastId = toast.loading('Saving your body snapshot & generating your Gemini AI plan...');

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
      toast.success('Profile saved & AI plan generated! 🎉', { id: toastId });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete AI onboarding.', { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-slate-100">
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Biometric Metrics' },
          { num: 2, label: 'Body Snapshot (Optional)' },
          { num: 3, label: 'Goals & Allergies' }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs transition-all ${
                step === s.num
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/40'
                  : step > s.num
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-sm font-semibold hidden sm:inline ${step === s.num ? 'text-white' : 'text-slate-400'}`}>
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
          className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6"
        >
          <div>
            <span className="badge-emerald inline-flex items-center gap-1.5 mb-2">
              <Sliders className="w-3 h-3" /> Step 1 of 3
            </span>
            <h2 className="text-2xl font-bold text-white">Biometric Baseline</h2>
            <p className="text-sm text-slate-400 mt-1">Provide your initial measurements — BMI, body-fat estimate and healthy range are calculated from these</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Current Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Gender</label>
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
          className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6"
        >
          <div>
            <span className="badge-cyan inline-flex items-center gap-1.5 mb-2">
              <Camera className="w-3 h-3" /> Step 2 of 3
            </span>
            <h2 className="text-2xl font-bold text-white">Body Snapshot (Optional)</h2>
            <p className="text-sm text-slate-400 mt-1">Upload Front, Back, Left, and Right photos to build your visual baseline — or skip and add them later from your profile</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
            <span>Your photos are stored privately as your visual snapshot. BMI, body-fat and posture metrics are estimates calculated from your measurements — vision-based landmark analysis is not enabled yet.</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['front', 'back', 'left', 'right'].map((angle) => (
              <div key={angle} className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider text-center capitalize">{angle} View</label>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 hover:border-emerald-500 transition-all group bg-slate-900 flex flex-col items-center justify-center">
                  {images[angle] ? (
                    <img src={images[angle]} alt={angle} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="p-4 text-center space-y-1">
                      <Camera className="w-6 h-6 text-slate-500 mx-auto" />
                      <p className="text-[11px] font-semibold text-slate-400">Upload {angle} view</p>
                    </div>
                  )}

                  {/* File Upload Overlay */}
                  <label className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity p-3 text-center space-y-2">
                    <Camera className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-xl shadow-md">
                      Upload Photo
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
          className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6"
        >
          <div>
            <span className="badge-purple inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3" /> Step 3 of 3
            </span>
            <h2 className="text-2xl font-bold text-white">Training Goals & Dietary Allergies</h2>
            <p className="text-sm text-slate-400 mt-1">Configure parameters for Gemini AI nutrition and workout generation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Primary Objective</label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="input-field"
              >
                <option value="weight_loss">Fat Loss & Metabolic Deficit</option>
                <option value="muscle_gain">Hypertrophy & Muscle Gain</option>
                <option value="maintenance">Maintenance & Vital Fitness</option>
                <option value="athletic">Athletic Power & Performance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Target Weight (kg)</label>
              <input
                type="number"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Workout Preference</label>
              <select
                value={workoutPreference}
                onChange={(e) => setWorkoutPreference(e.target.value)}
                className="input-field"
              >
                <option value="Gym">Gym Facility Equipment Split</option>
                <option value="Home">Home Bodyweight & Calisthenics</option>
                <option value="Hybrid">Hybrid Functional Mix</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Food Allergies / Exclusions</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Peanuts, Shellfish, Lactose"
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-800">
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
                  Generating SoftnoveX AI Plan...
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
