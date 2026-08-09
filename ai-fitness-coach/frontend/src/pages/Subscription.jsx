import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Sparkles, Check, Crown, Shield, Zap, ArrowRight, HelpCircle } from 'lucide-react';

export default function Subscription() {
  const { user, updateUserState } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [loadingTier, setLoadingTier] = useState(null);

  const currentTier = user?.subscription?.tier || 'free';

  const handleUpgrade = async (targetTier) => {
    if (currentTier === targetTier) return toast.success(`You are already subscribed to ${targetTier.toUpperCase()}!`);

    setLoadingTier(targetTier);
    const toastId = toast.loading(`Upgrading subscription to ${targetTier.toUpperCase()}...`);

    try {
      const res = await API.post('/subscription/upgrade', {
        tier: targetTier,
        billingCycle
      });

      updateUserState(res.data.user);
      toast.success(`Upgraded to ${targetTier.toUpperCase()} Tier! 🎉`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed', { id: toastId });
    } finally {
      setLoadingTier(null);
    }
  };

  const tiers = [
    {
      id: 'free',
      name: 'Starter Free',
      description: 'Ideal for trying out basic AI fitness plan generation',
      priceMonthly: '$0',
      priceYearly: '$0',
      period: 'forever',
      badge: 'Free Tier',
      badgeClass: 'badge-emerald',
      features: [
        '1 AI Fitness Plan Generation / Mo',
        '5 Gemini RAG Coach Messages / Day',
        'Basic BMI & Body Fat Approximation',
        'Daily Water & Exercise Logging',
        'Standard Community Support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Coach',
      description: 'Unlimited AI plans, 24/7 Gemini coach & full 3D posture analysis',
      priceMonthly: '$14.99',
      priceYearly: '$11.99',
      period: 'per month',
      popular: true,
      badge: 'Most Popular ✨',
      badgeClass: 'badge-purple',
      features: [
        'Unlimited AI Diet & Workout Plan Generations',
        'Unlimited 24/7 Gemini RAG AI Coach Access',
        'Full 4-Angle 33-Landmark Posture Scan',
        'Allergy-Safe Dynamic Meal Substitutions',
        'Daily Macro & Calories Auto-Tracking',
        'Priority AI Prompt Engine Processing'
      ]
    },
    {
      id: 'elite',
      name: 'Elite VIP',
      description: 'Pro AI features + Admin custom overrides & human trainer review',
      priceMonthly: '$29.99',
      priceYearly: '$23.99',
      period: 'per month',
      badge: 'VIP Elite 👑',
      badgeClass: 'badge-cyan',
      features: [
        'Everything in Pro Coach Tier',
        'Direct Trainer Plan Overrides & Manual Edits',
        '1-on-1 Monthly Video Review Session',
        'Advanced Pose Symmetry & Alignment Scoring',
        'Dedicated VIP Account Management',
        'Early Access to New AI Models'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="badge-purple inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> FitVision AI Monetization & Membership
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Unlock Your Full Potential with <span className="gradient-text">FitVision AI</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Choose the membership tier that fits your goals. Upgrade or cancel anytime with a single click.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Annual Billing <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isCurrent = currentTier === tier.id;
          const isSelectedLoading = loadingTier === tier.id;

          return (
            <motion.div
              key={tier.id}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                tier.popular
                  ? 'bg-slate-900 text-slate-100 shadow-2xl border-2 border-purple-500/50'
                  : 'glass-panel border border-slate-200 text-slate-900'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-extrabold shadow-lg shadow-purple-500/30">
                  RECOMMENDED
                </div>
              )}

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${tier.badgeClass}`}>
                    {tier.badge}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Active Plan
                    </span>
                  )}
                </div>

                <div>
                  <h3 className={`text-xl font-extrabold ${tier.popular ? 'text-white' : 'text-slate-900'}`}>{tier.name}</h3>
                  <p className={`text-xs mt-1 leading-relaxed ${tier.popular ? 'text-slate-400' : 'text-slate-500'}`}>{tier.description}</p>
                </div>

                <div className="pt-2">
                  <span className={`text-4xl font-extrabold ${tier.popular ? 'text-white' : 'text-slate-900'}`}>
                    {billingCycle === 'yearly' ? tier.priceYearly : tier.priceMonthly}
                  </span>
                  <span className={`text-xs ml-1 font-semibold ${tier.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                    / {tier.period}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200/20">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className={`p-0.5 rounded-full mt-0.5 ${tier.popular ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-100 text-emerald-600'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className={tier.popular ? 'text-slate-300' : 'text-slate-600'}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isCurrent || isSelectedLoading}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : tier.popular
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:brightness-110'
                      : 'btn-primary'
                  }`}
                >
                  {isSelectedLoading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    <>Upgrade to {tier.name} <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
