import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../services/api';
import {
  ShieldAlert, CheckCircle, Flag, Trash2, Camera,
  MessageSquare, AlertCircle, RefreshCw, ShieldCheck
} from 'lucide-react';

export default function Moderation() {
  const [flaggedLogs, setFlaggedLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'photos'

  // No body-photo review pipeline is wired to the backend yet — this queue is
  // intentionally empty instead of showing fabricated sample uploads.
  const [userPhotos, setUserPhotos] = useState([]);

  useEffect(() => {
    fetchFlaggedChats();
  }, []);

  const fetchFlaggedChats = async () => {
    try {
      const res = await API.get('/admin/chat-flags');
      setFlaggedLogs(res.data.flaggedLogs || []);
    } catch (err) {
      toast.error('Could not fetch flagged chat logs');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveChatFlag = async (chatId) => {
    const toastId = toast.loading('Resolving chat flag...');
    try {
      await API.put(`/admin/chat-flags/${chatId}/resolve`);
      setFlaggedLogs((prev) => prev.filter((c) => c._id !== chatId));
      toast.success('Chat query flag resolved!', { id: toastId });
    } catch (err) {
      toast.error('Failed to resolve flag', { id: toastId });
    }
  };



  return (
    <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden min-w-0 text-[#FEF9F5]">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Safety & Content Moderation Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FEF9F5] tracking-tight uppercase">
              Safety & Moderation Center
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Review flagged AI chat queries, audit uploaded body images & manage trust & safety policies
            </p>
          </div>
        </motion.div>

        {/* Tab Selection */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border whitespace-nowrap ${
              activeTab === 'chats'
                ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02] shadow-md shadow-[#B8FD02]/20'
                : 'bg-[#16181C] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Flagged Chat Queries ({flaggedLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border whitespace-nowrap ${
              activeTab === 'photos'
                ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02] shadow-md shadow-[#B8FD02]/20'
                : 'bg-[#16181C] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" /> Body Image Moderation ({userPhotos.length})
          </button>
        </div>

        {/* TAB 1: FLAGGED CHAT QUERIES */}
        {activeTab === 'chats' && (
          <div className="space-y-4">
            {flaggedLogs.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-3xl bg-[#16181C] border border-slate-800 space-y-2">
                <CheckCircle className="w-10 h-10 text-[#B8FD02] mx-auto" />
                <h3 className="font-black text-[#FEF9F5] text-base uppercase">No Flagged Chat Queries Pending</h3>
                <p className="text-xs text-slate-400">All user RAG chat queries currently pass safety thresholds.</p>
              </div>
            ) : (
              flaggedLogs.map((log) => (
                <div key={log._id} className="glass-card p-6 rounded-3xl bg-[#16181C] border border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-[#FEF9F5] text-sm">{log.userId?.name || 'User'}</span>
                      <span className="text-xs text-slate-400 ml-2">({log.userId?.email || 'email'})</span>
                    </div>
                    <button
                      onClick={() => handleResolveChatFlag(log._id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#B8FD02]/15 text-[#B8FD02] border border-[#B8FD02]/40 hover:bg-[#B8FD02]/30 font-black uppercase text-[11px] transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve Flag
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0B0C0E] border border-rose-500/30 text-xs text-rose-300">
                    <p className="font-black uppercase text-[10px]">Flag Trigger Reason:</p>
                    <p className="mt-0.5">{log.flagReason || 'Potential safety keyword triggered in user prompt.'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: BODY PHOTO MODERATION */}
        {activeTab === 'photos' && (
          <div className="glass-panel p-12 text-center rounded-3xl bg-[#16181C] border border-slate-800 space-y-2">
            <Camera className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="font-black text-[#FEF9F5] text-base uppercase">No Photo Review Queue</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Uploaded body photos are not sent through a moderation pipeline yet, so there is nothing to review here.
              This queue will populate once photo storage & review are wired up.
            </p>
          </div>
        )}

    </main>
  );
}