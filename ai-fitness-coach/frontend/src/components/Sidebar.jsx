import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Dumbbell, LayoutDashboard, Sparkles, TrendingUp,
  User as UserIcon, Gift, LogOut, Users, Sliders,
  ShieldAlert, ChevronRight, MessageSquare, Zap
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ onCloseMobile }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: "Today's Protocol" },
    { to: '/plans', label: 'My Plans', icon: Sparkles, desc: 'AI Diet & Workout' },
    { to: '/progress', label: 'Progress', icon: TrendingUp, desc: 'Biometric Timeline' },
    { to: '/profile', label: 'Profile Hub', icon: UserIcon, desc: 'Posture & Details' },
    { to: '/pricing', label: 'Beta Access', icon: Gift, badge: 'FOUNDER' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Analytics', icon: LayoutDashboard, exact: true, badge: 'Live' },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/ai-monitor', label: 'AI Output & Prompts', icon: Sparkles },
    { to: '/admin/plan-override', label: 'Plan Override Studio', icon: Sliders },
    { to: '/admin/moderation', label: 'Moderation Console', icon: ShieldAlert }
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <aside className="w-64 sm:w-72 bg-[#0B0C0E] border-r border-slate-800 h-screen sticky top-0 flex flex-col justify-between p-4 sm:p-5 z-40 transition-colors duration-200 select-none">

      {/* Top Header & Links */}
      <div className="space-y-6">

        {/* Brand Header */}
        <Link
          to={user ? (isAdmin ? '/admin' : '/dashboard') : '/'}
          onClick={onCloseMobile}
          className="flex items-center gap-3 px-2 group"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: -4 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-2xl bg-[#B8FD02] flex items-center justify-center shadow-lg shadow-[#B8FD02]/25 border border-[#B8FD02] shrink-0"
          >
            <Dumbbell className="w-5 h-5 text-[#0B0C0E] font-black" />
          </motion.div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-[#FEF9F5]">
                FIT<span className="text-[#B8FD02]">VISION</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8FD02] animate-pulse" />
              by SoftnoveX AI
            </p>
          </div>
        </Link>

        {/* Navigation Section */}
        <div>
          <div className="flex items-center justify-between px-2.5 mb-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {isAdmin ? 'System Control' : 'Main Menu'}
            </span>
            {!isAdmin && user?.streakCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black">
                🔥 {user.streakCount}d
              </span>
            )}
          </div>

          <nav className="space-y-1.5">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 border ${
                    isActive
                      ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02] shadow-lg shadow-[#B8FD02]/20 font-black scale-[1.02]'
                      : 'text-slate-400 hover:text-[#FEF9F5] hover:bg-[#16181C] border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#0B0C0E]' : 'text-[#B8FD02]'}`} />
                      <div className="text-left truncate">
                        <p className="truncate leading-snug">{item.label}</p>
                      </div>
                    </div>

                    {item.badge ? (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isActive
                          ? 'bg-[#0B0C0E] text-[#B8FD02]'
                          : 'bg-[#B8FD02]/15 text-[#B8FD02] border border-[#B8FD02]/40'
                      }`}>
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform shrink-0 ${isActive ? 'text-[#0B0C0E] opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* AI Quick Assistant Banner */}
        {!isAdmin && (
          <div className="p-3.5 rounded-2xl bg-[#16181C] border border-[#B8FD02]/25 space-y-2">
            <div className="flex items-center gap-2 text-[#B8FD02] text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> 24/7 AI Coach Active
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Ask questions about meal swaps, workout form, or recovery anytime.
            </p>
          </div>
        )}
      </div>

      {/* User Footer Card */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        {/* User Profile Mini Bar */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#16181C] border border-slate-800">
          <Link
            to={isAdmin ? '/admin' : '/profile'}
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 min-w-0 flex-1 group"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#B8FD02]/20 border border-[#B8FD02]/40 group-hover:border-[#B8FD02] flex items-center justify-center text-[#B8FD02] font-black text-xs shrink-0 overflow-hidden transition-colors">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div className="text-left min-w-0 flex-1 truncate">
              <p className="text-xs font-bold text-[#FEF9F5] group-hover:text-[#B8FD02] truncate transition-colors leading-tight">
                {user?.name || 'Athlete'}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-extrabold truncate">
                {isAdmin ? 'System Admin' : 'Founder Beta'}
              </p>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle className="p-1.5 rounded-lg" />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </aside>
  );
}