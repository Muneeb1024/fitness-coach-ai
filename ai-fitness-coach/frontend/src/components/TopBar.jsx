import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Dumbbell, Sparkles, Flame, Calendar as CalendarIcon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const PAGE_TITLES = {
  '/dashboard': { title: 'Today\'s Protocol & Dashboard', subtitle: 'Live biometric tracking & daily nutrition' },
  '/plans': { title: 'Personalized AI Fitness Plans', subtitle: 'Gemini AI generated nutrition & workout splits' },
  '/progress': { title: 'Biometric Timeline & Analytics', subtitle: 'Long-term body composition & habit trends' },
  '/profile': { title: 'Complete Health & Posture Hub', subtitle: 'Manage biometrics, 4-angle scan, and equipment' },
  '/pricing': { title: 'Founder Beta Access', subtitle: '100% unlocked public beta features' },
  '/admin': { title: 'Administrator Control Center', subtitle: 'Real-time platform analytics and system health' },
  '/admin/users': { title: 'User Management', subtitle: 'Manage accounts and member privileges' },
  '/admin/ai-monitor': { title: 'AI Output & Prompts', subtitle: 'Monitor Gemini responses and system prompts' },
  '/admin/plan-override': { title: 'Plan Override Studio', subtitle: 'Directly modify user workout and diet plans' },
  '/admin/moderation': { title: 'Moderation Console', subtitle: 'Audit chat flags and community safety' }
};

export default function TopBar({ onOpenMobileMenu }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const current = PAGE_TITLES[location.pathname] || {
    title: 'FitVision AI',
    subtitle: 'Powered by SoftnoveX'
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-[#0B0C0E]/90 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile menu trigger + Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl bg-[#16181C] border border-slate-800 text-slate-300 hover:text-white"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Mini Logo */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B8FD02] flex items-center justify-center text-[#0B0C0E]">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>

        {/* Desktop Breadcrumb / Title */}
        <div className="hidden sm:block">
          <h1 className="text-base sm:text-lg font-black text-[#FEF9F5] tracking-tight">
            {current.title}
          </h1>
          <p className="text-[11px] text-slate-400">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Date, Streak, Theme, User Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16181C] border border-slate-800 text-xs font-bold text-slate-300">
          <CalendarIcon className="w-3.5 h-3.5 text-[#B8FD02]" />
          <span>{todayStr}</span>
        </div>

        {/* Streak Flame Badge */}
        {!isAdmin && user?.streakCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-black">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{user.streakCount} Day Streak</span>
          </div>
        )}

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* User Avatar Link */}
        <Link
          to={isAdmin ? '/admin' : '/profile'}
          className="w-8 h-8 rounded-full bg-[#B8FD02]/20 border border-[#B8FD02]/40 hover:border-[#B8FD02] flex items-center justify-center text-[#B8FD02] font-black text-xs shrink-0 overflow-hidden transition-all"
          title="My Profile"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user?.name?.slice(0, 2).toUpperCase() || 'FV'
          )}
        </Link>
      </div>
    </header>
  );
}
