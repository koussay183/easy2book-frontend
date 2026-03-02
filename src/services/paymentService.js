import { API_ENDPOINTS } from '../config/api';

/**
 * Payment Service
 * Handles all payment gateway interactions
 */

/**
 * Initiate online payment for a booking
 * @param {string|object} bookingIdOrData - Either a booking ID (for existing bookings) or booking data (for new bookings)
 * @returns {Promise<{payUrl: string, paymentRef: string}>}
 */
export const initiatePayment = async (bookingIdOrData) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token if available (for logged-in users)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Determine if this is an existing booking (string) or new booking (object)
    const payload = typeof bookingIdOrData === 'string' 
      ? { bookingId: bookingIdOrData } 
      : { bookingData: bookingIdOrData };

    const response = await fetch(API_ENDPOINTS.PAYMENT_INITIATE, {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === 'success') {
      return {
        payUrl: result.data.payUrl,
        paymentRef: result.data.paymentRef
      };
    } else {
      throw new Error(result.message || 'Failed to initiate payment');
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
};

/**
 * Get payment status by payment reference
 * @param {string} paymentRef - The payment reference
 * @returns {Promise<{paymentStatus: string, booking: object}>}
 */
export const getPaymentStatus = async (paymentRef) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const headers = {};
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_ENDPOINTS.PAYMENT_STATUS}/${paymentRef}/status`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });

    const result = await response.json();

    if (result.status === 'success') {
      return {
        paymentStatus: result.data.paymentStatus,
        booking: result.data.booking
      };
    } else {
      throw new Error(result.message || 'Failed to get payment status');
    }
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

/**
 * Poll payment status until it changes from 'pending'
 * @param {string} paymentRef - The payment reference
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 30)
 * @param {number} interval - Interval between attempts in ms (default: 2000)
 * @returns {Promise<{paymentStatus: string, booking: object}>}
 */
export const pollPaymentStatus = async (paymentRef, maxAttempts = 30, interval = 2000) => {
  let attempts = 0;
  
  const poll = async () => {
    attempts++;
    
    try {
      const result = await getPaymentStatus(paymentRef);
      
      // If payment is no longer pending, return the result
      if (result.paymentStatus !== 'pending') {
        return result;
      }
      
      // If we've reached max attempts, return current status
      if (attempts >= maxAttempts) {
        return result;
      }
      
      // Wait and poll again
      await new Promise(resolve => setTimeout(resolve, interval));
      return poll();
    } catch (error) {
      // If error and still have attempts left, retry
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, interval));
        return poll();
      }
      throw error;
    }
  };
  
  return poll();
};

const paymentService = {
  initiatePayment,
  getPaymentStatus,
  pollPaymentStatus
};

export default paymentService;
