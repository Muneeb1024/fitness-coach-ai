import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck } from 'lucide-react';

function getScore(user) {
  let score = 0;
  const max = 100;
  const fields = [
    { label: 'Name', earned: 15, done: !!user?.name },
    { label: 'Height & Weight', earned: 15, done: !!(user?.bodyMetrics?.heightCm && user?.bodyMetrics?.weightKg) },
    { label: 'Fitness Goal', earned: 15, done: !!user?.goals?.primaryGoal && user.goals.primaryGoal !== 'maintenance' },
    { label: 'Posture Scan (4 photos)', earned: 30, done: !!(user?.profileImages?.front && user?.profileImages?.back && user?.profileImages?.left && user?.profileImages?.right) },
    { label: 'Activity Level', earned: 10, done: !!user?.goals?.activityLevel },
    { label: 'Dietary Preferences', earned: 15, done: !!(user?.goals?.allergies?.length) },
  ];

  for (const f of fields) {
    if (f.done) score += f.earned;
  }

  const incomplete = fields.filter((f) => !f.done);
  return { score, fields, incomplete };
}

export default function ProfileStrengthBar() {
  const { user } = useAuth();
  const { score, incomplete } = getScore(user);

  if (score >= 90) return null; // hide when profile is complete

  const color = score < 40 ? '#F87171' : score < 70 ? '#F59E0B' : '#B8FD02';

  return (
    <div className="bg-[#16181C] border border-slate-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#B8FD02]" />
          <span className="text-xs font-black text-[#FEF9F5] uppercase tracking-wide">Profile Strength</span>
        </div>
        <span className="text-lg font-black" style={{ color }}>{score}%</span>
      </div>

      {/* Bar */}
      <div className="h-2 rounded-full bg-slate-800 mb-3">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>

      {/* Missing fields */}
      {incomplete.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
            Complete to improve AI accuracy:
          </p>
          {incomplete.slice(0, 2).map((f) => (
            <Link
              key={f.label}
              to="/onboarding"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0C0E] border border-slate-800 hover:border-[#B8FD02]/40 transition-colors group"
            >
              <span className="text-xs text-slate-300 font-semibold">{f.label}</span>
              <div className="flex items-center gap-1 text-slate-500 group-hover:text-[#B8FD02] transition-colors">
                <span className="text-[10px] font-black text-amber-400">+{f.earned}%</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
