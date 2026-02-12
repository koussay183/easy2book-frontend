import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

const HotelsContext = createContext();

// Cache configuration
const CACHE_KEY = 'hotels_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Helper functions for localStorage cache
const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp, params } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return { data, params };
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

const setCachedData = (data, params) => {
  try {
    const cacheObject = {
      data,
      params,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

export const useHotels = () => {
  const context = useContext(HotelsContext);
  if (!context) {
    throw new Error('useHotels must be used within a HotelsProvider');
  }
  return context;
};

export const HotelsProvider = ({ children }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    cityId: null,
    cityName: null,
    checkIn: null,
    checkOut: null,
    rooms: 1,
    roomsConfig: [{ adults: 2, children: [] }]
  });

  // Load cached data on mount
  useEffect(() => {
    const cached = getCachedData();
    if (cached) {
      console.log('Loading hotels from localStorage cache');
      setHotels(cached.data);
      setSearchParams(cached.params);
    }
  }, []);

  const fetchHotels = useCallback(async (params) => {
    const { cityId, checkIn, checkOut, rooms, roomsConfig } = params;
    
    // Check if we need to refetch (only if search params changed)
    const paramsChanged = 
      searchParams.cityId !== cityId ||
      searchParams.checkIn !== checkIn ||
      searchParams.checkOut !== checkOut ||
      searchParams.rooms !== rooms ||
      JSON.stringify(searchParams.roomsConfig) !== JSON.stringify(roomsConfig);

    // If params haven't changed and we have cached data, use it
    if (!paramsChanged && hotels.length > 0) {
      console.log('Using in-memory cached hotel data');
      return { success: true, data: hotels };
    }

    // Check localStorage cache if params match
    const cached = getCachedData();
    if (cached && !paramsChanged) {
      console.log('Using localStorage cached hotel data');
      setHotels(cached.data);
      return { success: true, data: cached.data };
    }

    try {
      setLoading(true);
      setError(null);

      // Build API URL with required parameters
      const apiUrl = new URL(API_ENDPOINTS.MYGO_HOTELS);
      apiUrl.searchParams.append('City', cityId);
      if (checkIn) apiUrl.searchParams.append('CheckIn', checkIn);
      if (checkOut) apiUrl.searchParams.append('CheckOut', checkOut);

      // Prepare POST body with room configuration
      const requestBody = {
        SearchDetails: {
          Rooms: roomsConfig.map(room => ({
            Adult: room.adults,
            Child: room.children
          })),
          Filters: {
            OnlyAvailable: true
          }
        }
      };

      console.log('Fetching hotels from API:', apiUrl.toString());
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle the actual API response structure
      let hotelsData = [];
      if (data.status === 'success' && data.data && data.data.ListHotel) {
        hotelsData = Array.isArray(data.data.ListHotel) ? data.data.ListHotel : [];
      } else if (Array.isArray(data)) {
        hotelsData = data;
      }

      console.log('Fetched hotels:', hotelsData.length);

      const newParams = {
        cityId,
        cityName: params.cityName,
        checkIn,
        checkOut,
        rooms,
        roomsConfig
      };

      // Update state
      setHotels(hotelsData);
      setSearchParams(newParams);
      
      // Save to localStorage cache
      setCachedData(hotelsData, newParams);
      
      setLoading(false);

      return { success: true, data: hotelsData };
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, [hotels, searchParams]);

  const getHotelById = useCallback((id) => {
    return hotels.find(h => h.Id === parseInt(id) || h.Id === id);
  }, [hotels]);

  const clearHotels = useCallback(() => {
    setHotels([]);
    setSearchParams({
      cityId: null,
      cityName: null,
      checkIn: null,
      checkOut: null,
      rooms: 1,
      roomsConfig: [{ adults: 2, children: [] }]
    });
    clearCache(); // Clear localStorage cache too
  }, []);

  const value = {
    hotels,
    loading,
    error,
    searchParams,
    fetchHotels,
    getHotelById,
    clearHotels,
    clearCache // Export clearCache function
  };

  return (
    <HotelsContext.Provider value={value}>
      {children}
    </HotelsContext.Provider>
  );
};
