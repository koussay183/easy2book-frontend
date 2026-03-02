import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HotelsProvider } from './context/HotelsContext';
import Layout from './components/Layout';
import Loader from './components/Loader';
import ProtectedRoute from './components/ProtectedRoute';
import useVisitorSocket from './hooks/useVisitorSocket';

// Pages
import Landing from './pages/Landing';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import BookingPage from './pages/BookingPage';
import HotelBooking from './pages/HotelBooking';
import Omra from './pages/Omra';
import OmraBooking from './pages/OmraBooking';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import GuestBookingLookup from './pages/GuestBookingLookup';
import BookingConfirmation from './pages/BookingConfirmation';
import PaymentCallback from './pages/PaymentCallback';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import BookingDetail from './pages/admin/BookingDetail';

/** Tracks visitor presence on public (non-admin) pages via Socket.IO */
const VisitorTrackerInner = () => { useVisitorSocket(); return null; };
const VisitorTracker = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <VisitorTrackerInner />;
};

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
          <VisitorTracker />
          <Layout>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/guest-booking-lookup" element={<GuestBookingLookup />} />
            
            {/* Front Office Routes */}
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotel/:id" element={<HotelDetails />} />
            <Route path="/hotel/booking" element={<HotelBooking />} />
            <Route path="/hotel/:id/book" element={<BookingPage />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/omra" element={<Omra />} />
            <Route path="/omra/:id/book" element={<OmraBooking />} />
            
            {/* Back Office Routes - Admin */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/bookings/:id" element={<BookingDetail />} />
          </Routes>
        </Layout>
      </Router>
      </HotelsProvider>
    </AuthProvider>
  );
}

export default App;