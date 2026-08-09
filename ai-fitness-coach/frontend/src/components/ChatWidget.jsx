import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, X, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

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
            text: `Hi ${user?.name || 'there'}! I'm your AI Fitness & Nutrition Coach. Ask me anything about your diet plan, workout routines, or daily targets!`
          }
        ]);
      }
    } catch (err) {
      console.error('[Fetch Chat Error]', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setFlagAlert('');

    // Optimistic user message render
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await API.post('/chat/message', { message: userText });
      const { reply, flagged } = res.data;

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);

      if (flagged) {
        setFlagAlert('Note: Your message triggered our safety filter. It has been submitted for admin review.');
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I ran into an issue processing your question. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role === 'admin') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25 hover:scale-105 hover:shadow-xl transition-all"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span>Ask AI Coach</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-ping" />
        </button>
      )}

      {isOpen && (
        <div className="w-[380px] h-[520px] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  AI Personal Coach <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </h3>
                <p className="text-xs text-blue-600">Context-Aware RAG Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-br-none shadow-md'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 border border-slate-200 text-slate-400 px-4 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            {flagAlert && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {flagAlert}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about diet, workouts, water target..."
              className="flex-1 bg-white border border-slate-300 text-slate-900 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
