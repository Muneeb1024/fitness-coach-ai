import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import Progress from './pages/Progress';
import Subscription from './pages/Subscription';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AIMonitor from './pages/admin/AIMonitor';
import PlanOverride from './pages/admin/PlanOverride';
import Moderation from './pages/admin/Moderation';
import { useAuth } from './context/AuthContext';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

function PageWrapper({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center gap-3 text-emerald-400 font-semibold">
        <span className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        Verifying Session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F3F6FB] text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
            <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />

            <Route path="/onboarding" element={
              <ProtectedRoute><PageWrapper><Onboarding /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/plans" element={
              <ProtectedRoute><PageWrapper><Plans /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute><PageWrapper><Progress /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/pricing" element={<PageWrapper><Subscription /></PageWrapper>} />

            <Route path="/admin" element={
              <ProtectedRoute adminOnly><PageWrapper><AdminDashboard /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly><PageWrapper><UserManagement /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/admin/ai-monitor" element={
              <ProtectedRoute adminOnly><PageWrapper><AIMonitor /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/admin/plan-override" element={
              <ProtectedRoute adminOnly><PageWrapper><PlanOverride /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/admin/moderation" element={
              <ProtectedRoute adminOnly><PageWrapper><Moderation /></PageWrapper></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
      <ChatWidget />
    </div>
  );
}
