import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Dumbbell, Droplets, Flame, Sparkles, Shield, ArrowRight, Bot, Zap, BarChart3, CheckCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } }
};

const features = [
  {
    icon: Camera,
    color: 'text-[#B8FD02]',
    bg: 'bg-[#B8FD02]/10 border-[#B8FD02]/30',
    title: '4-Angle Body Snapshot & AI Metrics',
    desc: 'Upload Front, Back, Left, and Right photos as your visual baseline. BMI, body-fat estimate and healthy range are calculated from your measurements — in-photo landmark vision analysis is on the roadmap.'
  },
  {
    icon: Sparkles,
    color: 'text-[#FEF9F5]',
    bg: 'bg-[#16181C] border-slate-700',
    title: 'Gemini AI Nutrition & Macro Engine',
    desc: 'Deep neural plan generator crafting allergy-safe protocols with exact macro breakdowns and customized home or gym split routines.'
  },
  {
    icon: Bot,
    color: 'text-[#B8FD02]',
    bg: 'bg-[#B8FD02]/10 border-[#B8FD02]/30',
    title: 'Context-Aware RAG Fitness Coach',
    desc: 'Chat with an intelligent 24/7 AI coach that grounds its answers in your personal plan, daily progress, streak, and dietary restrictions.'
  },
  {
    icon: BarChart3,
    color: 'text-[#FEF9F5]',
    bg: 'bg-[#16181C] border-slate-700',
    title: 'Precision Habit & Streak Tracking',
    desc: 'Daily meal completion, hydration logs, sleep tracking, and a gamified 0-100 dynamic fitness score with streak multipliers.'
  },
  {
    icon: Shield,
    color: 'text-[#B8FD02]',
    bg: 'bg-[#B8FD02]/10 border-[#B8FD02]/30',
    title: 'Admin Governance Console',
    desc: 'Full administrative suite with real KPI analytics, moderation console, plan override studio, and system prompt tuning.'
  },
  {
    icon: Zap,
    color: 'text-[#FEF9F5]',
    bg: 'bg-[#16181C] border-slate-700',
    title: 'Live Plan Override Push',
    desc: 'Socket.IO streams trainer plan overrides to your dashboard instantly — no page reload needed when your coach updates your plan.'
  }
];

const stats = [
  { value: '4', label: 'Body Snapshot Angles', unit: '' },
  { value: '100%', label: 'Free Public Beta', unit: '' },
  { value: '24/7', label: 'AI RAG Coach', unit: '' },
  { value: '<2s', label: 'Plan Generation', unit: '' },
];

export default function Landing() {
  return (
    <div className="min-h-screen text-[#FEF9F5] overflow-hidden bg-[#0B0C0E]">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto">

        {/* Athletic radial ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-[#B8FD02]/10 blur-[140px]" />
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-[#B8FD02]/5 blur-[150px]" />
        </div>

        <motion.div
          className="text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Product Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B8FD02]/15 border border-[#B8FD02]/40 text-[#B8FD02] text-xs font-black uppercase tracking-wider mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#B8FD02] animate-ping" />
            ✦ A SoftnoveX Innovation · Free Public Beta
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] max-w-5xl mx-auto uppercase"
          >
            Autonomous Fitness Intelligence with{' '}
            <span className="text-[#B8FD02]">AI Coaching</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Upload body snapshot photos (optional) and get AI-calculated metrics, custom allergy-aware nutrition protocols, tailored training splits, and a context-aware 24/7 AI Coach.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/signup" className="btn-primary text-base px-8 py-4 shadow-xl shadow-[#B8FD02]/25">
                Start Free Analysis <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="btn-secondary text-base px-8 py-4">
                Sign In to Dashboard
              </Link>
            </motion.div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="glass-card p-5 rounded-2xl border text-center card-hover bg-[#16181C]/90">
                <p className="text-3xl sm:text-4xl font-black text-[#FEF9F5] tracking-tight">{s.value}<span className="text-[#B8FD02] text-xl font-bold">{s.unit}</span></p>
                <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="relative w-full max-w-3xl mx-auto mt-16"
        >
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative bg-[#16181C]/95 border border-slate-800">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-[#B8FD02]" />
                <span className="text-xs font-bold text-slate-300 ml-2 uppercase tracking-wider">FitVision · Active Session</span>
              </div>
              <span className="badge-fitgreen">Example Session</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Calorie Ring */}
              <div className="flex flex-col items-center justify-center gap-3 bg-[#0B0C0E] border border-slate-800 rounded-2xl p-5">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 96 96" className="w-20 h-20 -rotate-90">
                    <circle cx="48" cy="48" r="38" fill="none" stroke="#23272F" strokeWidth="9" />
                    <circle
                      cx="48" cy="48" r="38" fill="none"
                      stroke="#B8FD02" strokeWidth="9" strokeLinecap="round"
                      strokeDasharray="238.8" strokeDashoffset="71.6"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-[#FEF9F5]">70%</span>
                    <span className="text-[9px] text-[#B8FD02] font-extrabold">2,400 kcal</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Energy Target</p>
              </div>

              {/* Hydration */}
              <div className="flex flex-col gap-3 bg-[#0B0C0E] border border-slate-800 rounded-2xl p-5 justify-center">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#B8FD02]" />
                  <span className="text-xs font-bold text-[#FEF9F5]">Hydration</span>
                </div>
                <div className="w-full bg-[#23272F] h-3 rounded-full overflow-hidden">
                  <div className="h-full w-[68%] rounded-full bg-[#B8FD02]" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Logged</span>
                  <span className="text-[#B8FD02]">2,100 / 3,000 ml</span>
                </div>
              </div>

              {/* Workout */}
              <div className="flex flex-col gap-3 bg-[#0B0C0E] border border-slate-800 rounded-2xl p-5 justify-center">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#B8FD02]" />
                  <span className="text-xs font-bold text-[#FEF9F5]">Today's Split</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Focus</span>
                  <span className="text-[#B8FD02] font-black">Upper Body Push</span>
                </div>
                <span className="badge-fitgreen text-center">✓ 4 Exercises Logged</span>
              </div>
            </div>
          </div>

          {/* Floating AI Coach Card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.4 }}
            className="hidden md:flex absolute -left-8 -top-8 glass-panel border border-slate-700 rounded-2xl px-4 py-3 shadow-2xl items-center gap-3 bg-[#16181C]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#B8FD02]/20 border border-[#B8FD02]/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#B8FD02]" />
            </div>
            <div>
              <p className="text-[10px] text-[#B8FD02] font-black uppercase tracking-wider">AI Coach</p>
              <p className="text-xs font-bold text-[#FEF9F5]">Target protein intake reached today! 🥩</p>
            </div>
          </motion.div>

          {/* Floating Streak Card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.8 }}
            className="hidden md:flex absolute -right-6 -bottom-6 glass-panel border border-slate-700 rounded-2xl px-4 py-3 shadow-2xl items-center gap-3 bg-[#16181C]"
          >
            <Flame className="w-6 h-6 text-[#B8FD02] fire-animate" />
            <div>
              <p className="text-xl font-black text-[#FEF9F5] leading-none">12</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Streak</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <div className="badge-fitgreen mb-4">Core Technology</div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#FEF9F5] tracking-tight uppercase">
            Engineered for <span className="text-[#B8FD02]">Peak Performance</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            A comprehensive AI architecture built from the ground up by SoftnoveX to deliver precision coaching and real body transformation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass-card p-7 rounded-3xl border border-slate-800 flex flex-col gap-4 card-hover bg-[#16181C]/90"
            >
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${f.bg}`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-base font-black text-[#FEF9F5] uppercase tracking-wide">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Founder Free Access CTA */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-panel p-10 sm:p-14 rounded-3xl border border-[#B8FD02]/40 text-center relative overflow-hidden bg-[#16181C]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#B8FD02]/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="badge-fitgreen mb-6">
              <CheckCircle className="w-3.5 h-3.5" /> 100% Free Public Beta Access
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#FEF9F5] mb-4 uppercase">
              Start Your AI Transformation Today
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Early adopters receive full, unrestricted access to all Pro features, vision scans, and Gemini AI coaching without subscription barriers.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Link to="/signup" className="btn-primary text-base px-10 py-4 shadow-xl shadow-[#B8FD02]/30">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SoftnoveX Branded Footer */}
      <footer className="border-t border-slate-800 bg-[#0B0C0E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#B8FD02] flex items-center justify-center shadow-sm">
                  <Dumbbell className="w-4 h-4 text-[#0B0C0E] font-black" />
                </div>
                <span className="font-black text-xl text-[#FEF9F5]">
                  FIT<span className="text-[#B8FD02]">VISION</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Next-generation computer vision body analytics and personalized neural AI coaching.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-extrabold text-[#B8FD02] bg-[#B8FD02]/15 border border-[#B8FD02]/40 px-3 py-1 rounded-full uppercase tracking-wider">
                  Engineered by SoftnoveX
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/dashboard" className="hover:text-[#B8FD02] transition-colors">User Dashboard</Link></li>
                <li><Link to="/plans" className="hover:text-[#B8FD02] transition-colors">AI Meal & Workout Plans</Link></li>
                <li><Link to="/progress" className="hover:text-[#B8FD02] transition-colors">Progress & Streak Tracker</Link></li>
                <li><Link to="/pricing" className="hover:text-[#B8FD02] transition-colors">Public Beta Access</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3">Technology</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Google Gemini AI Plan Engine</li>
                <li>33-Point Computer Vision Pipeline</li>
                <li>Context-Aware RAG Architecture</li>
                <li>Socket.IO Real-Time Synchronization</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3">SoftnoveX Vision</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Innovate. Build. Scale. Creating proprietary AI products and scalable software systems for global impact.
              </p>
              <Link to="/signup" className="btn-primary text-xs px-4 py-2 inline-flex">
                Join Public Beta
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>© 2026 FitVision AI · A flagship SaaS product by SoftnoveX. All rights reserved.</p>
            <p className="text-center sm:text-right text-[11px] text-slate-500">Automated AI fitness analysis is for lifestyle optimization. Consult a medical professional for clinical guidance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
