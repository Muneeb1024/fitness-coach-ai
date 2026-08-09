import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Sparkles, Eye, Flag, Code2, Save } from 'lucide-react';

export default function AIMonitor() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outputs'); // 'outputs' | 'prompts'

  // AI Prompt Template State
  const [systemPrompt, setSystemPrompt] = useState('');
  const [savingPrompt, setSavingPrompt] = useState(false);

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
      setPlans(res.data.recentPlans || [
        {
          _id: 'plan_sample_1',
          title: 'Customized Muscle Gain AI Plan (Gym)',
          dietPlan: { dailyCalories: 2400, macros: { proteinGrams: 165, carbsGrams: 240, fatGrams: 75 } },
          workoutPlan: { splitType: 'Upper / Lower Split', frequencyDaysPerWeek: 4 },
          flagged: false
        }
      ]);
    } catch (err) {
      toast.error('Could not fetch AI plans');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFlag = (planId) => {
    setPlans((prev) =>
      prev.map((p) => (p._id === planId ? { ...p, flagged: !p.flagged } : p))
    );
    toast.success('Plan quality status updated!');
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

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-[#F3F6FB] text-slate-900">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="badge-emerald inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Gemini 1.5 LLM Engine
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">AI Output & Prompt Monitor</h1>
            <p className="text-slate-500 text-sm mt-0.5">Inspect generated plans, flag inaccurate routines & tune AI system prompts</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-3 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('outputs')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'outputs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'glass-card text-slate-500 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" /> Generated Plan Outputs
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'prompts'
                ? 'bg-blue-600 text-white shadow-md'
                : 'glass-card text-slate-500 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" /> AI System Prompt Editor
          </button>
        </div>

        {/* TAB 1: GENERATED PLAN OUTPUTS */}
        {activeTab === 'outputs' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {plans.map((p) => (
                <div key={p._id} className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="badge-purple">{p.workoutPlan?.splitType || 'Full Body Split'}</span>
                    <button
                      onClick={() => handleToggleFlag(p._id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        p.flagged
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      {p.flagged ? 'Flagged Inaccurate' : 'Flag Output'}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{p.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Target Calories: <span className="text-emerald-600 font-bold">{p.dietPlan?.dailyCalories} kcal</span> • Frequency: {p.workoutPlan?.frequencyDaysPerWeek} Days/Wk</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>Protein: {p.dietPlan?.macros?.proteinGrams}g</span>
                    <span>Carbs: {p.dietPlan?.macros?.carbsGrams}g</span>
                    <span>Fats: {p.dietPlan?.macros?.fatGrams}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AI SYSTEM PROMPT EDITOR */}
        {activeTab === 'prompts' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  System Prompt Template Configuration <Code2 className="w-5 h-5 text-violet-600" />
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Dynamically tune instructions injected into Gemini API for plan generation & RAG chat</p>
              </div>

              <button
                onClick={handleSavePrompt}
                disabled={savingPrompt}
                className="btn-primary text-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {savingPrompt ? 'Saving...' : 'Save Prompt Template'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Prompt Text</label>
              <textarea
                rows={12}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}