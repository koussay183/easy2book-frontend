import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { API_ENDPOINTS } from '../config/api';

const HotelsContext = createContext();

const PAGE_SIZE = 10;

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

  // Prefetch refs — no re-render needed
  const prefetchCacheRef    = useRef(null);   // { offset, hotels, hasMore, total }
  const prefetchingRef      = useRef(false);
  const loadingMoreSyncRef  = useRef(false);  // synchronous guard (state update is async)

  /* ── Build URL + body (shared) ── */
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

  /* ── Background prefetch — fires silently, caches result ── */
  const prefetchPage = useCallback((params, offset) => {
    if (prefetchingRef.current) return;
    if (!params?.cityId) return;
    prefetchingRef.current = true;

    const { url, body } = buildRequest(params, offset);
    fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.status === 'success' && Array.isArray(data.data?.ListHotel)) {
          prefetchCacheRef.current = {
            offset,
            hotels:  data.data.ListHotel,
            hasMore: data.data?.HasMore  ?? false,
            total:   data.data?.Total    ?? 0,
          };
        }
      })
      .catch(() => {})
      .finally(() => { prefetchingRef.current = false; });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Initial fetch — resets results, then prefetches next page ── */
  const fetchHotels = useCallback(async (params) => {
    const { cityId, checkIn, checkOut, rooms, roomsConfig, cityName } = params;

    // Reset
    setLoading(true);
    setError(null);
    setHotels([]);
    setHasMore(false);
    setTotal(0);
    setCurrentOffset(0);
    prefetchCacheRef.current  = null;
    prefetchingRef.current    = false;
    loadingMoreSyncRef.current = false;

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

      const newHasMore = data.data?.HasMore ?? false;
      const newTotal   = data.data?.Total   ?? hotelsData.length;

      setHotels(hotelsData);
      setHasMore(newHasMore);
      setTotal(newTotal);
      setCurrentOffset(0);
      setSearchParams({ cityId, cityName, checkIn, checkOut, rooms, roomsConfig });

      // Fire prefetch for next page immediately in background
      if (newHasMore) {
        prefetchPage({ cityId, cityName, checkIn, checkOut, rooms, roomsConfig }, PAGE_SIZE);
      }

      return { success: true, data: hotelsData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [prefetchPage]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Load next page — uses prefetch cache if ready, then prefetches the one after ── */
  const loadMoreHotels = useCallback(async () => {
    if (loadingMoreSyncRef.current || !hasMore) return;
    loadingMoreSyncRef.current = true;

    const nextOffset = currentOffset + PAGE_SIZE;
    setLoadingMore(true);

    try {
      let newHotels, newHasMore, newTotal;

      // ── Try prefetch cache first (instant) ──
      if (prefetchCacheRef.current?.offset === nextOffset) {
        ({ hotels: newHotels, hasMore: newHasMore, total: newTotal } = prefetchCacheRef.current);
        prefetchCacheRef.current = null;
      } else {
        // Cache miss — fetch normally
        const { url, body } = buildRequest(searchParams, nextOffset);
        const response = await fetch(url, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        newHotels  = data.status === 'success' && Array.isArray(data.data?.ListHotel) ? data.data.ListHotel : [];
        newHasMore = data.data?.HasMore ?? false;
        newTotal   = data.data?.Total   ?? 0;
      }

      setHotels(prev => [...prev, ...newHotels]);
      setHasMore(newHasMore);
      if (newTotal) setTotal(newTotal);
      setCurrentOffset(nextOffset);

      // Fire prefetch for the page after this one
      if (newHasMore) {
        prefetchPage(searchParams, nextOffset + PAGE_SIZE);
      }
    } catch (err) {
      console.error('Error loading more hotels:', err);
      // Stop infinite scroll from retrying on error — prevents request loop
      setHasMore(false);
    } finally {
      setLoadingMore(false);
      loadingMoreSyncRef.current = false;
    }
  }, [searchParams, currentOffset, hasMore, prefetchPage]);

  const getHotelById = useCallback((id) => {
    return hotels.find(h => h.Id === parseInt(id) || h.Id === id);
  }, [hotels]);

  const clearHotels = useCallback(() => {
    setHotels([]);
    setHasMore(false);
    setTotal(0);
    setCurrentOffset(0);
    prefetchCacheRef.current = null;
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
