import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Camera, Upload, Zap, Flame, Beef, Wheat, Droplets,
  Trash2, Plus, RefreshCw, X, ChevronRight, Leaf,
  Target, TrendingUp, Clock, CheckCircle2, AlertCircle,
  Sparkles, BarChart3, Coffee, Sun, Moon, Apple
} from 'lucide-react';

// ── Nutrition Ring ─────────────────────────────────────────────────────────────
function NutritionRing({ value, max, color, size = 80, strokeWidth = 8, label, unit = 'kcal' }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2530" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
            strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-black text-[#FEF9F5]">{Math.round(value)}</span>
          <span className="text-[9px] text-slate-500">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
  );
}

// ── Macro Bar ──────────────────────────────────────────────────────────────────
function MacroBar({ label, value, max, color, icon: Icon }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="font-semibold text-slate-300">{label}</span>
        </div>
        <span className="font-bold text-[#FEF9F5]">{Math.round(value)}g <span className="text-slate-500 font-normal">/ {max}g</span></span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
    </div>
  );
}

// ── Meal Type Icon ─────────────────────────────────────────────────────────────
const mealIcons = { breakfast: Coffee, lunch: Sun, dinner: Moon, snack: Apple };
const mealColors = { breakfast: '#f59e0b', lunch: '#3b82f6', dinner: '#8b5cf6', snack: '#10b981' };
const healthColors = [, '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6','#06b6d4','#3b82f6','#6366f1'];

// ══════════════════════════════════════════════════════════════════════════════
export default function Calories() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [mode, setMode] = useState('upload'); // 'upload' | 'camera'
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const [foodLog, setFoodLog] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [loadingLog, setLoadingLog] = useState(true);

  const calorieGoal = user?.goals?.dailyCalorieTarget || 2000;
  const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
  const carbGoal = Math.round((calorieGoal * 0.45) / 4);
  const fatGoal = Math.round((calorieGoal * 0.25) / 9);

  // Load today's log
  useEffect(() => {
    fetchLog();
    return () => stopCamera();
  }, []);

  const fetchLog = async () => {
    setLoadingLog(true);
    try {
      const res = await API.get('/food/today');
      setFoodLog(res.data.entries || []);
      setTotals(res.data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    } catch { toast.error('Could not load food log'); }
    finally { setLoadingLog(false); }
  };

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      toast.error('Camera access denied. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.split(',')[1];
    setPreview(dataUrl);
    setImageBase64(base64);
    setMimeType('image/jpeg');
    setResult(null);
    stopCamera();
    setCameraActive(false);
  };

  // ── File Upload ───────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
      setMimeType(file.type);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileChange(fakeEvent);
    }
  };

  // ── Analyze ───────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!imageBase64) return toast.error('Please capture or upload a food photo first');
    setAnalyzing(true);
    const toastId = toast.loading('🔬 Gemini AI is analyzing your food...');
    try {
      const res = await API.post('/food/analyze', { imageBase64, mimeType });
      setResult(res.data.nutrition);
      toast.success('Analysis complete!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed', { id: toastId });
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Log Food ──────────────────────────────────────────────────────────────
  const handleLogFood = async () => {
    if (!result) return;
    const toastId = toast.loading('Logging meal...');
    try {
      await API.post('/food/log', {
        foodName: result.foodName,
        nutrition: result.nutrition,
        servingSize: result.servingSize,
        mealType: result.mealType,
        imageThumb: preview,
      });
      toast.success(`${result.foodName} logged! 🥗`, { id: toastId });
      setPreview(null);
      setImageBase64(null);
      setResult(null);
      fetchLog();
    } catch (err) {
      toast.error('Failed to log food', { id: toastId });
    }
  };

  // ── Delete Entry ──────────────────────────────────────────────────────────
  const handleDelete = async (entryId) => {
    try {
      await API.delete(`/food/log/${entryId}`);
      setFoodLog(prev => prev.filter(e => e.id !== entryId));
      toast.success('Entry removed');
      fetchLog();
    } catch { toast.error('Could not remove entry'); }
  };

  const reset = () => { setPreview(null); setImageBase64(null); setResult(null); stopCamera(); };

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-6xl mx-auto overflow-x-hidden text-[#FEF9F5]">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#16181C] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Flame className="w-4 h-4 text-[#B8FD02] shrink-0" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#B8FD02] truncate">AI Calorie Scanner</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FEF9F5] leading-tight">Food & Nutrition</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 hidden sm:block">Point camera at food → Gemini AI gives instant calories & macros</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-black text-[#B8FD02]">{Math.round(totals.calories)}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">of {calorieGoal} kcal</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#B8FD02]/10 border border-[#B8FD02]/20 flex items-center justify-center">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#B8FD02]" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Scanner Panel (left, 3 cols) ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-4">

          {/* Mode Toggle */}
          <div className="flex bg-[#16181C] border border-slate-800 rounded-2xl p-1">
            {[['upload', Upload, 'Upload Photo'], ['camera', Camera, 'Live Camera']].map(([m, Icon, label]) => (
              <button key={m} onClick={() => { setMode(m); reset(); if (m === 'camera') startCamera(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m ? 'bg-[#B8FD02] text-[#0B0C0E] shadow-lg shadow-[#B8FD02]/20' : 'text-slate-400 hover:text-white'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Scanner Area */}
          <div className="bg-[#16181C] border border-slate-800 rounded-3xl overflow-hidden">

            {/* Camera View - shorter on mobile */}
            {mode === 'camera' && (
              <div className="relative aspect-[4/3] sm:aspect-video bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                {cameraActive && (
                  <>
                    {/* Viewfinder overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-[#B8FD02] rounded-2xl opacity-70">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#B8FD02] rounded-tl-2xl" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#B8FD02] rounded-tr-2xl" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#B8FD02] rounded-bl-2xl" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#B8FD02] rounded-br-2xl" />
                      </div>
                    </div>
                    <p className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-[#B8FD02] text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      Point at food & capture
                    </p>
                    <button onClick={capturePhoto}
                      className="absolute bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#B8FD02] rounded-full flex items-center justify-center shadow-2xl shadow-[#B8FD02]/40 hover:scale-105 transition-transform border-4 border-[#0B0C0E]">
                      <Camera className="w-7 h-7 text-[#0B0C0E]" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Upload Drop Zone - compact on mobile */}
            {mode === 'upload' && !preview && (
              <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                className="aspect-[4/3] sm:aspect-video flex flex-col items-center justify-center gap-3 sm:gap-5 border-2 border-dashed border-slate-700 rounded-3xl m-3 cursor-pointer hover:border-[#B8FD02]/50 hover:bg-[#B8FD02]/5 transition-all"
                onClick={() => fileInputRef.current?.click()}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#B8FD02]/10 flex items-center justify-center border border-[#B8FD02]/20">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-[#B8FD02]" />
                </div>
                <div className="text-center px-4">
                  <p className="font-bold text-[#FEF9F5] text-sm sm:text-base">Drop food photo here</p>
                  <p className="text-slate-500 text-xs sm:text-sm">or tap to browse · JPG, PNG, WEBP</p>
                </div>
                <p className="text-xs text-slate-600 hidden sm:block">Works with any food photo — Gemini AI does the rest</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="relative">
                <img src={preview} alt="Food preview" className="w-full aspect-video object-cover" />
                <button onClick={reset} className="absolute top-3 right-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition-colors backdrop-blur-sm">
                  <X className="w-4 h-4 text-white" />
                </button>
                {!result && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-5 flex justify-center">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleAnalyze} disabled={analyzing}
                      className="flex items-center gap-2 px-8 py-3 bg-[#B8FD02] text-[#0B0C0E] font-black uppercase tracking-wide rounded-xl shadow-2xl shadow-[#B8FD02]/30 disabled:opacity-60">
                      {analyzing
                        ? <><div className="w-4 h-4 border-2 border-[#0B0C0E] border-t-transparent rounded-full animate-spin" /> Analyzing with Gemini AI...</>
                        : <><Sparkles className="w-4 h-4" /> Analyze with AI</>
                      }
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            {/* AI Result */}
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 space-y-5">

                  {/* Food name + health score */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-[#FEF9F5]">{result.foodName}</h3>
                      <p className="text-slate-400 text-sm">{result.servingSize}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize border`}
                          style={{ color: mealColors[result.mealType] || '#94a3b8', borderColor: (mealColors[result.mealType] || '#94a3b8') + '40', backgroundColor: (mealColors[result.mealType] || '#94a3b8') + '15' }}>
                          {result.mealType || 'meal'}
                        </span>
                        <span className="text-xs text-slate-500">{result.healthLabel}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                        style={{ backgroundColor: (healthColors[result.healthScore] || '#94a3b8') + '20', color: healthColors[result.healthScore] || '#94a3b8' }}>
                        {result.healthScore}
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5">/ 10</p>
                    </div>
                  </div>

                  {/* Calorie highlight */}
                  <div className="bg-[#0B0C0E] rounded-2xl p-4 flex items-center justify-between border border-slate-800">
                    <div>
                      <p className="text-4xl font-black text-[#B8FD02]">{result.nutrition?.calories}</p>
                      <p className="text-slate-400 text-sm">Calories</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[['Protein', result.nutrition?.protein, '#3b82f6'], ['Carbs', result.nutrition?.carbs, '#f59e0b'], ['Fat', result.nutrition?.fat, '#ef4444']].map(([l, v, c]) => (
                        <div key={l} className="text-center">
                          <p className="font-black text-sm" style={{ color: c }}>{v}g</p>
                          <p className="text-[10px] text-slate-500">{l}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extra macros */}
                  <div className="grid grid-cols-3 gap-2">
                    {[['Fiber', result.nutrition?.fiber + 'g', '#10b981'], ['Sugar', result.nutrition?.sugar + 'g', '#f59e0b'], ['Sodium', result.nutrition?.sodium + 'mg', '#8b5cf6']].map(([l, v, c]) => (
                      <div key={l} className="bg-[#0B0C0E] border border-slate-800 rounded-xl p-3 text-center">
                        <p className="font-black text-sm" style={{ color: c }}>{v}</p>
                        <p className="text-[10px] text-slate-500">{l}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Tip */}
                  {result.tip && (
                    <div className="flex gap-2 bg-[#B8FD02]/5 border border-[#B8FD02]/20 rounded-xl p-3">
                      <Leaf className="w-4 h-4 text-[#B8FD02] shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">{result.tip}</p>
                    </div>
                  )}

                  {/* Log + Rescan buttons */}
                  <div className="flex gap-2">
                    <button onClick={reset} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-bold hover:border-slate-600 transition-all flex items-center justify-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" /> Scan Again
                    </button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleLogFood}
                      className="flex-1 py-2.5 rounded-xl bg-[#B8FD02] text-[#0B0C0E] text-sm font-black flex items-center justify-center gap-1.5 shadow-lg shadow-[#B8FD02]/20">
                      <Plus className="w-4 h-4" /> Log This Meal
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Right Panel (2 cols) ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 space-y-4">

          {/* Daily Summary */}
          <div className="bg-[#16181C] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wide text-[#FEF9F5]">Today's Summary</h3>
              <button onClick={fetchLog} className="text-slate-500 hover:text-[#B8FD02] transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Big calorie ring */}
            <div className="flex justify-center">
              <div className="relative">
                {(() => {
                  const size = 120; const sw = 12; const r = (size - sw) / 2;
                  const circ = 2 * Math.PI * r; const pct = Math.min(totals.calories / calorieGoal, 1);
                  const remaining = Math.max(calorieGoal - totals.calories, 0);
                  return (
                    <div className="flex flex-col items-center">
                      <div className="relative" style={{ width: size, height: size }}>
                        <svg width={size} height={size} className="-rotate-90">
                          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2530" strokeWidth={sw} />
                          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#B8FD02"
                            strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
                            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-black text-[#B8FD02]">{Math.round(totals.calories)}</span>
                          <span className="text-[10px] text-slate-500">kcal eaten</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{remaining > 0 ? `${remaining} kcal remaining` : '🔥 Goal reached!'}</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Macro bars */}
            <div className="space-y-3">
              <MacroBar label="Protein" value={totals.protein} max={proteinGoal} color="#3b82f6" icon={Beef} />
              <MacroBar label="Carbs" value={totals.carbs} max={carbGoal} color="#f59e0b" icon={Wheat} />
              <MacroBar label="Fat" value={totals.fat} max={fatGoal} color="#ef4444" icon={Droplets} />
            </div>
          </div>

          {/* Food Log */}
          <div className="bg-[#16181C] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wide text-[#FEF9F5]">
                Today's Log <span className="text-slate-500 font-normal ml-1">({foodLog.length})</span>
              </h3>
              <BarChart3 className="w-4 h-4 text-slate-600" />
            </div>

            {loadingLog ? (
              <div className="flex items-center justify-center py-10 gap-2">
                <div className="w-4 h-4 border-2 border-[#B8FD02] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500">Loading log...</span>
              </div>
            ) : foodLog.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Apple className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                <p className="text-slate-500 text-sm font-medium">No meals logged yet</p>
                <p className="text-slate-600 text-xs mt-1">Scan your first meal to get started</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {foodLog.map((entry) => {
                  const MealIcon = mealIcons[entry.mealType] || Apple;
                  const mealColor = mealColors[entry.mealType] || '#94a3b8';
                  return (
                    <motion.div key={entry.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 px-5 py-3 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: mealColor + '15', border: `1px solid ${mealColor}30` }}>
                        <MealIcon className="w-4 h-4" style={{ color: mealColor }} />
                      </div>
                      {entry.imageThumb && (
                        <img src={entry.imageThumb} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#FEF9F5] truncate">{entry.foodName}</p>
                        <p className="text-xs text-slate-500">{entry.servingSize} · {new Date(entry.loggedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-[#B8FD02]">{entry.nutrition?.calories}</p>
                        <p className="text-[10px] text-slate-600">kcal</p>
                      </div>
                      <button onClick={() => handleDelete(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-600 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
