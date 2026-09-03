import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

const formatLocalYYYYMMDD = (dateObj) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DateNavigator({ selectedDate, onDateChange, history = [] }) {
  const todayStr = useMemo(() => formatLocalYYYYMMDD(new Date()), []);

  // Generate 7-day strip centered on selected or up to today
  const dateStrip = useMemo(() => {
    const dates = [];
    const base = new Date();
    // Show last 6 days up to today, plus selectedDate if older
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(base.getDate() - i);
      dates.push(formatLocalYYYYMMDD(d));
    }

    if (!dates.includes(selectedDate)) {
      dates.unshift(selectedDate);
    }
    return dates;
  }, [selectedDate]);

  // History lookup map for activity dots
  const historyMap = useMemo(() => {
    const map = {};
    history.forEach((h) => {
      if (h.date) {
        map[h.date] = {
          workout: !!h.workoutCompleted,
          water: (h.waterMl || 0) >= 2000,
          logged: (h.waterMl > 0) || (h.mealsLogged?.some(m => m.consumed)) || !!h.workoutCompleted
        };
      }
    });
    return map;
  }, [history]);

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    onDateChange(formatLocalYYYYMMDD(prev));
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    const nextStr = formatLocalYYYYMMDD(next);
    if (nextStr <= todayStr) {
      onDateChange(nextStr);
    }
  };

  const isToday = selectedDate === todayStr;
  const isYesterday = (() => {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    return selectedDate === formatLocalYYYYMMDD(yest);
  })();

  const formattedDisplayDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDate]);

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-3xl bg-[#16181C] border border-slate-800 space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Date Title & State Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0B0C0E] border border-slate-800 flex items-center justify-center text-[#B8FD02]">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#FEF9F5] tracking-tight">
                {formattedDisplayDate}
              </h2>
              {isToday ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#B8FD02]/15 text-[#B8FD02] border border-[#B8FD02]/40">
                  Live Today
                </span>
              ) : isYesterday ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/40">
                  Yesterday
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  Past Record
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {isToday
                ? "Logging daily habits & real-time energy balance"
                : "Viewing historical biometric log & nutritional intake"}
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!isToday && (
            <button
              onClick={() => onDateChange(todayStr)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0B0C0E] border border-[#B8FD02]/30 text-[#B8FD02] text-xs font-black uppercase tracking-wider hover:bg-[#B8FD02] hover:text-[#0B0C0E] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Jump to Today
            </button>
          )}

          {/* Native Date Picker Helper */}
          <div className="relative">
            <input
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="Pick any date from calendar"
            />
            <button className="p-2 rounded-xl bg-[#0B0C0E] border border-slate-800 text-slate-400 hover:text-[#FEF9F5] hover:border-slate-700 transition-colors">
              <CalendarIcon className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* Prev / Next Arrows */}
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-[#0B0C0E] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextDay}
            disabled={isToday}
            className="p-2 rounded-xl bg-[#0B0C0E] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Interactive Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        {dateStrip.map((dateItem) => {
          const [y, m, d] = dateItem.split('-').map(Number);
          const dateObj = new Date(y, m - 1, d);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.getDate();
          const isItemActive = dateItem === selectedDate;
          const isItemToday = dateItem === todayStr;
          const itemActivity = historyMap[dateItem];

          return (
            <button
              key={dateItem}
              onClick={() => onDateChange(dateItem)}
              className={`flex-1 min-w-[58px] py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1 transition-all border ${
                isItemActive
                  ? 'bg-[#B8FD02] text-[#0B0C0E] border-[#B8FD02] shadow-lg shadow-[#B8FD02]/20 scale-105 font-black'
                  : 'bg-[#0B0C0E] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wider ${isItemActive ? 'text-[#0B0C0E]' : 'text-slate-500 font-bold'}`}>
                {isItemToday ? 'Today' : dayName}
              </span>
              <span className="text-base font-black leading-none">
                {dayNum}
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {itemActivity?.workout ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isItemActive ? 'bg-[#0B0C0E]' : 'bg-[#B8FD02]'}`} title="Workout Logged" />
                ) : itemActivity?.logged ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isItemActive ? 'bg-[#0B0C0E]' : 'bg-blue-400'}`} title="Activity Logged" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
