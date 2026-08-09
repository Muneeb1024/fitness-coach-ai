import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, LayoutDashboard, Users, Sparkles, Sliders, ShieldAlert, Zap, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/admin', label: 'Analytics Dashboard', icon: LayoutDashboard, exact: true, badge: 'Live' },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/ai-monitor', label: 'AI Output & Prompts', icon: Sparkles },
    { to: '/admin/plan-override', label: 'Plan Override Studio', icon: Sliders },
    { to: '/admin/moderation', label: 'Moderation Console', icon: ShieldAlert }
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 p-5 min-h-[calc(100vh-73px)] flex flex-col justify-between">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-slate-900">
              Fit<span className="text-blue-600">Vision</span>
            </p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Admin Portal</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Control Center</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> System Online
            </span>
          </div>

          <nav className="space-y-1.5">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 border ${
                    isActive
                      ? 'bg-violet-50 text-violet-700 border-violet-200 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-violet-600' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-violet-600 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`} />
                    )}

                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-violet-500"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-semibold">Engine Version</span>
          <span className="text-violet-600 font-bold">v2.4.0</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <Zap className="w-3 h-3 inline -mt-0.5 mr-1 text-blue-500" />
          Gemini 1.5 RAG + MediaPipe 33-landmark pose sync active.
        </p>
      </div>
    </aside>
  );
}