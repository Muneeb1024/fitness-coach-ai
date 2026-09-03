import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import AppLayout from './components/AppLayout';
import ChatWidget from './components/ChatWidget';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import Progress from './pages/Progress';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';
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
      <div className="min-h-[70vh] flex items-center justify-center gap-3 text-[#B8FD02] font-semibold">
        <span className="w-5 h-5 rounded-full border-2 border-[#B8FD02] border-t-transparent animate-spin" />
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
  const { user } = useAuth();

  const isPublicRoute = ['/', '/login', '/signup', '/admin/login', '/forgot-password'].includes(location.pathname) || (location.pathname === '/pricing' && !user);

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#FEF9F5] flex flex-col transition-colors duration-200">
      {/* Top Navbar for Public Marketing Routes */}
      {isPublicRoute && <Navbar />}

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Marketing Routes */}
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
            <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
            <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />

            {/* Authenticated User App Routes (With Modern Left Sidebar Layout) */}
            <Route path="/onboarding" element={
              <ProtectedRoute><AppLayout><PageWrapper><Onboarding /></PageWrapper></AppLayout></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><AppLayout><PageWrapper><Dashboard /></PageWrapper></AppLayout></ProtectedRoute>
            } />
            <Route path="/plans" element={
              <ProtectedRoute><AppLayout><PageWrapper><Plans /></PageWrapper></AppLayout></ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute><AppLayout><PageWrapper><Progress /></PageWrapper></AppLayout></ProtectedRoute>
            } />
            <Route path="/pricing" element={
              user ? (
                <ProtectedRoute><AppLayout><PageWrapper><Subscription /></PageWrapper></AppLayout></ProtectedRoute>
              ) : (
                <PageWrapper><Subscription /></PageWrapper>
              )
            } />
            <Route path="/profile" element={
              <ProtectedRoute><AppLayout><PageWrapper><Profile /></PageWrapper></AppLayout></ProtectedRoute>
            } />

            {/* Admin Portal Routes — shared AppLayout keeps Sidebar persistent */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AppLayout><PageWrapper><AdminDashboard /></PageWrapper></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly><AppLayout><PageWrapper><UserManagement /></PageWrapper></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/ai-monitor" element={
              <ProtectedRoute adminOnly><AppLayout><PageWrapper><AIMonitor /></PageWrapper></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/plan-override" element={
              <ProtectedRoute adminOnly><AppLayout><PageWrapper><PlanOverride /></PageWrapper></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/moderation" element={
              <ProtectedRoute adminOnly><AppLayout><PageWrapper><Moderation /></PageWrapper></AppLayout></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Floating Chat Widget on Public Routes */}
      {isPublicRoute && <ChatWidget />}
    </div>
  );
}
