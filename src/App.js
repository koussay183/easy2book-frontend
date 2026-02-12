import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HotelsProvider } from './context/HotelsContext';
import Layout from './components/Layout';
import Loader from './components/Loader';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import BookingPage from './pages/BookingPage';
import Omra from './pages/Omra';
import OmraBooking from './pages/OmraBooking';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';

function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only show loader when first entering the landing page
    const hasVisitedLanding = sessionStorage.getItem('hasVisitedLanding');
    
    if (!hasVisitedLanding && window.location.pathname === '/') {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('hasVisitedLanding', 'true');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthProvider>
      <HotelsProvider>
        <Router>
          <Layout>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Front Office Routes */}
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotel/:id" element={<HotelDetails />} />
            <Route path="/hotel/:id/book" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/omra" element={<Omra />} />
            <Route path="/omra/:id/book" element={
              <ProtectedRoute>
                <OmraBooking />
              </ProtectedRoute>
            } />
            
            {/* Back Office Routes - Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </Router>
      </HotelsProvider>
    </AuthProvider>
  );
}

export default App;