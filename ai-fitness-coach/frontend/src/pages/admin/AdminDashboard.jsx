import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import {
  Users, Activity, ShieldCheck, TrendingUp, Sparkles,
  BarChart2, ShieldAlert, Clock, Filter, RefreshCw
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

  // Mock Trend Chart Data
  const trendData = [
    { day: 'Mon', users: 12, plans: 18, chats: 45 },
    { day: 'Tue', users: 19, plans: 24, chats: 62 },
    { day: 'Wed', users: 25, plans: 32, chats: 78 },
    { day: 'Thu', users: 31, plans: 41, chats: 95 },
    { day: 'Fri', users: 42, plans: 56, chats: 120 },
    { day: 'Sat', users: 58, plans: 73, chats: 155 },
    { day: 'Sun', users: 65, plans: 89, chats: 182 }
  ];

  const filteredLogs = (data?.recentAdminLogs || []).filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.action.includes(logFilter);
  });

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#0f172a',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)'
  };

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-[#F3F6FB] text-slate-900">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-7xl mx-auto overflow-x-hidden">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Administrator Control Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Real-Time Platform Analytics</h1>
            <p className="text-slate-500 text-sm mt-0.5">Live monitoring of user retention, plan generation, chat safety & system health</p>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="btn-secondary text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Metrics
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-3xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered Users</span>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{analytics.totalUsers || 1}</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> {analytics.activeUsers || 1} Active Accounts
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-3xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Plans Generated</span>
              <Sparkles className="w-5 h-5 text-cyan-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{analytics.totalPlansGenerated || 1}</p>
            <p className="text-xs text-cyan-600 font-semibold">{analytics.planCompletionRate || 84.2}% Completion Rate</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-3xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Fitness Score</span>
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{analytics.averageFitnessScore || 78.4}</p>
            <p className="text-xs text-amber-600 font-semibold">Out of 100 Index</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-3xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flagged Chat Queries</span>
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-3xl font-extrabold text-rose-600">{analytics.flaggedChatsCount || 0}</p>
            <p className="text-xs text-rose-600 font-semibold">Requires Moderation Review</p>
          </motion.div>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* User Registration & Active Engagement Area Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-600" /> Weekly Platform Volume & AI Usage
              </h3>
              <span className="badge-purple">Live Sync</span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="chats" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.15} strokeWidth={2} name="AI Chat Queries" />
                <Area type="monotone" dataKey="plans" stroke="#0EA5E9" fill="transparent" strokeWidth={2} name="Plans Generated" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Plan Execution Distribution */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" /> Daily Plan Generations Trend
              </h3>
              <span className="badge-emerald">Gemini AI</span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} barSize={24}>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="plans" fill="#10B981" radius={[8, 8, 0, 0]} name="Plans" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* System Audit Action Log */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              System Audit Logs <ShieldCheck className="w-5 h-5 text-violet-600" />
            </h3>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              {['ALL', 'BAN', 'OVERRIDE', 'PROMPT'].map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setLogFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    logFilter === filterKey
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'glass-card text-slate-500 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No administrative actions logged under this filter.</p>
            ) : (
              filteredLogs.map((log, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-violet-700 px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200">
                      {log.action}
                    </span>
                    <span className="text-slate-700 font-medium">{log.details}</span>
                  </div>
                  <span className="text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {new Date(log.createdAt || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}