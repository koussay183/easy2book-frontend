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
  
  // Bookings endpoints
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  BOOKINGS_ADMIN_ALL: `${API_BASE_URL}/api/bookings/admin/all`,
  
  // Admin endpoints
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
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
