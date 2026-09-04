import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Check, ArrowRight, Gift, Bot, Camera, Dumbbell, Zap } from 'lucide-react';

export default function Subscription() {
  const { user } = useAuth();

  const betaFeatures = [
    {
      title: '4-Angle Body Snapshot & Metrics',
      desc: 'Front, Back, Left and Right photos stored as your visual baseline, with BMI, body-fat estimate and healthy range calculated from your measurements.',
      icon: Camera,
      color: 'text-[#B8FD02]',
      bg: 'bg-[#B8FD02]/15 border-[#B8FD02]/40'
    },
    {
      title: 'Gemini AI Nutrition & Macro Engine',
      desc: 'Personalized meal plans with exact grams of protein, carbs, and fats, tailored to your dietary allergies and daily schedule.',
      icon: Dumbbell,
      color: 'text-[#FEF9F5]',
      bg: 'bg-[#0B0C0E] border-slate-700'
    },
    {
      title: '24/7 Context-Aware RAG AI Coach',
      desc: 'Unlimited conversations with an AI coach that knows your plan, your workout preferences, and tracks your daily streak.',
      icon: Bot,
      color: 'text-[#B8FD02]',
      bg: 'bg-[#B8FD02]/15 border-[#B8FD02]/40'
    },
    {
      title: 'Live Plan Override Push',
      desc: 'When your coach updates your plan in the admin studio, it appears on your dashboard instantly via Socket.IO — no refresh needed.',
      icon: Zap,
      color: 'text-[#FEF9F5]',
      bg: 'bg-[#0B0C0E] border-slate-700'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-[#FEF9F5]">

      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="badge-fitgreen mb-2">
          <Gift className="w-3.5 h-3.5" /> SoftnoveX Public Beta Initiative
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#FEF9F5] tracking-tight uppercase">
          100% Free <span className="text-[#B8FD02]">Founder Pro Access</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          As part of SoftnoveX's commitment to building world-class AI products, all FitVision Pro capabilities are unlocked for free during our public beta.
        </p>
      </div>

      {/* Active Founder Pass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 sm:p-10 border border-[#B8FD02]/40 relative overflow-hidden shadow-2xl bg-[#16181C]"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8FD02]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#B8FD02]/20 text-[#B8FD02] border border-[#B8FD02]/40 uppercase tracking-wider">
                ACTIVE STATUS · 100% UNLOCKED
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tier: Founder Pro</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#FEF9F5] uppercase">
              Full AI Fitness Suite Included
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Account: <span className="text-[#FEF9F5] font-semibold">{user?.email || 'Active Beta Member'}</span>
            </p>
          </div>

          <div className="text-left md:text-right bg-[#0B0C0E] px-6 py-4 rounded-2xl border border-slate-800">
            <p className="text-3xl sm:text-4xl font-black text-[#FEF9F5]">$0 <span className="text-xs text-[#B8FD02] font-black uppercase tracking-wider">Free Forever Beta</span></p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">No payment method required</p>
          </div>
        </div>

        {/* Unlocked Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-8">
          {betaFeatures.map((f, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#0B0C0E] border border-slate-800 flex items-start gap-4">
              <div className={`p-3 rounded-xl border ${f.bg}`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-[#FEF9F5] flex items-center gap-1.5 uppercase tracking-wide">
                  <Check className="w-4 h-4 text-[#B8FD02]" />
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            Need help or want to provide feedback? SoftnoveX engineering team monitors the beta daily.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link to="/plans" className="btn-primary flex-1 sm:flex-initial text-xs sm:text-sm px-6 py-3 uppercase tracking-wider">
              View Your AI Plan <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/onboarding" className="btn-secondary flex-1 sm:flex-initial text-xs sm:text-sm px-6 py-3">
              Update My Snapshot
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
