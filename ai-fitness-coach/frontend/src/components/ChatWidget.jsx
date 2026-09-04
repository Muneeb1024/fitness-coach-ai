import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, X, AlertCircle, Sparkles } from 'lucide-react';

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [flagAlert, setFlagAlert] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory();
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/chat/history');
      if (res.data.history && res.data.history.length > 0) {
        setMessages(res.data.history);
      } else {
        setMessages([
          {
            sender: 'ai',
            text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your SoftnoveX AI Fitness Coach. Ask me anything about your nutrition protocol, training split, or daily targets!`
          }
        ]);
      }
    } catch (err) {
      setMessages([
        {
          sender: 'ai',
          text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I couldn't load your previous conversation, so we're starting fresh. Ask me anything!`
        }
      ]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setFlagAlert('');

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await API.post('/chat/message', { message: userText });
      const { reply, flagged } = res.data;

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);

      if (flagged) {
        setFlagAlert('Note: Your query triggered safety moderation and was logged for review.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: serverMsg || 'Encountered an issue processing your query. Please try again in a moment.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role === 'admin') return null;

  return (
    <div className="fixed bottom-[88px] sm:bottom-6 right-3 sm:right-6 z-50 max-w-[calc(100vw-1.5rem)] sm:max-w-none">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative
            /* Mobile: small circle icon-only */
            w-12 h-12 sm:w-auto sm:h-auto
            flex items-center justify-center
            sm:gap-3 sm:px-5 sm:py-3.5
            rounded-full bg-[#B8FD02] text-[#0B0C0E] font-black
            shadow-xl shadow-[#B8FD02]/25 hover:scale-105 hover:shadow-2xl
            transition-all border border-[#B8FD02] uppercase tracking-wider text-xs"
        >
          <Bot className="w-5 h-5 text-[#0B0C0E] shrink-0" />
          <span className="hidden sm:inline">Ask AI Coach</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#CCFF00] animate-ping" />
        </button>
      )}

      {isOpen && (
        <div className="fixed sm:relative inset-0 sm:inset-auto bottom-0 sm:bottom-auto right-0 sm:right-auto w-full sm:w-[380px] h-full sm:h-[520px] bg-[#16181C] border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          {/* Header */}
          <div className="p-4 bg-[#0B0C0E] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#B8FD02]/20 border border-[#B8FD02]/40 flex items-center justify-center text-[#B8FD02]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#FEF9F5] flex items-center gap-1.5 uppercase tracking-wide">
                  SoftnoveX AI Coach <Sparkles className="w-3.5 h-3.5 text-[#B8FD02]" />
                </h3>
                <p className="text-[11px] text-[#B8FD02] font-black">Context-Aware RAG Active</p>
              </div>
            </div>

            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl leading-relaxed text-xs sm:text-sm font-medium ${
                    m.sender === 'user'
                      ? 'bg-[#B8FD02] text-[#0B0C0E] font-bold rounded-br-none shadow-md'
                      : 'bg-[#0B0C0E] border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#0B0C0E] border border-slate-800 text-slate-400 px-4 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B8FD02] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#B8FD02] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#B8FD02] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            {flagAlert && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {flagAlert}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-[#0B0C0E] border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about diet, workout split, macros..."
              className="flex-1 bg-[#16181C] border border-slate-800 text-[#FEF9F5] px-3.5 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#B8FD02] transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#B8FD02] text-[#0B0C0E] font-black hover:bg-[#CCFF00] disabled:opacity-50 transition-all shadow-md shadow-[#B8FD02]/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
