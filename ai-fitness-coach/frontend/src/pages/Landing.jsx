import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Dumbbell, Droplets, Flame, Sparkles, Shield, ArrowRight, Bot, Zap, BarChart3, CheckCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
};

const features = [
  {
    icon: Camera,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    title: '4-Angle Body Analysis',
    desc: 'MediaPipe 33-keypoint pose detection from Front, Back, Left & Right photos. Instant posture alignment, BMI estimation & body composition insights.'
  },
  {
    icon: Sparkles,
    color: 'text-cyan-700',
    bg: 'bg-cyan-50 border-cyan-200',
    title: 'Gemini AI Plan Engine',
    desc: 'LLM-powered allergy-aware meal plans with macro breakdowns and personalized home/gym workout splits tailored to your specific goal.'
  },
  {
    icon: Bot,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200',
    title: 'Context-Aware RAG Coach',
    desc: 'Chat with a 24/7 AI coach that reads your plan, tracks your habits and gives hyper-personalized coaching responses — not generic advice.'
  },
  {
    icon: BarChart3,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    title: 'Habit & Streak Tracking',
    desc: 'Daily water, meal, sleep and workout logging with streak counters, fitness score and weekly transformation photo comparisons.'
  },
  {
    icon: Shield,
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    title: 'Full Admin Control Panel',
    desc: 'Comprehensive admin portal with real-time analytics, plan override studio, AI prompt tuning, and user safety moderation console.'
  },
  {
    icon: Zap,
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
    title: 'Real-Time Socket Updates',
    desc: 'Socket.IO powered live sync for habit updates across devices. Admin plan overrides reflect instantly on the user dashboard.'
  }
];

const stats = [
  { value: '33', label: 'Body Keypoints Analyzed', unit: '' },
  { value: '4', label: 'Fitness Goal Types', unit: '+' },
  { value: '100', label: 'Fitness Score Potential', unit: '/100' },
  { value: '24/7', label: 'AI Coaching Available', unit: '' },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">

        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl" />
        </div>

        <motion.div
          className="text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 badge-emerald mb-8">
            <Zap className="w-3.5 h-3.5" />
            AI Fitness Platform — Computer Vision + Gemini LLM
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mx-auto"
          >
            Transform Your Body with{' '}
            <span className="text-blue-600">Computer Vision & AI</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Upload 4 body photos for instant MediaPipe posture & BMI analysis. Get allergy-aware diet plans, personalized workout splits, and a context-aware 24/7 AI Fitness Coach.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
                Start Free AI Analysis <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-4">
                Sign In to Dashboard
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust stats */}
          <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="glass-card p-5 rounded-2xl border text-center card-hover">
                <p className="text-3xl font-extrabold text-blue-600">{s.value}{s.unit}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero Product Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="relative w-full max-w-3xl mx-auto mt-16"
        >
          {/* Main dashboard card */}
          <div className="glass-card rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="badge-emerald">FitVision Dashboard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Calorie ring */}
              <div className="flex flex-col items-center justify-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 96 96" className="w-20 h-20 -rotate-90">
                    <circle cx="48" cy="48" r="38" fill="none" stroke="#E2E8F0" strokeWidth="9" />
                    <circle
                      cx="48" cy="48" r="38" fill="none"
                      stroke="#2563EB" strokeWidth="9" strokeLinecap="round"
                      strokeDasharray="238.8" strokeDashoffset="71.6"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-extrabold text-slate-900">70%</span>
                    <span className="text-[8px] text-slate-500 font-semibold">kcal</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold">Calorie Target</p>
              </div>

              {/* Hydration */}
              <div className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-5 justify-center">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-slate-700">Hydration</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] rounded-full bg-cyan-500" />
                </div>
                <p className="text-[10px] text-slate-500 font-semibold">2.1L / 3.0L</p>
              </div>

              {/* Workout */}
              <div className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-5 justify-center">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-bold text-slate-700">Today's Workout</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Split</span>
                  <span className="text-violet-600 font-bold">Upper/Lower</span>
                </div>
                <span className="badge-emerald text-center">✓ Completed</span>
              </div>
            </div>
          </div>

          {/* Floating AI coach card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.4 }}
            className="hidden md:flex absolute -left-8 -top-8 glass-card border border-slate-200 rounded-2xl px-4 py-3 shadow-lg items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">AI Coach</p>
              <p className="text-xs font-bold text-slate-800">Great progress — 💧 stay hydrated!</p>
            </div>
          </motion.div>

          {/* Floating streak card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.8 }}
            className="hidden md:flex absolute -right-6 -bottom-6 glass-card border border-slate-200 rounded-2xl px-4 py-3 shadow-lg items-center gap-3"
          >
            <Flame className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-xl font-extrabold text-slate-900 leading-none">12</p>
              <p className="text-[10px] text-slate-500 font-semibold">Day Streak</p>
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
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Everything You Need to{' '}
            <span className="text-blue-600">Transform Your Health</span>
          </h2>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
            A complete AI-powered health ecosystem — from computer vision body analysis to intelligent coaching and comprehensive admin oversight.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card p-7 rounded-3xl border border-slate-200 flex flex-col gap-4"
            >
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${f.bg}`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-panel p-10 sm:p-14 rounded-3xl border border-slate-200 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-50/50 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 badge-emerald mb-6">
              <CheckCircle className="w-3.5 h-3.5" /> Free to Start — No Credit Card Required
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Ready to Start Your AI-Powered{' '}
              <span className="text-blue-600">Fitness Journey?</span>
            </h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">
              Join thousands of users getting personalized AI coaching tailored to their exact body composition and goals.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                  <Dumbbell className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-lg text-slate-900">
                  Fit<span className="text-blue-600">Vision</span> <span className="text-slate-400 font-medium text-sm">AI</span>
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Computer-vision body analysis, Gemini-powered diet & workout plans and a 24/7 context-aware AI coach — built for your fitness journey.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
                <li><Link to="/plans" className="hover:text-blue-600 transition-colors">My Plans</Link></li>
                <li><Link to="/progress" className="hover:text-blue-600 transition-colors">Progress Tracking</Link></li>
              </ul>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li>4-Angle Body Analysis</li>
                <li>Gemini AI Diet & Workout Plans</li>
                <li>Context-Aware AI Coach</li>
                <li>Admin Control Panel</li>
              </ul>
            </div>

            {/* Get Started */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Get Started</h4>
              <div className="space-y-3">
                <Link to="/signup" className="btn-primary text-sm inline-flex px-4 py-2">Create Free Account</Link>
                <div>
                  <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-1">
                    Sign In <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2026 FitVision · AI Fitness Coach</p>
            <p className="text-center sm:text-right">Automated AI metrics & plans are approximations — consult a licensed professional for medical advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
