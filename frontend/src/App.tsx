import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NavBarDemo } from './components/ui/tubelight-navbar.demo';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Statistics } from './components/Statistics';
import { PlatformSupport } from './components/PlatformSupport';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  console.log('AppRoutes - loading:', loading, 'user:', user?.email);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/signup" 
        element={!user ? <Signup /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/" 
        element={
          <div className="flex flex-col min-h-screen overflow-hidden bg-background">
            <NavBarDemo />
            <main className="flex-grow">
              <Hero />
              <Features />
              <Statistics />
              <PlatformSupport />
              <Testimonials />
              <Pricing />
              <FAQ />
            </main>
            <Footer />
          </div>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <div className="min-h-screen bg-background">
            <AppRoutes />
          </div>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;