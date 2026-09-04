import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../services/api';
import {
  Sparkles, Eye, Code2, Save, RotateCcw,
  Zap, ShieldCheck, Terminal, Cpu, Sliders
} from 'lucide-react';

export default function AIMonitor() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outputs'); // 'outputs' | 'prompts' | 'playground'

  // AI Prompt Template State
  const [systemPrompt, setSystemPrompt] = useState('');
  const [savingPrompt, setSavingPrompt] = useState(false);

  // Playground State
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchPromptTemplate();
  }, []);

  const fetchPromptTemplate = async () => {
    try {
      const res = await API.get('/admin/prompt-template');
      if (res.data?.prompt) setSystemPrompt(res.data.prompt);
    } catch (err) {
      toast.error('Could not load AI prompt template');
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await API.get('/admin/analytics');
      setPlans(res.data.recentPlans || []);
    } catch (err) {
      toast.error('Could not fetch AI plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async () => {
    setSavingPrompt(true);
    const toastId = toast.loading('Saving system prompt template...');
    try {
      const res = await API.put('/admin/prompt-template', { prompt: systemPrompt });
      toast.success(res.data.message || 'System Prompt Template updated successfully! 🚀', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update prompt template', { id: toastId });
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleTestPrompt = async () => {
    if (!testQuery) return toast.error('Please enter a test question');
    setTesting(true);
    setTestResponse('');
    try {
      const res = await API.post('/chat/message', { message: testQuery });
      setTestResponse(res.data.reply || 'No response returned.');
      toast.success('AI response received successfully!');
    } catch (err) {
      toast.error('Test simulation failed.');
    } finally {
      setTesting(false);
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
              <span className="px-3 py-1 rounded-full bg-[#B8FD02]/15 border border-[#B8FD02]/40 text-[#B8FD02] text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Gemini 2.5 Flash Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FEF9F5] tracking-tight uppercase">
              AI Output & Prompt Monitor
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Inspect generated routines, flag inaccurate models & tune live system prompts
            </p>
          </div>
        </motion.div>

        {/* Tab Controls */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          {[
            { id: 'outputs', label: 'Generated Plan Outputs', icon: Eye },
            { id: 'prompts', label: 'AI System Prompt Editor', icon: Code2 },
            { id: 'playground', label: 'Prompt Test Sandbox', icon: Terminal }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02] shadow-md shadow-[#B8FD02]/20'
                  : 'bg-[#16181C] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: GENERATED PLAN OUTPUTS */}
        {activeTab === 'outputs' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Latest generated plans (read-only). Output quality flagging & persistence are not wired yet —
              moderation of AI responses happens in the Safety & Moderation console.
            </p>
            {plans.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-3xl bg-[#16181C] border border-slate-800 space-y-2">
                <Sparkles className="w-10 h-10 text-[#B8FD02] mx-auto" />
                <h3 className="font-black text-[#FEF9F5] text-base uppercase">No AI Plans Generated Yet</h3>
                <p className="text-xs text-slate-400">Generated plan outputs will appear here once members onboard.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {plans.map((p) => (
                <div key={p._id} className="glass-card p-6 rounded-3xl bg-[#16181C] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#B8FD02]/15 text-[#B8FD02] border border-[#B8FD02]/30">
                      {p.workoutPlan?.splitType || 'Full Body Split'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">v{p.version || 1}</span>
                  </div>

                  <div>
                    <h4 className="font-black text-[#FEF9F5] text-base">{p.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Target Calories: <span className="text-[#B8FD02] font-black">{p.dietPlan?.dailyCalories} kcal</span> • Frequency: {p.workoutPlan?.frequencyDaysPerWeek || 4} Days/Wk
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Protein: <strong className="text-[#FEF9F5]">{p.dietPlan?.macros?.proteinGrams}g</strong></span>
                    <span>Carbs: <strong className="text-[#FEF9F5]">{p.dietPlan?.macros?.carbsGrams}g</strong></span>
                    <span>Fats: <strong className="text-[#FEF9F5]">{p.dietPlan?.macros?.fatGrams}g</strong></span>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* TAB 2: AI SYSTEM PROMPT EDITOR */}
        {activeTab === 'prompts' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-lg text-[#FEF9F5] uppercase tracking-tight flex items-center gap-2">
                  System Prompt Template Configuration <Code2 className="w-5 h-5 text-[#B8FD02]" />
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dynamically tune the system prompt injected into the Gemini API for plan generation & RAG coaching
                </p>
              </div>

              <button
                onClick={handleSavePrompt}
                disabled={savingPrompt}
                className="btn-primary text-xs px-5 py-2.5 uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#B8FD02]/20"
              >
                <Save className="w-4 h-4" />
                {savingPrompt ? 'Saving...' : 'Save Prompt Template'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                System Prompt (Injected at runtime)
              </label>
              <textarea
                rows={14}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-[#0B0C0E] border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-300 focus:outline-none focus:border-[#B8FD02] leading-relaxed"
                placeholder="Enter AI system prompt..."
              />
            </div>
          </div>
        )}

        {/* TAB 3: TEST SANDBOX */}
        {activeTab === 'playground' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-[#16181C] border border-slate-800 space-y-6">
            <div>
              <h3 className="font-black text-lg text-[#FEF9F5] uppercase tracking-tight flex items-center gap-2">
                Live AI Prompt Sandbox <Terminal className="w-5 h-5 text-[#B8FD02]" />
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Test queries against the live chat endpoint (uses the signed-in account's context; replies are logged like a normal chat)
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Test Prompt Query
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="e.g. Can I substitute chicken breast with paneer for my 2400 kcal plan?"
                    className="input-field text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && handleTestPrompt()}
                  />
                  <button
                    onClick={handleTestPrompt}
                    disabled={testing}
                    className="btn-primary text-xs px-6 whitespace-nowrap uppercase tracking-wider"
                  >
                    {testing ? 'Running...' : 'Test Query'}
                  </button>
                </div>
              </div>

              {testResponse && (
                <div className="p-4 rounded-2xl bg-[#0B0C0E] border border-[#B8FD02]/30 space-y-2">
                  <span className="text-[10px] font-black text-[#B8FD02] uppercase tracking-wider">
                    Model Response
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {testResponse}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

    </main>
  );
}