import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Dumbbell, Moon, UtensilsCrossed, ChevronUp, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuickLogSheet({ progress, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState('');

  const handleLog = async (type, value, label) => {
    if (loading) return;
    setLoading(type);
    try {
      await onUpdate({ [type]: value }, label);
      toast.success(`✅ ${label} logged!`);
    } catch (e) {
      toast.error('Could not log. Try again.');
    } finally {
      setLoading('');
    }
  };

  const waterPct = Math.min(100, Math.round(((progress?.waterMl || 0) / 2500) * 100));
  const workoutDone = progress?.workoutCompleted || false;

  const actions = [
    {
      id: 'waterMl',
      icon: Droplets,
      label: '+250ml Water',
      sublabel: `${progress?.waterMl || 0}ml / 2500ml`,
      pct: waterPct,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/40',
      bg: 'bg-blue-500/10',
      barColor: 'bg-blue-400',
      action: () => handleLog('waterMl', (progress?.waterMl || 0) + 250, '+250ml Water'),
    },
    {
      id: 'workoutCompleted',
      icon: Dumbbell,
      label: workoutDone ? 'Workout Done ✓' : 'Log Workout',
      sublabel: workoutDone ? 'Great work today!' : 'Mark as completed',
      pct: workoutDone ? 100 : 0,
      color: 'text-[#B8FD02]',
      borderColor: 'border-[#B8FD02]/40',
      bg: 'bg-[#B8FD02]/10',
      barColor: 'bg-[#B8FD02]',
      action: () => handleLog('workoutCompleted', true, 'Workout'),
      done: workoutDone,
    },
    {
      id: 'sleepHours',
      icon: Moon,
      label: 'Sleep 7h+',
      sublabel: `Last night: ${progress?.sleepHours || 7}h`,
      pct: Math.min(100, Math.round(((progress?.sleepHours || 0) / 8) * 100)),
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      bg: 'bg-purple-500/10',
      barColor: 'bg-purple-400',
      action: () => handleLog('sleepHours', 7.5, '7.5h Sleep'),
    },
    {
      id: 'meal',
      icon: UtensilsCrossed,
      label: 'Log a Meal',
      sublabel: `${progress?.mealsLogged?.filter((m) => m.consumed).length || 0}/${progress?.mealsLogged?.length || 4} meals`,
      pct: Math.round(((progress?.mealsLogged?.filter((m) => m.consumed).length || 0) / (progress?.mealsLogged?.length || 4)) * 100),
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      barColor: 'bg-amber-400',
      action: () => {
        setOpen(false);
        toast('Use the meal trackers below ↓', { icon: '🍽️' });
      },
    },
  ];

  return (
    <>
      {/* Floating Pill Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-[#16181C] border border-[#B8FD02]/50 text-[#B8FD02] text-xs font-black uppercase tracking-wider shadow-xl hover:bg-[#B8FD02] hover:text-[#0B0C0E] transition-all duration-200 group"
      >
        <ChevronUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Quick Log
        <span className="w-2 h-2 rounded-full bg-[#B8FD02] animate-pulse" />
      </button>

      {/* Bottom Sheet Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#16181C] border-t border-slate-700 rounded-t-3xl p-6 pb-10 shadow-2xl"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-5" />

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-[#FEF9F5] uppercase tracking-wide">Quick Log</h3>
                  <p className="text-xs text-slate-400">5-second daily check-in</p>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl bg-[#0B0C0E] text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {actions.map((a) => (
                  <button
                    key={a.id}
                    onClick={a.action}
                    disabled={loading === a.id || a.done}
                    className={`p-4 rounded-2xl border ${a.bg} ${a.borderColor} text-left relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70`}
                  >
                    {/* Progress bar background */}
                    <div
                      className={`absolute bottom-0 left-0 h-1 ${a.barColor} transition-all duration-500`}
                      style={{ width: `${a.pct}%` }}
                    />

                    <div className="flex items-start justify-between mb-2">
                      <a.icon className={`w-5 h-5 ${a.color}`} />
                      {a.done ? (
                        <Check className="w-4 h-4 text-[#B8FD02]" />
                      ) : loading === a.id ? (
                        <span className="w-3 h-3 rounded-full border-2 border-[#B8FD02] border-t-transparent animate-spin" />
                      ) : (
                        <span className={`text-[10px] font-black ${a.color}`}>{a.pct}%</span>
                      )}
                    </div>
                    <p className={`text-xs font-black uppercase tracking-wide ${a.color}`}>{a.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{a.sublabel}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
