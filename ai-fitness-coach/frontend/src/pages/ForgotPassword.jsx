import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../services/api';
import { KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle2, Dumbbell } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = enter email, 2 = set new password, 3 = done
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email address');
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    const toastId = toast.loading('Resetting your password...');
    try {
      await API.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
        newPassword,
      });
      toast.success('Password reset successfully!', { id: toastId });
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 bg-[#0B0C0E]">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#B8FD02]/8 rounded-full blur-[130px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back link */}
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#B8FD02] text-sm font-medium mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Sign In
        </Link>

        <div className="bg-[#16181C] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-[#B8FD02] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#B8FD02]/25">
              <KeyRound className="w-7 h-7 text-[#0B0C0E]" />
            </div>
            <h1 className="text-2xl font-black text-[#FEF9F5] uppercase tracking-tight">
              {step === 3 ? 'Password Reset!' : 'Reset Password'}
            </h1>
            <p className="text-slate-400 text-sm">
              {step === 1 && 'Enter your account email to get started'}
              {step === 2 && `Setting new password for ${email}`}
              {step === 3 && 'You can now sign in with your new password.'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#B8FD02]' : 'bg-slate-800'}`} />
            ))}
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleCheckEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" autoFocus
                  className="w-full bg-[#0B0C0E] border border-slate-700 rounded-xl px-4 py-3 text-sm text-[#FEF9F5] placeholder-slate-500 focus:outline-none focus:border-[#B8FD02] focus:ring-1 focus:ring-[#B8FD02]/30 transition-all"
                />
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#B8FD02] text-[#0B0C0E] font-black uppercase tracking-wider text-sm rounded-xl hover:bg-[#a5e800] transition-colors shadow-lg shadow-[#B8FD02]/20">
                Continue
              </button>
            </form>
          )}

          {/* Step 2: New Password */}
          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters" autoFocus
                    className="w-full bg-[#0B0C0E] border border-slate-700 rounded-xl px-4 py-3 text-sm text-[#FEF9F5] placeholder-slate-500 focus:outline-none focus:border-[#B8FD02] focus:ring-1 focus:ring-[#B8FD02]/30 transition-all pr-12"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-[#0B0C0E] border border-slate-700 rounded-xl px-4 py-3 text-sm text-[#FEF9F5] placeholder-slate-500 focus:outline-none focus:border-[#B8FD02] focus:ring-1 focus:ring-[#B8FD02]/30 transition-all pr-12"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password strength */}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[6, 8, 12].map((len, i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all ${newPassword.length >= len ? (i === 0 ? 'bg-red-400' : i === 1 ? 'bg-yellow-400' : 'bg-[#B8FD02]') : 'bg-slate-800'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {newPassword.length < 6 ? 'Too short' : newPassword.length < 8 ? 'Weak' : newPassword.length < 12 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#B8FD02] text-[#0B0C0E] font-black uppercase tracking-wider text-sm rounded-xl hover:bg-[#a5e800] transition-colors shadow-lg shadow-[#B8FD02]/20 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <div className="w-4 h-4 border-2 border-[#0B0C0E] border-t-transparent rounded-full animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Reset Password
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-slate-400 hover:text-[#B8FD02] text-sm transition-colors">← Change email</button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-5">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
                className="w-16 h-16 bg-[#B8FD02]/10 border border-[#B8FD02]/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#B8FD02]" />
              </motion.div>
              <p className="text-slate-400 text-sm">Your password has been updated. Sign in to continue your fitness journey.</p>
              <button onClick={() => navigate('/login')}
                className="w-full py-3.5 bg-[#B8FD02] text-[#0B0C0E] font-black uppercase tracking-wider text-sm rounded-xl hover:bg-[#a5e800] transition-colors shadow-lg shadow-[#B8FD02]/20 flex items-center justify-center gap-2">
                <Dumbbell className="w-4 h-4" />
                Sign In Now
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
