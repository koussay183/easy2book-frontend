import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.AUTH;

// Register new user
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData)
  });
  
  return await response.json();
};

// Login user
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  
  return await response.json();
};

// Logout user
export const logoutUser = async (token) => {
  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include'
  });
  
  return await response.json();
};

// Get current user
export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include'
  });
  
  return await response.json();
};

// Refresh access token
export const refreshAccessToken = async () => {
  const response = await fetch(`${API_URL}/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  });
  
  return await response.json();
};

// Forgot password
export const forgotPasswordRequest = async (email) => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  });
  
  return await response.json();
};

// Reset password
export const resetPasswordRequest = async (token, newPassword) => {
  const response = await fetch(`${API_URL}/reset-password/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ password: newPassword })
  });
  
  return await response.json();
};

// Verify email
export const verifyEmail = async (token) => {
  const response = await fetch(`${API_URL}/verify-email/${token}`, {
    method: 'GET',
  });
  
  return await response.json();
};

// Update profile
export const updateUserProfile = async (token, profileData) => {
  const response = await fetch(`${API_URL}/update-profile`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(profileData)
  });
  
  return await response.json();
};

// Update password
export const updateUserPassword = async (token, currentPassword, newPassword) => {
  const response = await fetch(`${API_URL}/update-password`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword })
  });
  
  return await response.json();
};

// Delete account
export const deleteUserAccount = async (token) => {
  const response = await fetch(`${API_URL}/delete-account`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include'
  });
  
  return await response.json();
};
