import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { ShieldAlert, CheckCircle, Flag, Trash2, Camera, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

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
    <div className="flex min-h-[calc(100vh-73px)] bg-[#F3F6FB] text-slate-900">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="badge-purple inline-flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Safety & Content Moderation Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Safety & Moderation Center</h1>
            <p className="text-slate-500 text-sm mt-0.5">Review flagged AI chat queries, moderate uploaded body images & manage safety policies</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-3 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'chats'
                ? 'bg-blue-600 text-white shadow-md'
                : 'glass-card text-slate-500 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Flagged Chat Queries ({flaggedLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'photos'
                ? 'bg-blue-600 text-white shadow-md'
                : 'glass-card text-slate-500 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" /> Body Image Moderation ({userPhotos.length})
          </button>
        </div>

        {/* TAB 1: FLAGGED CHAT QUERIES */}
        {activeTab === 'chats' && (
          <div className="space-y-4">
            {flaggedLogs.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-base">No Flagged Chat Queries Pending</h3>
                <p className="text-xs text-slate-500">All user RAG chat queries pass AI safety guidelines.</p>
              </div>
            ) : (
              flaggedLogs.map((log) => (
                <div key={log._id} className="glass-card p-6 rounded-3xl border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{log.userId?.name || 'User'}</span>
                      <span className="text-xs text-slate-500 ml-2">({log.userId?.email || 'email'})</span>
                    </div>
                    <button
                      onClick={() => handleResolveChatFlag(log._id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve Flag
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    <p className="font-bold">Flag Reason:</p>
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
              <div key={photo._id} className="glass-card p-5 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{photo.userName}</span>
                  <span className="badge-purple">{photo.angle}</span>
                </div>

                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 relative group">
                  <img src={photo.url} alt={photo.angle} className="w-full h-full object-cover" />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-slate-500">{photo.status}</span>
                  <button
                    onClick={() => handleDeletePhoto(photo._id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Photo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}