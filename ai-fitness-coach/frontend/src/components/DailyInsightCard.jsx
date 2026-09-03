import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import API from '../services/api';

export default function DailyInsightCard() {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsight();
  }, []);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const res = await API.get('/insight/daily');
      setInsight(res.data.insight || '');
    } catch (_) {
      setInsight('Stay consistent with your daily habits — small daily actions compound into transformational results. 💪');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#16181C] border border-[#B8FD02]/25 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#B8FD02]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#B8FD02]/15 border border-[#B8FD02]/30 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-[#B8FD02]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B8FD02]">
              AI Coach Insight · Today
            </span>
            <button
              onClick={fetchInsight}
              disabled={loading}
              className="text-slate-500 hover:text-[#B8FD02] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-1.5">
              <div className="h-3 bg-slate-700 rounded-full w-full animate-pulse" />
              <div className="h-3 bg-slate-700 rounded-full w-4/5 animate-pulse" />
            </div>
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed">{insight}</p>
          )}
        </div>
      </div>
    </div>
  );
}
