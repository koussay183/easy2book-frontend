import React, { createContext, useContext, useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';

const HotelsContext = createContext();

const PAGE_SIZE = 5;

export const useHotels = () => {
  const context = useContext(HotelsContext);
  if (!context) {
    throw new Error('useHotels must be used within a HotelsProvider');
  }
  return context;
};

export const HotelsProvider = ({ children }) => {
  const [hotels,        setHotels]        = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [error,         setError]         = useState(null);
  const [hasMore,       setHasMore]       = useState(false);
  const [total,         setTotal]         = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [searchParams,  setSearchParams]  = useState({
    cityId:      null,
    cityName:    null,
    checkIn:     null,
    checkOut:    null,
    rooms:       1,
    roomsConfig: [{ adults: 2, children: [] }]
  });

  /* ── Build URL + body (shared by fetchHotels and loadMoreHotels) ── */
  const buildRequest = (params, offset) => {
    const { cityId, checkIn, checkOut, roomsConfig } = params;
    const apiUrl = new URL(API_ENDPOINTS.MYGO_HOTELS);
    apiUrl.searchParams.append('City', cityId);
    if (checkIn)  apiUrl.searchParams.append('CheckIn',  checkIn);
    if (checkOut) apiUrl.searchParams.append('CheckOut', checkOut);
    apiUrl.searchParams.append('limit',  PAGE_SIZE);
    apiUrl.searchParams.append('offset', offset);

    const body = JSON.stringify({
      SearchDetails: {
        Rooms: (roomsConfig || [{ adults: 2, children: [] }]).map(r => ({
          Adult: r.adults,
          Child: r.children
        })),
        Filters: { OnlyAvailable: true }
      }
    });
    return { url: apiUrl.toString(), body };
  };

  /* ── Initial fetch — resets results ── */
  const fetchHotels = useCallback(async (params) => {
    const { cityId, checkIn, checkOut, rooms, roomsConfig, cityName } = params;

    setLoading(true);
    setError(null);
    setHotels([]);
    setHasMore(false);
    setTotal(0);
    setCurrentOffset(0);

    try {
      const { url, body } = buildRequest(params, 0);

      const response = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      let hotelsData = [];
      if (data.status === 'success' && data.data?.ListHotel) {
        hotelsData = Array.isArray(data.data.ListHotel) ? data.data.ListHotel : [];
      }

      setHotels(hotelsData);
      setHasMore(data.data?.HasMore ?? false);
      setTotal(data.data?.Total ?? hotelsData.length);
      setCurrentOffset(0);
      setSearchParams({ cityId, cityName, checkIn, checkOut, rooms, roomsConfig });

      return { success: true, data: hotelsData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Load next page — appends to existing results ── */
  const loadMoreHotels = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    const nextOffset = currentOffset + PAGE_SIZE;
    setLoadingMore(true);

    try {
      const { url, body } = buildRequest(searchParams, nextOffset);

      const response = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      let newHotels = [];
      if (data.status === 'success' && data.data?.ListHotel) {
        newHotels = Array.isArray(data.data.ListHotel) ? data.data.ListHotel : [];
      }

      setHotels(prev => [...prev, ...newHotels]);
      setHasMore(data.data?.HasMore ?? false);
      setCurrentOffset(nextOffset);
    } catch (err) {
      console.error('Error loading more hotels:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [searchParams, currentOffset, hasMore, loadingMore]);

  const getHotelById = useCallback((id) => {
    return hotels.find(h => h.Id === parseInt(id) || h.Id === id);
  }, [hotels]);

  const clearHotels = useCallback(() => {
    setHotels([]);
    setHasMore(false);
    setTotal(0);
    setCurrentOffset(0);
    setSearchParams({
      cityId: null, cityName: null, checkIn: null,
      checkOut: null, rooms: 1, roomsConfig: [{ adults: 2, children: [] }]
    });
  }, []);

  const value = {
    hotels,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    searchParams,
    fetchHotels,
    loadMoreHotels,
    getHotelById,
    clearHotels
  };

  return (
    <HotelsContext.Provider value={value}>
      {children}
    </HotelsContext.Provider>
  );
};
