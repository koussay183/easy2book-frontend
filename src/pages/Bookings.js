import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Bookings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // User is logged in, redirect to My Bookings
      navigate('/my-bookings', { replace: true });
    } else {
      // User is guest, redirect to Guest Booking Lookup
      navigate('/guest-booking-lookup', { replace: true });
    }
  }, [navigate]);

  // Show nothing while redirecting
  return null;
};

export default Bookings;
