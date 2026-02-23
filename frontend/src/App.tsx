// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './api/axiosClient';
import { Toaster } from 'sonner';

// Import our Providers and Pages
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import SignDocument from './pages/SignDocument';
import SharedDocument from './pages/SharedDocument';
import AboutPage from './pages/AboutPage'; 

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/login" 
            element={!session ? <AuthPage /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* New Static Public Route */}
          <Route 
            path="/about" 
            element={<AboutPage />} 
          />

          {/* Public Shared Document Route */}
          <Route 
            path="/share/:token" 
            element={<SharedDocument />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={session ? <Dashboard /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/sign/:documentId" 
            element={session ? <SignDocument /> : <Navigate to="/" replace />} 
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;