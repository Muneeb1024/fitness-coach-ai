import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Flame, TrendingUp, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Today' },
  { to: '/plans',     icon: Dumbbell,        label: 'Plans'    },
  { to: '/calories',  icon: Flame,           label: 'Calories', highlight: true },
  { to: '/progress',  icon: TrendingUp,      label: 'Progress' },
  { to: '/profile',   icon: UserIcon,        label: 'Profile'  },
];

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role === 'admin') return null;
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-[#0B0C0E]/95 backdrop-blur-xl border-t border-slate-800 px-1 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+4px)]">
      <div className="flex items-end justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-200 min-w-[54px] ${
                isActive ? 'text-[#B8FD02]' : 'text-slate-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Calorie scanner: floating center pill */}
                {tab.highlight ? (
                  <div className={`relative -mt-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-[#B8FD02] border-[#B8FD02] shadow-[#B8FD02]/40'
                      : 'bg-[#16181C] border-slate-700 shadow-black/50'
                  }`}>
                    <tab.icon className={`w-5 h-5 ${isActive ? 'text-[#0B0C0E]' : 'text-[#B8FD02]'}`} />
                    {!isActive && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#B8FD02] flex items-center justify-center">
                        <span className="text-[6px] font-black text-[#0B0C0E]">AI</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <div className={`relative p-2 rounded-xl transition-all ${isActive ? 'bg-[#B8FD02]/15' : ''}`}>
                    <tab.icon className={`w-5 h-5 ${isActive ? 'text-[#B8FD02]' : ''}`} />
                    {isActive && (
                      <motion.span layoutId="bottomNavDot"
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#B8FD02]"
                      />
                    )}
                  </div>
                )}
                <span className={`text-[9px] font-black uppercase tracking-wide leading-none mt-0.5 ${
                  tab.highlight && !isActive ? 'text-[#B8FD02]' : isActive ? 'text-[#B8FD02]' : 'text-slate-500'
                }`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
