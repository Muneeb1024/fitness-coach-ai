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

  // Sample photo moderation dataset
  const [userPhotos, setUserPhotos] = useState([
    {
      _id: 'photo_1',
      userName: 'John Doe',
      userEmail: 'user@fitvision.ai',
      angle: 'Front View',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
      status: 'Pending Review'
    },
    {
      _id: 'photo_2',
      userName: 'John Doe',
      userEmail: 'user@fitvision.ai',
      angle: 'Back View',
      url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80',
      status: 'Pending Review'
    }
  ]);

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
      await API.put(`/admin/chats/${chatId}/moderate`);
      setFlaggedLogs((prev) => prev.filter((c) => c._id !== chatId));
      toast.success('Chat query flag resolved!', { id: toastId });
    } catch (err) {
      toast.error('Failed to resolve flag', { id: toastId });
    }
  };

  const handleDeletePhoto = (photoId) => {
    setUserPhotos((prev) => prev.filter((p) => p._id !== photoId));
    toast.success('Uploaded body photo removed from server!');
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {userPhotos.map((photo) => (
              <div key={photo._id} className="glass-card p-4 rounded-3xl bg-[#16181C] border border-slate-800 space-y-3">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#0B0C0E] relative border border-slate-800">
                  <img src={photo.url} alt={photo.angle} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0B0C0E]/80 text-[#B8FD02] backdrop-blur-md border border-[#B8FD02]/30">
                    {photo.angle}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-[#FEF9F5]">{photo.userName}</p>
                  <p className="text-[11px] text-slate-400">{photo.userEmail}</p>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => handleDeletePhoto(photo._id)}
                    className="w-full py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Image
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

    </main>
  );
}