import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Users, Search, Ban, CheckCircle, Sliders, Activity } from 'lucide-react';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userObj) => {
    const isBanned = userObj.status === 'banned';
    const action = isBanned ? 'unban' : 'ban';
    const toastId = toast.loading(`${isBanned ? 'Unbanning' : 'Banning'} ${userObj.name}...`);

    try {
      const res = await API.put(`/admin/users/${userObj._id}/ban`, { action });
      toast.success(res.data.message, { id: toastId });

      // Update state locally
      setUsers((prev) =>
        prev.map((u) => (u._id === userObj._id ? { ...u, status: isBanned ? 'active' : 'banned' } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed', { id: toastId });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-[#F3F6FB] text-slate-900">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="badge-purple inline-flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5" /> User Directory & Governance
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">User Management Console</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage registered accounts, review metrics & enforce status bans</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-card p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            {['all', 'active', 'banned'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl font-bold uppercase transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'glass-card text-slate-500 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role & Status</th>
                  <th className="p-4">Fitness Metrics</th>
                  <th className="p-4">Streak</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${u.role === 'admin' ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {u.role}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${u.status === 'banned' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {u.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-700">Goal: {u.goals?.primaryGoal || 'Maintenance'}</p>
                        <p className="text-[10px] text-slate-500">BMI: {u.bodyMetrics?.estimatedBmi || 22.8} • Height: {u.bodyMetrics?.heightCm || 175}cm</p>
                      </td>
                      <td className="p-4 font-bold text-orange-600">
                        🔥 {u.streakCount || 0} Days
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] transition-all flex items-center gap-1"
                          >
                            <Activity className="w-3.5 h-3.5" /> Details
                          </button>
                          <button
                            onClick={() => navigate(`/admin/plan-override?userId=${u._id}`)}
                            className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 font-bold text-[11px] transition-all flex items-center gap-1"
                          >
                            <Sliders className="w-3.5 h-3.5" /> Override
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBan(u)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ${
                                u.status === 'banned'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {u.status === 'banned' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              {u.status === 'banned' ? 'Unban' : 'Ban'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-lg text-slate-900">{selectedUser.name} - Profile Inspection</h3>
                <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <p className="text-slate-500 font-semibold">Primary Goal</p>
                    <p className="font-bold text-emerald-600 mt-1">{selectedUser.goals?.primaryGoal || 'Maintenance'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <p className="text-slate-500 font-semibold">Estimated BMI</p>
                    <p className="font-bold text-cyan-700 mt-1">{selectedUser.bodyMetrics?.estimatedBmi || 22.8}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <p className="text-slate-500 font-semibold">Posture Evaluation</p>
                  <p className="text-slate-700 leading-relaxed">{selectedUser.bodyMetrics?.postureStatus || 'Normal posture detected.'}</p>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <p className="text-slate-500 font-semibold">Food Allergies</p>
                  <p className="text-amber-700 font-medium">{selectedUser.goals?.allergies?.join(', ') || 'None reported'}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setSelectedUser(null)} className="btn-secondary text-xs font-bold">
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}