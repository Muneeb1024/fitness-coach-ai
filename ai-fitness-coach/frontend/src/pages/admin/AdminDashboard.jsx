import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../services/api';
import {
  Users, Activity, ShieldCheck, TrendingUp, Sparkles,
  BarChart2, ShieldAlert, Clock, Filter, RefreshCw, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logFilter, setLogFilter] = useState('ALL');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      const res = await API.get('/admin/analytics');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const analytics = data?.analytics || {};

  // Real 7-day trend computed by the backend — never hardcoded sample data.
  const trendData = data?.analytics?.weeklyTrend || [];
  const hasTrend = trendData.some((d) => (d.users || 0) + (d.plans || 0) + (d.chats || 0) > 0);
  const noTrendMessage = (
    <div className="h-[220px] flex items-center justify-center text-slate-500 text-xs uppercase tracking-wider">
      No activity recorded in the past 7 days
    </div>
  );

  const filteredLogs = (data?.recentAdminLogs || []).filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.action.includes(logFilter);
  });

  const tooltipStyle = {
    backgroundColor: '#16181C',
    border: '1px solid rgba(184, 253, 2, 0.3)',
    borderRadius: '16px',
    fontSize: '12px',
    color: '#FEF9F5',
    boxShadow: '0 12px 32px rgba(0,0,0,0.7)'
  };

  return (
    <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto overflow-x-hidden min-w-0 text-[#FEF9F5]">

        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#B8FD02]/15 border border-[#B8FD02]/40 text-[#B8FD02] text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> SoftnoveX Control Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FEF9F5] tracking-tight uppercase">
              Platform & AI Analytics
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Current platform telemetry — refreshed on demand
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="btn-secondary text-xs font-black uppercase tracking-wider flex items-center gap-2 px-4 py-2.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B8FD02] ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-3xl bg-[#16181C] border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Members</span>
              <Users className="w-5 h-5 text-[#B8FD02]" />
            </div>
            <p className="text-3xl font-black text-[#FEF9F5]">{analytics.totalUsers ?? 0}</p>
            <p className="text-xs text-[#B8FD02] flex items-center gap-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> {analytics.activeUsers ?? 0} Active Accounts
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-3xl bg-[#16181C] border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Plans Generated</span>
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-[#FEF9F5]">{analytics.totalPlansGenerated ?? 0}</p>
            <p className="text-xs text-cyan-400 font-bold">
              {analytics.planCompletionRate == null ? '—' : `${analytics.planCompletionRate}%`} Completion Rate
              {analytics.planCompletionRate == null && <span className="text-slate-500 normal-case"> (not tracked yet)</span>}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-3xl bg-[#16181C] border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Fitness Score</span>
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-[#FEF9F5]">{analytics.averageFitnessScore ?? '—'}</p>
            <p className="text-xs text-amber-400 font-bold">Out of 100 Health Index</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-3xl bg-[#16181C] border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flagged Chat Queries</span>
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-3xl font-black text-rose-400">{analytics.flaggedChatsCount || 0}</p>
            <p className="text-xs text-rose-400 font-bold">Requires Moderation Review</p>
          </motion.div>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Area Chart */}
          <div className="glass-panel p-6 rounded-3xl bg-[#16181C] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#FEF9F5] text-sm uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#B8FD02]" /> Weekly Platform Volume & AI Usage
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#B8FD02]/15 text-[#B8FD02] border border-[#B8FD02]/40">
                Refreshed on demand
              </span>
            </div>

            {!hasTrend && noTrendMessage}
            {hasTrend && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="aiChatsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8FD02" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#B8FD02" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="chats" stroke="#B8FD02" fill="url(#aiChatsGrad)" strokeWidth={2.5} name="AI Chat Queries" />
                <Area type="monotone" dataKey="plans" stroke="#38bdf8" fill="transparent" strokeWidth={2} name="Plans Generated" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart */}
          <div className="glass-panel p-6 rounded-3xl bg-[#16181C] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#FEF9F5] text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Daily Plan Generations Trend
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
                Gemini 2.5 Flash
              </span>
            </div>

            {!hasTrend && noTrendMessage}
            {hasTrend && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} barSize={24}>
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="plans" fill="#B8FD02" radius={[8, 8, 0, 0]} name="Plans" />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* System Audit Action Log */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h3 className="font-black text-lg text-[#FEF9F5] uppercase tracking-tight flex items-center gap-2">
              System Audit Logs <ShieldCheck className="w-5 h-5 text-[#B8FD02]" />
            </h3>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              {['ALL', 'BAN', 'OVERRIDE', 'PROMPT'].map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setLogFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-xl font-black uppercase text-[11px] tracking-wider transition-all border ${
                    logFilter === filterKey
                      ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02] shadow-md shadow-[#B8FD02]/20'
                      : 'bg-[#0B0C0E] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">No administrative actions logged under this filter.</p>
            ) : (
              filteredLogs.map((log, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#0B0C0E] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[#B8FD02] px-2.5 py-1 rounded-lg bg-[#B8FD02]/15 border border-[#B8FD02]/30 uppercase text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-slate-300 font-medium">{log.details}</span>
                  </div>
                  <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" /> {new Date(log.createdAt || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

    </main>
  );
}