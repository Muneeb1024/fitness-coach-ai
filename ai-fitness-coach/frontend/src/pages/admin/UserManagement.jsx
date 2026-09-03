import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../services/api';
import {
  Users, Search, Ban, CheckCircle, Plus, Pencil, Trash2,
  KeyRound, Copy, X, Shield, ShieldAlert, Eye, EyeOff,
  UserCheck, Filter, ChevronDown, Sparkles, RefreshCw
} from 'lucide-react';

const ROLE_COLORS = {
  admin: 'bg-[#B8FD02]/15 text-[#B8FD02] border-[#B8FD02]/30',
  user: 'bg-blue-500/15 text-blue-400 border-blue-400/30',
};
const STATUS_COLORS = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/30',
  banned: 'bg-red-500/15 text-red-400 border-red-400/30',
};

// ── Reusable modal backdrop ────────────────────────────────────────────────────
function Modal({ open, onClose, title, icon: Icon, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#16181C] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {Icon && <div className="w-8 h-8 rounded-xl bg-[#B8FD02]/10 flex items-center justify-center"><Icon className="w-4 h-4 text-[#B8FD02]" /></div>}
              <h2 className="text-lg font-bold text-[#FEF9F5]">{title}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Input helper ───────────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, required, hint }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value} onChange={onChange} placeholder={placeholder}
          className="w-full bg-[#0B0C0E] border border-slate-700 rounded-xl px-4 py-3 text-sm text-[#FEF9F5] placeholder-slate-500 focus:outline-none focus:border-[#B8FD02] focus:ring-1 focus:ring-[#B8FD02]/30 transition-all pr-10"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, required }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <div className="relative">
        <select
          value={value} onChange={onChange}
          className="w-full bg-[#0B0C0E] border border-slate-700 rounded-xl px-4 py-3 text-sm text-[#FEF9F5] focus:outline-none focus:border-[#B8FD02] focus:ring-1 focus:ring-[#B8FD02]/30 transition-all appearance-none cursor-pointer"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Credentials card shown after create ────────────────────────────────────────
function CredCard({ creds, onClose }) {
  const copy = (val) => { navigator.clipboard.writeText(val); toast.success('Copied!'); };
  return (
    <div className="mt-4 bg-[#0B0C0E] border border-[#B8FD02]/30 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-[#B8FD02]" />
        <span className="text-sm font-bold text-[#B8FD02]">Credentials Created</span>
      </div>
      {[['Email', creds.email], ['Password', creds.password], ['Role', creds.role]].map(([k, v]) => (
        <div key={k} className="flex items-center justify-between bg-[#16181C] border border-slate-700 rounded-lg px-3 py-2">
          <div>
            <p className="text-xs text-slate-500">{k}</p>
            <p className="text-sm font-mono text-[#FEF9F5]">{v}</p>
          </div>
          <button onClick={() => copy(v)} className="text-slate-400 hover:text-[#B8FD02] transition-colors"><Copy className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <p className="text-xs text-slate-500 mt-2">⚠️ Save these credentials now — the password won't be shown again.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newCreds, setNewCreds] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user', status: 'active' });
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.users || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) return toast.error('All fields are required');
    setSaving(true);
    const toastId = toast.loading('Creating user...');
    try {
      const res = await API.post('/admin/users', createForm);
      setUsers((prev) => [res.data.user, ...prev]);
      setNewCreds({ email: createForm.email, password: createForm.password, role: createForm.role });
      setCreateForm({ name: '', email: '', password: '', role: 'user' });
      toast.success('User created successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user', { id: toastId });
    } finally { setSaving(false); }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const openEdit = (u) => {
    setTargetUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    setEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Updating user...');
    try {
      const res = await API.put(`/admin/users/${targetUser._id}`, editForm);
      setUsers((prev) => prev.map((u) => u._id === targetUser._id ? { ...u, ...res.data.user } : u));
      toast.success('User updated!', { id: toastId });
      setEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed', { id: toastId });
    } finally { setSaving(false); }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setSaving(true);
    const toastId = toast.loading('Deleting user...');
    try {
      await API.delete(`/admin/users/${targetUser._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
      toast.success('User deleted', { id: toastId });
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed', { id: toastId });
    } finally { setSaving(false); }
  };

  // ── Reset Password ──────────────────────────────────────────────────────────
  const handleResetPw = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return toast.error('Minimum 6 characters');
    setSaving(true);
    const toastId = toast.loading('Resetting password...');
    try {
      await API.put(`/admin/users/${targetUser._id}/password`, { newPassword });
      toast.success('Password reset successfully!', { id: toastId });
      setResetPwOpen(false);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed', { id: toastId });
    } finally { setSaving(false); }
  };

  // ── Ban / Unban ─────────────────────────────────────────────────────────────
  const handleToggleBan = async (u) => {
    const action = u.status === 'banned' ? 'unban' : 'ban';
    const toastId = toast.loading(`${action === 'ban' ? 'Banning' : 'Unbanning'} ${u.name}...`);
    try {
      await API.put(`/admin/users/${u._id}/status`, { action });
      setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, status: action === 'ban' ? 'banned' : 'active' } : x));
      toast.success(`User ${action}ned`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed', { id: toastId });
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  const btnBase = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50';

  return (
    <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden min-w-0 text-[#FEF9F5]">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#B8FD02]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8FD02]">User Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FEF9F5]">All Users</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} accounts · {users.filter(u => u.status === 'active').length} active · {users.filter(u => u.status === 'banned').length} banned</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchUsers} className={`${btnBase} bg-slate-800 text-slate-300 hover:bg-slate-700`}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => { setNewCreds(null); setCreateOpen(true); }} className={`${btnBase} bg-[#B8FD02] text-[#0B0C0E] hover:bg-[#a5e800] shadow-lg shadow-[#B8FD02]/20`}>
            <Plus className="w-4 h-4" /> Create User
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email..."
            className="w-full bg-[#16181C] border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-[#FEF9F5] placeholder-slate-500 focus:outline-none focus:border-[#B8FD02] transition-all" />
        </div>
        <div className="flex gap-2">
          {[['all', 'All Status'], ['active', 'Active'], ['banned', 'Banned']].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${statusFilter === v ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02]' : 'bg-[#16181C] text-slate-400 border-slate-700 hover:border-slate-600'}`}>
              {l}
            </button>
          ))}
          {[['all', 'All Roles'], ['user', 'Users'], ['admin', 'Admins']].map(([v, l]) => (
            <button key={v} onClick={() => setRoleFilter(v)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${roleFilter === v ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02]' : 'bg-[#16181C] text-slate-400 border-slate-700 hover:border-slate-600'}`}>
              {l}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="bg-[#16181C] border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-[#B8FD02] border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400">Loading users...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0B0C0E]/50">
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#B8FD02]/10 border border-[#B8FD02]/20 flex items-center justify-center font-bold text-[#B8FD02] text-sm flex-shrink-0">
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#FEF9F5]">{u.name}</p>
                          <p className="text-slate-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wide ${ROLE_COLORS[u.role] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                        {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wide ${STATUS_COLORS[u.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                        {u.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(u)} title="Edit"
                          className="p-2 rounded-lg hover:bg-blue-500/10 hover:text-blue-400 text-slate-400 transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setTargetUser(u); setResetPwOpen(true); setNewPassword(''); }} title="Reset Password"
                          className="p-2 rounded-lg hover:bg-[#B8FD02]/10 hover:text-[#B8FD02] text-slate-400 transition-all">
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleBan(u)} title={u.status === 'banned' ? 'Unban' : 'Ban'}
                          className={`p-2 rounded-lg transition-all ${u.status === 'banned' ? 'hover:bg-emerald-500/10 hover:text-emerald-400' : 'hover:bg-orange-500/10 hover:text-orange-400'} text-slate-400`}>
                          {u.status === 'banned' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => { setTargetUser(u); setDeleteOpen(true); }} title="Delete"
                            className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── CREATE USER MODAL ────────────────────────────────────────────────── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New User" icon={Plus}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Full Name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="John Doe" required />
          <Field label="Email Address" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="john@example.com" required />
          <Field label="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Min 6 characters" required hint="The user can change this after signing in." />
          <SelectField label="Role" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} required
            options={[{ value: 'user', label: '👤 User — Regular member' }, { value: 'admin', label: '🛡️ Admin — Full panel access' }]} />

          {newCreds && <CredCard creds={newCreds} onClose={() => setNewCreds(null)} />}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className={`${btnBase} flex-1 bg-slate-800 text-slate-300 hover:bg-slate-700`}>Cancel</button>
            <button type="submit" disabled={saving} className={`${btnBase} flex-1 bg-[#B8FD02] text-[#0B0C0E] hover:bg-[#a5e800] justify-center`}>
              {saving ? <div className="w-4 h-4 border-2 border-[#0B0C0E] border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* ── EDIT USER MODAL ──────────────────────────────────────────────────── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit: ${targetUser?.name}`} icon={Pencil}>
        <form onSubmit={handleEdit} className="space-y-4">
          <Field label="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Full name" required />
          <Field label="Email Address" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" required />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Role" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              options={[{ value: 'user', label: '👤 User' }, { value: 'admin', label: '🛡️ Admin' }]} />
            <SelectField label="Status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              options={[{ value: 'active', label: '✅ Active' }, { value: 'banned', label: '🚫 Banned' }]} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditOpen(false)} className={`${btnBase} flex-1 bg-slate-800 text-slate-300 hover:bg-slate-700`}>Cancel</button>
            <button type="submit" disabled={saving} className={`${btnBase} flex-1 bg-[#B8FD02] text-[#0B0C0E] hover:bg-[#a5e800] justify-center`}>
              {saving ? <div className="w-4 h-4 border-2 border-[#0B0C0E] border-t-transparent rounded-full animate-spin" /> : <Pencil className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ── RESET PASSWORD MODAL ─────────────────────────────────────────────── */}
      <Modal open={resetPwOpen} onClose={() => setResetPwOpen(false)} title={`Reset Password: ${targetUser?.name}`} icon={KeyRound}>
        <form onSubmit={handleResetPw} className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400">
            ⚠️ This will immediately change the user's password. Make sure to share the new credentials securely.
          </div>
          <Field label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required hint="Minimum 6 characters." />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setResetPwOpen(false)} className={`${btnBase} flex-1 bg-slate-800 text-slate-300 hover:bg-slate-700`}>Cancel</button>
            <button type="submit" disabled={saving} className={`${btnBase} flex-1 bg-[#B8FD02] text-[#0B0C0E] hover:bg-[#a5e800] justify-center`}>
              {saving ? <div className="w-4 h-4 border-2 border-[#0B0C0E] border-t-transparent rounded-full animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Reset Password
            </button>
          </div>
        </form>
      </Modal>

      {/* ── DELETE CONFIRM MODAL ─────────────────────────────────────────────── */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete User" icon={Trash2}>
        <div className="space-y-5">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
            <p className="font-semibold mb-1">⚠️ This action is irreversible</p>
            <p>You are about to permanently delete <strong>{targetUser?.name}</strong> ({targetUser?.email}). All their data including plans, progress, and chat logs will be removed.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteOpen(false)} className={`${btnBase} flex-1 bg-slate-800 text-slate-300 hover:bg-slate-700`}>Cancel</button>
            <button onClick={handleDelete} disabled={saving} className={`${btnBase} flex-1 bg-red-500 text-white hover:bg-red-600 justify-center`}>
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>

    </main>
  );
}