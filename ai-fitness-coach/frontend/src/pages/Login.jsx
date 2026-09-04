import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Dumbbell, Eye, EyeOff, ArrowRight } from 'lucide-react';

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
    const toastId = toast.loading('Authenticating credentials...');
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

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 bg-[#0B0C0E]">

      {/* Atmospheric ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#B8FD02]/10 rounded-full blur-[130px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 space-y-6 bg-[#16181C] border border-slate-800"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-[#B8FD02] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#B8FD02]/25 border border-[#B8FD02]">
            <Dumbbell className="w-7 h-7 text-[#0B0C0E] font-black" />
          </div>
          <h1 className="text-2xl font-black text-[#FEF9F5] uppercase tracking-wide">Sign In to FitVision</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Access your AI fitness intelligence dashboard</p>
        </div>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#B8FD02] transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end -mt-1">
            <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-[#B8FD02] transition-colors font-medium">
              Forgot your password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full py-3.5 text-sm font-black shadow-lg shadow-[#B8FD02]/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2 uppercase tracking-wider"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-[#0B0C0E] border-t-transparent animate-spin" />
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center space-y-2">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#B8FD02] font-black hover:underline transition-colors">
              Create Free Account →
            </Link>
          </p>
          <p className="text-xs text-slate-500 font-medium">
            System Administrator?{' '}
            <Link to="/admin/login" className="text-slate-300 font-bold hover:text-[#B8FD02] transition-colors">
              Go to Dedicated Admin Portal →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}