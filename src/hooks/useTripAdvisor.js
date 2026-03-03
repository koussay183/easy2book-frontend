import { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../config/api';

/* ── Module-level shared state ──────────────────────────────────────
 *
 *  searchCache:  hotelName  → undefined | 'loading' | 'not_found' | { locationId, ... }
 *  searchSubs:   hotelName  → Set of callbacks (one per mounted hook instance)
 *  fullCache:    locationId → undefined | 'loading' | { reviews, photos }
 *  fullSubs:     locationId → Set of callbacks
 *
 * ─────────────────────────────────────────────────────────────────── */
let taEnabledCache = null;
const searchCache  = {};
const searchSubs   = {};
const fullCache    = {};
const fullSubs     = {};

/* ── Helpers ─────────────────────────────────────────────────────── */
const notify = (subsMap, key, value) => {
  subsMap[key]?.forEach(cb => cb(value));
};

const subscribe = (subsMap, key, cb) => {
  if (!subsMap[key]) subsMap[key] = new Set();
  subsMap[key].add(cb);
  return () => subsMap[key]?.delete(cb);
};

/* ── Fetch enabled flag once ─────────────────────────────────────── */
const fetchTAEnabled = async () => {
  if (taEnabledCache !== null) return taEnabledCache;
  try {
    const res  = await fetch(API_ENDPOINTS.PUBLIC_SETTINGS);
    const data = await res.json();
    taEnabledCache = data?.data?.tripadvisor?.enabled ?? false;
  } catch {
    taEnabledCache = false;
  }
  return taEnabledCache;
};

/* ── One shared search fetch per hotel name ──────────────────────── */
const startSearch = async (hotelName) => {
  searchCache[hotelName] = 'loading';
  try {
    const enabled = await fetchTAEnabled();
    if (!enabled) {
      searchCache[hotelName] = 'not_found';
      notify(searchSubs, hotelName, null);
      return;
    }

    // Step 1: search by name → get location_id
    // Note: search response only has { location_id, name, address_obj } — no rating/reviews
    const res  = await fetch(
      `${API_ENDPOINTS.TRIPADVISOR_SEARCH}?query=${encodeURIComponent(hotelName)}&category=hotels`
    );
    const json = await res.json();
    const loc  = json?.data?.data?.[0] ?? null;

    if (!loc) {
      searchCache[hotelName] = 'not_found';
      notify(searchSubs, hotelName, null);
      return;
    }

    // Step 2: fetch details for that location_id → get rating, numReviews, webUrl
    let rating = null, numReviews = null, rankingData = null, webUrl = null, ratingImageUrl = null;
    try {
      const detRes  = await fetch(API_ENDPOINTS.TRIPADVISOR_DETAILS(loc.location_id));
      const detJson = await detRes.json();
      const det     = detJson?.data;
      rating          = parseFloat(det?.rating) || null;
      numReviews      = det?.num_reviews ? parseInt(det.num_reviews) : null;
      rankingData     = det?.ranking_data || null;
      webUrl          = det?.web_url || null;
      ratingImageUrl  = det?.rating_image_url || null;
    } catch { /* details fetch failed — proceed without rating */ }

    const result = {
      locationId:  loc.location_id,
      name:        loc.name,
      rating,
      numReviews,
      rankingData,
      webUrl,
      ratingImageUrl,
    };
    searchCache[hotelName] = result;
    notify(searchSubs, hotelName, result);
  } catch {
    searchCache[hotelName] = 'not_found';
    notify(searchSubs, hotelName, null);
  }
};

/* ── One shared full fetch (reviews + photos) per locationId ─────── */
const startFull = async (locationId) => {
  fullCache[locationId] = 'loading';
  try {
    const [revRes, photoRes] = await Promise.all([
      fetch(`${API_ENDPOINTS.TRIPADVISOR_REVIEWS(locationId)}?limit=5`),
      fetch(`${API_ENDPOINTS.TRIPADVISOR_PHOTOS(locationId)}?limit=5`),
    ]);
    const [revJson, photoJson] = await Promise.all([revRes.json(), photoRes.json()]);
    const result = {
      reviews: revJson?.data?.data   || [],
      photos:  photoJson?.data?.data || [],
    };
    fullCache[locationId] = result;
    notify(fullSubs, locationId, result);
  } catch {
    const result = { reviews: [], photos: [] };
    fullCache[locationId] = result;
    notify(fullSubs, locationId, result);
  }
};

/**
 * useTripAdvisor(hotelName, { fetchFull })
 *
 * All hook instances for the same hotelName share a single network fetch.
 * Every instance subscribes and receives the result when the fetch finishes,
 * regardless of how many are mounted simultaneously.
 *
 * Returns { taData, reviews, photos, loading }
 */
const useTripAdvisor = (hotelName, { fetchFull = false } = {}) => {
  // Init synchronously from cache if already available
  const [taData, setTaData] = useState(() => {
    if (!hotelName) return null;
    const c = searchCache[hotelName];
    if (!c || c === 'loading' || c === 'not_found') return null;
    return c;
  });
  const [reviews, setReviews] = useState([]);
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /* ── Step 1: search by name ──────────────────────────────────── */
  useEffect(() => {
    if (!hotelName) { setTaData(null); return; }

    const cached = searchCache[hotelName];

    // Result already in cache — use it immediately
    if (cached && cached !== 'loading') {
      setTaData(cached === 'not_found' ? null : cached);
      return;
    }

    // Subscribe so this instance gets notified when the shared fetch ends
    const unsub = subscribe(searchSubs, hotelName, (result) => {
      if (mountedRef.current) {
        setTaData(result);  // null if not found
        setLoading(false);
      }
    });

    if (!cached) {
      // First instance to request this name — defer so hotel cards paint first
      setLoading(true);
      if (typeof window !== 'undefined' && window.requestIdleCallback) {
        window.requestIdleCallback(() => startSearch(hotelName), { timeout: 2000 });
      } else {
        setTimeout(() => startSearch(hotelName), 50);
      }
    } else {
      // Another instance already started the fetch — just wait
      setLoading(true);
    }

    return unsub;
  }, [hotelName]);

  /* ── Step 2: fetch reviews + photos once we have a locationId ── */
  useEffect(() => {
    const locationId = taData?.locationId;
    if (!fetchFull || !locationId) return;

    const cached = fullCache[locationId];

    // Already fetched
    if (cached && cached !== 'loading') {
      if (mountedRef.current) {
        setReviews(cached.reviews || []);
        setPhotos(cached.photos  || []);
      }
      return;
    }

    const unsub = subscribe(fullSubs, locationId, (result) => {
      if (mountedRef.current) {
        setReviews(result?.reviews || []);
        setPhotos(result?.photos  || []);
      }
    });

    if (!cached) {
      startFull(locationId);
    }

    return unsub;
  }, [fetchFull, taData?.locationId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { taData, reviews, photos, loading };
};

export default useTripAdvisor;
