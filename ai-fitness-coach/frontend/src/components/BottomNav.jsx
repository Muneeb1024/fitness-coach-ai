import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, LayoutDashboard, TrendingUp, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/plans', icon: Dumbbell, label: 'Plans' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Today' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: UserIcon, label: 'Profile' },
];

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  // Hide on admin routes
  if (!user || user.role === 'admin') return null;
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-[#0B0C0E]/95 backdrop-blur-xl border-t border-slate-800 px-2 pt-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? 'text-[#B8FD02]'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative p-2 rounded-xl transition-all ${isActive ? 'bg-[#B8FD02]/15' : ''}`}>
                  <tab.icon className={`w-5 h-5 ${isActive ? 'text-[#B8FD02]' : ''}`} />
                  {isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#B8FD02]" />
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-[#B8FD02]' : 'text-slate-500'}`}>
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
