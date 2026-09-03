import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode (Daylight)' : 'Switch to Dark Mode (Athletic)'}
      className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
        isDark
          ? 'bg-[#16181C] border-slate-800 text-slate-300 hover:text-[#B8FD02] hover:border-[#B8FD02]/40'
          : 'bg-white border-slate-200 text-slate-700 hover:text-amber-500 hover:border-amber-400 shadow-sm'
      } ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-800" />
        )}
      </motion.div>
    </motion.button>
  );
}
