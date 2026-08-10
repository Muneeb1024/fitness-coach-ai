import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Dumbbell, Eye, EyeOff, ArrowRight, User } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');

    setLoading(true);
    const toastId = toast.loading('Signing you in...');
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name?.split(' ')[0]}! 👋`, { id: toastId });
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email, password) => {
    setForm({ email, password });
    toast.success(`Loaded demo credentials for ${email}`);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12">

      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-200/40 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-200 shadow-2xl relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/25">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your FitVision AI account</p>
        </div>

        {/* User Quick Login */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Quick Login</p>
          <button
            type="button"
            onClick={() => handleQuickFill('user@fitvision.ai', 'password123')}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/25 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <User className="w-4 h-4 text-emerald-600" /> User
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center space-y-2">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Start Free →
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            Administrator?{' '}
            <Link to="/admin/login" className="text-purple-600 font-bold hover:text-purple-700 transition-colors">
              Go to Dedicated Admin Portal →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}