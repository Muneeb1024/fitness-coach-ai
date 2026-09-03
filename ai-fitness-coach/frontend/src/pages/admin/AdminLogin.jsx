import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Shield, Eye, EyeOff, Lock, Sparkles, ArrowRight } from 'lucide-react';

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
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password
      };
      const res = await API.post('/auth/login', payload);
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



  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 text-[#FEF9F5]">

      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#B8FD02]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#B8FD02]/5 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl bg-[#16181C] border border-slate-800 shadow-2xl relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-[#B8FD02] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#B8FD02]/25 border border-[#B8FD02]">
            <Shield className="w-7 h-7 text-[#0B0C0E]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8FD02]/15 border border-[#B8FD02]/40 text-[#B8FD02] text-xs font-black uppercase tracking-wider">
            <Lock className="w-3 h-3" /> System Administrator Portal
          </div>
          <h1 className="text-2xl font-black text-[#FEF9F5] tracking-tight uppercase">Admin Sign In</h1>
          <p className="text-slate-400 text-xs">
            Authenticate to access the SoftnoveX FitVision control console
          </p>
        </div>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@fitvision.ai"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Master Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password"
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 uppercase tracking-wider text-xs font-black shadow-lg shadow-[#B8FD02]/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0B0C0E] border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Enter Admin Portal <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}