import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Shield, Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');

    setLoading(true);
    const toastId = toast.loading('Authenticating Administrator...');

    try {
      const res = await API.post('/auth/login', form);
      const user = res.data.user;

      if (user.role !== 'admin') {
        toast.error('Access Denied: This portal is strictly reserved for Administrators.', { id: toastId });
        setLoading(false);
        return;
      }

      login(user, res.data.token);
      toast.success(`Welcome to Admin Console, ${user.name?.split(' ')[0]}! 🛡️`, { id: toastId });
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid administrator credentials', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillAdmin = () => {
    setForm({ email: 'admin@fitvision.ai', password: 'password123' });
    toast.success('Admin credentials loaded');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12">

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-200 shadow-2xl relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-600/25">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <span className="badge-purple inline-flex items-center gap-1.5 mb-2">
            <Lock className="w-3 h-3" /> System Administrator Portal
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Admin Sign In</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your admin credentials to access FitVision control center</p>
        </div>

        {/* Quick Admin Auto-fill */}
        <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-between">
          <div className="text-xs">
            <p className="font-bold text-violet-700">Admin Demo Mode</p>
            <p className="text-slate-500 text-[11px]">admin@fitvision.ai</p>
          </div>
          <button
            type="button"
            onClick={handleQuickFillAdmin}
            className="py-1.5 px-3 rounded-xl bg-violet-100 border border-violet-200 text-violet-700 hover:bg-violet-200 text-xs font-bold transition-all"
          >
            Auto Fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@fitvision.ai"
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
                placeholder="Enter admin password"
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>Access Admin Console <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}