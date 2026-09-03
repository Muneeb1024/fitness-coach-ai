import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LogOut, Sparkles, LayoutDashboard, TrendingUp, Gift, User as UserIcon, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/plans', label: 'My Plans', icon: Sparkles },
    { to: '/progress', label: 'Progress', icon: TrendingUp },
    { to: '/profile', label: 'Profile', icon: UserIcon },
    { to: '/pricing', label: 'Beta Access', icon: Gift },
  ];

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0C0E]/90 backdrop-blur-xl border-b border-[#1E2229] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* Brand Logo */}
        <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -4 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-[#B8FD02] flex items-center justify-center shadow-lg shadow-[#B8FD02]/25 border border-[#B8FD02]"
          >
            <Dumbbell className="w-5 h-5 text-[#0B0C0E] font-black" />
          </motion.div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-[#FEF9F5]">
              FIT<span className="text-[#B8FD02]">VISION</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-extrabold text-slate-300 bg-[#16181C] border border-slate-800 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8FD02] animate-pulse" />
              by SoftnoveX
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        {user && !isAdmin && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${
                    isActive
                      ? 'bg-[#B8FD02]/15 text-[#B8FD02] border-[#B8FD02]/40 shadow-sm'
                      : 'text-slate-400 hover:text-[#FEF9F5] hover:bg-[#16181C] border-transparent'
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {user ? (
            <>
              {!isAdmin && user.streakCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30"
                >
                  <span className="fire-animate text-sm">🔥</span>
                  <span className="text-orange-400 text-xs font-black">{user.streakCount}</span>
                </motion.div>
              )}

              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <Link
                  to={isAdmin ? '/admin' : '/profile'}
                  className="hidden sm:flex items-center gap-2.5 group p-1 -m-1 rounded-xl hover:bg-[#16181C] transition-colors"
                  title="View Complete Health Profile & Settings"
                >
                  <div className="w-9 h-9 rounded-full bg-[#B8FD02]/20 border border-[#B8FD02]/40 group-hover:border-[#B8FD02] flex items-center justify-center text-[#B8FD02] font-black text-sm transition-colors overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#FEF9F5] group-hover:text-[#B8FD02] leading-tight transition-colors">{user.name?.split(' ')[0]}</p>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase bg-[#B8FD02]/15 border-[#B8FD02]/40 text-[#B8FD02]">
                        {isAdmin ? 'ADMIN' : 'PRO BETA'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 capitalize font-medium">{user.role === 'admin' ? 'System Admin' : 'Founder Profile'}</p>
                  </div>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              {!isAdmin && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/login" className="btn-secondary text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileOpen && user && !isAdmin && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-slate-800 px-4 py-3 space-y-1 bg-[#16181C]"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#B8FD02]/20 text-[#B8FD02] border border-[#B8FD02]/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`
              }
            >
              <link.icon className="w-4 h-4 text-[#B8FD02]" />
              {link.label}
            </NavLink>
          ))}
        </motion.div>
      )}
    </nav>
  );
}