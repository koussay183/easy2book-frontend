// API Configuration
// Change this to switch between development and production environments

const ENV = process.env.REACT_APP_ENV || 'development'; // 'development' or 'production'

const API_URLS = {
  development: 'http://localhost:5000',
  production: 'https://easy2book-backend.vercel.app'
};

// Get the base URL based on environment
export const API_BASE_URL = API_URLS[ENV];

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: `${API_BASE_URL}/api/auth`,
  AUTH_ME: `${API_BASE_URL}/api/auth/me`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  AUTH_REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh-token`,
  AUTH_UPDATE_PROFILE: `${API_BASE_URL}/api/auth/update-profile`,
  AUTH_UPDATE_PASSWORD: `${API_BASE_URL}/api/auth/update-password`,
  AUTH_FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  AUTH_RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  AUTH_VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
  AUTH_DELETE_ACCOUNT: `${API_BASE_URL}/api/auth/delete-account`,
  AUTH_ADMIN_LOGIN: `${API_BASE_URL}/api/auth/admin/login`,
  
  // MyGo Hotels endpoints
  MYGO_HOTELS: `${API_BASE_URL}/api/mygo/hotels`,
  MYGO_HOTELS_SEARCH: `${API_BASE_URL}/api/mygo/hotels/search`,
  MYGO_HOTELS_DETAILS: `${API_BASE_URL}/api/mygo/hotels/details`,
  MYGO_HOTELS_NEARBY: `${API_BASE_URL}/api/mygo/hotels/nearby`,
  MYGO_HOTELS_MOST_BOOKED: `${API_BASE_URL}/api/mygo/hotels/most-booked`,
  MYGO_HOTELS_FEATURED: `${API_BASE_URL}/api/mygo/hotels/featured`,
  MYGO_HOTELS_BEST_RATED: `${API_BASE_URL}/api/mygo/hotels/best-rated`,
  MYGO_HOTELS_BUDGET: `${API_BASE_URL}/api/mygo/hotels/budget`,
  
  // Bookings endpoints - PUBLIC (No Auth)
  BOOKINGS: `${API_BASE_URL}/api/bookings`, // POST - Create booking
  BOOKINGS_GUEST_LOOKUP: `${API_BASE_URL}/api/bookings/guest/lookup`, // POST - Look up guest booking by email + code
  BOOKINGS_DETAILS: `${API_BASE_URL}/api/bookings/details`, // GET - Get booking by ID or confirmation code
  
  // Bookings endpoints - USER PROTECTED (Auth Required)
  BOOKINGS_USER: `${API_BASE_URL}/api/bookings`, // GET - Get user's own bookings
  BOOKINGS_USER_CANCEL: `${API_BASE_URL}/api/bookings`, // PATCH /:id/cancel - Cancel a booking
  
  // Bookings endpoints - ADMIN ONLY (Admin Auth Required)
  BOOKINGS_ADMIN_ALL: `${API_BASE_URL}/api/bookings/admin/all`, // GET - Get all bookings with filters
  BOOKINGS_ADMIN_STATS: `${API_BASE_URL}/api/bookings/admin/stats`, // GET - Get booking statistics & analytics
  BOOKINGS_ADMIN_EXPORT_CSV: `${API_BASE_URL}/api/bookings/admin/export/csv`, // GET - Export all bookings as CSV
  BOOKINGS_ADMIN_CONFIRM: `${API_BASE_URL}/api/bookings`, // PATCH /:id/confirm - Confirm booking & send to myGo
  BOOKINGS_ADMIN_PAYMENT: `${API_BASE_URL}/api/bookings`, // PATCH /:id/payment - Update payment status
  BOOKINGS_ADMIN_STATUS: `${API_BASE_URL}/api/bookings`, // PATCH /:id/status - Update booking status
  BOOKINGS_ADMIN_UPDATE: `${API_BASE_URL}/api/bookings`, // PATCH /:id - Update booking details
  BOOKINGS_ADMIN_DELETE: `${API_BASE_URL}/api/bookings`, // DELETE /:id - Delete booking
  
  // Admin endpoints
  ADMIN_STATS:            `${API_BASE_URL}/api/admin/stats`,
  ADMIN_USERS:            `${API_BASE_URL}/api/admin/users`,
  ADMIN_LOGINS:           `${API_BASE_URL}/api/admin/logins`,
  ADMIN_SETTINGS:         `${API_BASE_URL}/api/admin/settings`,
  ADMIN_ACCOUNTING:       `${API_BASE_URL}/api/admin/accounting/summary`,
  ADMIN_ACCOUNTING_MONTHLY: `${API_BASE_URL}/api/admin/accounting/monthly`,

  // Public settings (RIBs for confirmation page)
  PUBLIC_SETTINGS:        `${API_BASE_URL}/api/settings`,
  
  // Payment endpoints
  PAYMENT_INITIATE: `${API_BASE_URL}/api/payments/initiate`,
  PAYMENT_STATUS: `${API_BASE_URL}/api/payments`, // /:paymentRef/status
  PAYMENT_WEBHOOK: `${API_BASE_URL}/api/payments/webhook`,

  // Omra endpoints - PUBLIC
  OMRA_OFFERS: `${API_BASE_URL}/api/omra/offers`,
  OMRA_OFFER_DETAIL: (id) => `${API_BASE_URL}/api/omra/offers/${id}`,
  OMRA_RESERVE: (id) => `${API_BASE_URL}/api/omra/offers/${id}/reserve`,

  // Omra endpoints - ADMIN
  OMRA_ADMIN_STATS: `${API_BASE_URL}/api/omra/admin/stats`,
  OMRA_ADMIN_OFFERS: `${API_BASE_URL}/api/omra/admin/offers`,
  OMRA_ADMIN_OFFER: (id) => `${API_BASE_URL}/api/omra/admin/offers/${id}`,
  OMRA_ADMIN_RESERVATIONS: `${API_BASE_URL}/api/omra/admin/reservations`,
  OMRA_ADMIN_RESERVATION_STATUS: (id) => `${API_BASE_URL}/api/omra/admin/reservations/${id}/status`,

  // TripAdvisor proxy endpoints (server-side proxy, API key never exposed to browser)
  TRIPADVISOR_SEARCH:  `${API_BASE_URL}/api/tripadvisor/search`,
  TRIPADVISOR_DETAILS: (locationId) => `${API_BASE_URL}/api/tripadvisor/${locationId}/details`,
  TRIPADVISOR_PHOTOS:  (locationId) => `${API_BASE_URL}/api/tripadvisor/${locationId}/photos`,
  TRIPADVISOR_REVIEWS: (locationId) => `${API_BASE_URL}/api/tripadvisor/${locationId}/reviews`,
};

// Helper function to get endpoint with dynamic parameters
export const getEndpoint = (endpoint, params = {}) => {
  let url = API_ENDPOINTS[endpoint] || endpoint;
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  return url;
};

export default API_BASE_URL;
