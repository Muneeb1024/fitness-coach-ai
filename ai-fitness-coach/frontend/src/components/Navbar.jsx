import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LogOut, Sparkles, LayoutDashboard, TrendingUp, CreditCard, Menu, X, Crown } from 'lucide-react';

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
    { to: '/pricing', label: 'Membership', icon: CreditCard },
  ];

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md"
          >
            <Dumbbell className="w-5 h-5 text-white font-bold" />
          </motion.div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 hidden sm:block">
            Fit<span className="text-blue-600">Vision</span> <span className="text-slate-400 font-medium text-sm">AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {user && !isAdmin && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {!isAdmin && user.streakCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200"
                >
                  <span className="fire-animate text-base">🔥</span>
                  <span className="text-orange-600 text-xs font-extrabold">{user.streakCount}</span>
                </motion.div>
              )}

              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-extrabold text-sm">
                    {getInitials(user.name)}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name?.split(' ')[0]}</p>
                      {user.subscription?.tier && (
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                          user.subscription.tier === 'elite'
                            ? 'bg-amber-400/15 border-amber-400/30 text-amber-600'
                            : user.subscription.tier === 'pro'
                            ? 'bg-purple-500/15 border-purple-500/30 text-purple-600'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {user.subscription.tier}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              {!isAdmin && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-sm hidden sm:block">
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/signup" className="btn-primary text-sm">
                  Get Started
                </Link>
              </motion.div>
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
          className="md:hidden border-t border-slate-200 px-4 py-3 space-y-1"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`
              }
            >
              <link.icon className="w-4 h-4 text-blue-600" />
              {link.label}
            </NavLink>
          ))}
        </motion.div>
      )}
    </nav>
  );
}