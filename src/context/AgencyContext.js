import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from './AuthContext';

const AgencyContext = createContext(null);

export const AgencyProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [agency, setAgency]   = useState(null);
  const [loading, setLoading] = useState(true);

  const isAgencyUser  = !!(user && ['agency_admin', 'agency_staff'].includes(user.role));
  const isAgencyAdmin = user?.role === 'agency_admin';

  const authHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type':  'application/json',
  }), [token]);

  const loadAgency = useCallback(async () => {
    if (!isAgencyUser || !token) {
      setLoading(false);
      return;
    }
    try {
      const res  = await fetch(API_ENDPOINTS.AGENCY_ME, { headers: authHeaders() });
      const data = await res.json();
      if (data.status === 'success') setAgency(data.data.agency);
    } catch (_) {}
    finally { setLoading(false); }
  }, [isAgencyUser, token, authHeaders]);

  useEffect(() => {
    setLoading(true);
    loadAgency();
  }, [loadAgency]);

  /** Authenticated fetch wrapper for agency API calls */
  const agencyFetch = useCallback((url, options = {}) =>
    fetch(url, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    }),
    [authHeaders]
  );

  return (
    <AgencyContext.Provider value={{
      agency,
      loading,
      isAgencyUser,
      isAgencyAdmin,
      agencyFetch,
      refreshAgency: loadAgency,
      token,
    }}>
      {children}
    </AgencyContext.Provider>
  );
};

export const useAgency = () => {
  const ctx = useContext(AgencyContext);
  if (!ctx) throw new Error('useAgency must be used within AgencyProvider');
  return ctx;
};
