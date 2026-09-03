import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Dumbbell, Eye, EyeOff, ArrowRight, CheckCircle, Sparkles, User, Mail, Lock, ShieldCheck } from 'lucide-react';

const goalOptions = [
  { value: 'weight_loss', label: '🔥 Fat Loss', desc: 'Metabolic deficit & conditioning' },
  { value: 'muscle_gain', label: '💪 Hypertrophy', desc: 'Muscle building & strength' },
  { value: 'maintenance', label: '⚖️ Vital Health', desc: 'Maintain body composition' },
  { value: 'athletic', label: '⚡ Athletic Power', desc: 'Peak stamina & functional speed' },
];

export default function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', primaryGoal: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateStep1 = () => {
    if (!form.name.trim()) { toast.error('Full name is required'); return false; }
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) { toast.error('Valid email is required'); return false; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!form.primaryGoal) { toast.error('Please select your fitness goal'); return; }

    setLoading(true);
    const toastId = toast.loading('Initializing your AI fitness profile...');
    try {
      const res = await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        goals: { primaryGoal: form.primaryGoal }
      });
      login(res.data.user, res.data.token);
      toast.success(`Welcome to FitVision, ${res.data.user.name?.split(' ')[0]}! 🚀`, { id: toastId, duration: 5000 });
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 bg-[#0B0C0E]">
      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-[#B8FD02]/10 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 space-y-6 bg-[#16181C] border border-slate-800"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-[#B8FD02] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#B8FD02]/25 border border-[#B8FD02]">
            <Dumbbell className="w-7 h-7 text-[#0B0C0E] font-black" />
          </div>
          <h1 className="text-2xl font-black text-[#FEF9F5] uppercase tracking-wide">Join Public Beta</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Get 100% free lifetime access to Pro AI coaching</p>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  step > s ? 'bg-[#B8FD02] text-[#0B0C0E]' :
                  step === s ? 'bg-[#B8FD02]/20 text-[#B8FD02] border border-[#B8FD02]/40' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 2 && <div className={`w-8 h-0.5 rounded ${step > s ? 'bg-[#B8FD02]' : 'bg-slate-800'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: User Credentials */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Mercer"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="input-field pl-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#B8FD02]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              onClick={() => validateStep1() && setStep(2)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3.5 mt-2 uppercase tracking-wider"
            >
              Next: Select Fitness Goal <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* Step 2: Goal Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Primary Objective</p>

            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map((g) => (
                <motion.button
                  key={g.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setForm({ ...form, primaryGoal: g.value })}
                  className={`p-4 rounded-2xl text-left transition-all ${
                    form.primaryGoal === g.value
                      ? 'bg-[#B8FD02]/15 border-2 border-[#B8FD02] text-[#FEF9F5]'
                      : 'bg-[#0B0C0E] border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <p className="text-sm font-black mb-1">{g.label}</p>
                  <p className="text-[11px] text-slate-400">{g.desc}</p>
                  {form.primaryGoal === g.value && (
                    <CheckCircle className="w-4 h-4 text-[#B8FD02] mt-2" />
                  )}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1 py-3.5"
              >
                ← Back
              </button>
              <motion.button
                onClick={handleSubmit}
                disabled={loading || !form.primaryGoal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex-1 py-3.5 disabled:opacity-60 uppercase tracking-wider"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-[#0B0C0E] border-t-transparent animate-spin" />
                ) : (
                  <>Create Account <Sparkles className="w-4 h-4" /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Security badge & Signin link */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B8FD02]" />
            Protected by SoftnoveX AI Security Architecture
          </div>
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#B8FD02] font-black hover:underline transition-colors">
              Sign In →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
