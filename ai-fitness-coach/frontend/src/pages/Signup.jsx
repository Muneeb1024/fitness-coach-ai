import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Dumbbell, Eye, EyeOff, ArrowRight, CheckCircle, Sparkles, User, Mail, Lock } from 'lucide-react';

const goalOptions = [
  { value: 'weight_loss', label: '🔥 Lose Weight', desc: 'Burn fat, reduce body mass' },
  { value: 'muscle_gain', label: '💪 Build Muscle', desc: 'Increase strength & size' },
  { value: 'maintenance', label: '⚖️ Stay Fit', desc: 'Maintain current fitness' },
  { value: 'athletic', label: '⚡ Athletic Perf.', desc: 'Optimize for performance' },
];

export default function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', primaryGoal: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateStep1 = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return false; }
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) { toast.error('Valid email is required'); return false; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!form.primaryGoal) { toast.error('Please select your fitness goal'); return; }

    setLoading(true);
    const toastId = toast.loading('Creating your AI fitness profile...');
    try {
      const res = await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        goals: { primaryGoal: form.primaryGoal }
      });
      login(res.data.user, res.data.token);
      toast.success(`Welcome aboard, ${res.data.user.name?.split(' ')[0]}! 🎉`, { id: toastId, duration: 5000 });
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-violet-200/40 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-200 shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-600/25">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create Your Account</h1>
          <p className="text-slate-500 text-sm mt-2">Start your AI-powered fitness journey for free</p>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step > s ? 'bg-blue-600 text-white' :
                  step === s ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 2 && <div className={`w-8 h-0.5 rounded ${step > s ? 'bg-blue-500' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="input-field pl-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              onClick={() => validateStep1() && setStep(2)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2"
            >
              Next: Choose Your Goal <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h2 className="font-bold text-slate-900 text-sm">What's your primary fitness goal?</h2>

            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map((g) => (
                <motion.button
                  key={g.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setForm({ ...form, primaryGoal: g.value })}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    form.primaryGoal === g.value
                      ? 'bg-blue-50 border-blue-300 border-2'
                      : 'bg-white border border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <p className="text-base mb-1">{g.label}</p>
                  <p className="text-[11px] text-slate-500">{g.desc}</p>
                  {form.primaryGoal === g.value && (
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-2" />
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
                className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>Create Account <Sparkles className="w-4 h-4" /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Sign In →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
