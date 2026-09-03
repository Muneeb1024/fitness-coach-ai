import React from 'react';

/**
 * MacroRings — Three animated SVG rings showing Protein / Carbs / Fat consumed vs target.
 * Props: consumed = { protein, carbs, fat }, targets = { proteinGrams, carbsGrams, fatGrams }
 */
export default function MacroRings({ consumed = {}, targets = {} }) {
  const macros = [
    {
      key: 'protein',
      label: 'Protein',
      unit: 'g',
      consumed: consumed.protein || 0,
      target: targets.proteinGrams || 150,
      color: '#B8FD02',
      trackColor: 'rgba(184,253,2,0.12)',
      r: 44,
    },
    {
      key: 'carbs',
      label: 'Carbs',
      unit: 'g',
      consumed: consumed.carbs || 0,
      target: targets.carbsGrams || 220,
      color: '#60A5FA',
      trackColor: 'rgba(96,165,250,0.12)',
      r: 32,
    },
    {
      key: 'fat',
      label: 'Fat',
      unit: 'g',
      consumed: consumed.fat || 0,
      target: targets.fatGrams || 70,
      color: '#F59E0B',
      trackColor: 'rgba(245,158,11,0.12)',
      r: 20,
    },
  ];

  const SIZE = 120;
  const STROKE = 7;
  const CX = SIZE / 2;

  return (
    <div className="flex items-center gap-6">
      {/* Concentric SVG rings */}
      <div className="relative shrink-0">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {macros.map((m) => {
            const pct = Math.min(1, m.consumed / m.target);
            const circumference = 2 * Math.PI * m.r;
            const dashOffset = circumference * (1 - pct);
            return (
              <g key={m.key}>
                {/* Track ring */}
                <circle
                  cx={CX}
                  cy={CX}
                  r={m.r}
                  fill="none"
                  stroke={m.trackColor}
                  strokeWidth={STROKE}
                />
                {/* Progress ring */}
                <circle
                  cx={CX}
                  cy={CX}
                  r={m.r}
                  fill="none"
                  stroke={m.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${CX} ${CX})`}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </g>
            );
          })}
          {/* Center label */}
          <text x={CX} y={CX - 5} textAnchor="middle" fill="#FEF9F5" fontSize="11" fontWeight="900" fontFamily="inherit">
            MACROS
          </text>
          <text x={CX} y={CX + 9} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="inherit">
            TODAY
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2.5 flex-1">
        {macros.map((m) => {
          const pct = Math.min(100, Math.round((m.consumed / m.target) * 100));
          return (
            <div key={m.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: m.color }}>
                  {m.label}
                </span>
                <span className="text-[11px] text-slate-300 font-semibold">
                  {m.consumed}g <span className="text-slate-500">/ {m.target}g</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: m.trackColor }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: m.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
