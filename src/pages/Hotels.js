 import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, ArrowLeft, Loader2, AlertCircle, Hotel as HotelIcon, Search, SlidersHorizontal, Star, DollarSign, Utensils, X, Check, Moon, Plus, Minus } from 'lucide-react';
import HotelResultCard from '../components/hotels/HotelResultCard';
import GuestSelector from '../components/landing/GuestSelector';
import { useLanguage } from '../context/LanguageContext';
import { useHotels } from '../context/HotelsContext';

// Shared city list
const CITIES = [
  { id: 10, name: "Hammamet", region: "Cap Bon", country: "Tunisie" },
  { id: 11, name: "Nabeul", region: "Cap Bon", country: "Tunisie" },
  { id: 12, name: "Kelibia", region: "Cap Bon", country: "Tunisie" },
  { id: 13, name: "Korba", region: "Cap Bon", country: "Tunisie" },
  { id: 14, name: "Korbous", region: "Cap Bon", country: "Tunisie" },
  { id: 17, name: "Kairouan", region: "Centre", country: "Tunisie" },
  { id: 18, name: "Djerba", region: "Djerba & Zarzis", country: "Tunisie" },
  { id: 19, name: "Zarzis", region: "Djerba & Zarzis", country: "Tunisie" },
  { id: 20, name: "Douz", region: "Djerid", country: "Tunisie" },
  { id: 22, name: "Kebili", region: "Djerid", country: "Tunisie" },
  { id: 23, name: "Ksar Ghilane", region: "Djerid", country: "Tunisie" },
  { id: 31, name: "Ain Drahem", region: "Nord", country: "Tunisie" },
  { id: 32, name: "Tunis", region: "Tunis et Côtes de Carthage", country: "Tunisie" },
  { id: 33, name: "Tabarka", region: "Tabarka", country: "Tunisie" },
  { id: 34, name: "Sousse", region: "Sahel", country: "Tunisie" },
  { id: 35, name: "Mahdia", region: "Sahel", country: "Tunisie" },
  { id: 37, name: "Monastir", region: "Sahel", country: "Tunisie" },
  { id: 39, name: "Sfax", region: "Sfax", country: "Tunisie" },
  { id: 47, name: "Tozeur", region: "Djerid", country: "Tunisie" },
  { id: 48, name: "Bizerte", region: "Nord", country: "Tunisie" },
  { id: 49, name: "Le Kef", region: "Nord-ouest", country: "Tunisie" },
  { id: 54, name: "Gafsa", region: "Sud", country: "Tunisie" },
  { id: 55, name: "Gabes", region: "Sud", country: "Tunisie" },
  { id: 59, name: "Zaghouan", region: "Cap Bon", country: "Tunisie" },
  { id: 70, name: "Tataouine", region: "Sud", country: "Tunisie" },
  { id: 71, name: "Téboursouk", region: "Nord-ouest", country: "Tunisie" },
  { id: 72, name: "Sbeitla", region: "Centre", country: "Tunisie" },
  { id: 73, name: "Matmata", region: "Sud", country: "Tunisie" },
  { id: 74, name: "Sidi Bouzid", region: "Centre", country: "Tunisie" },
  { id: 75, name: "Nefta", region: "Djerid", country: "Tunisie" },
  { id: 76, name: "Mednenine", region: "Djerba & Zarzis", country: "Tunisie" },
  { id: 6482, name: "El Jem", region: "Sahel", country: "Tunisie" },
  { id: 6483, name: "Kerkennah", region: "Sfax", country: "Tunisie" },
  { id: 6484, name: "Nefza", region: "Nord-ouest", country: "Tunisie" },
  { id: 6485, name: "Gammarth", region: "Gammarth", country: "Tunisie" },
  { id: 6487, name: "Béja", region: "Béja", country: "Tunisie" },
  { id: 6488, name: "Istanbul", region: "", country: "Turquie" },
  { id: 6489, name: "Esenyurt - Istanbul", region: "", country: "Turquie" },
];

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { hotels, loading, loadingMore, error, hasMore, total, fetchHotels, loadMoreHotels } = useHotels();
  const isRTL = language === 'ar';

  // Get search parameters
  const cityId = searchParams.get('cityId');
  const cityName = searchParams.get('cityName');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const rooms = searchParams.get('rooms') || '1';
  
  // Parse roomsConfig from URL
  const roomsConfigParam = searchParams.get('roomsConfig');
  let roomsConfig = [];
  try {
    roomsConfig = roomsConfigParam ? JSON.parse(decodeURIComponent(roomsConfigParam)) : [{ adults: 2, children: [] }];
  } catch (e) {
    console.error('Error parsing roomsConfig:', e);
    roomsConfig = [{ adults: 2, children: [] }];
  }

  const [filteredHotels, setFilteredHotels] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Search state - Initialize with URL params
  const [searchCityName, setSearchCityName] = useState(cityName || '');
  const [searchCheckIn, setSearchCheckIn] = useState(checkIn || '');
  const [searchCheckOut, setSearchCheckOut] = useState(checkOut || '');
  const [searchRoomsConfig, setSearchRoomsConfig] = useState(roomsConfig);
  const [searchRooms, setSearchRooms] = useState(Number(rooms));
  const [dateMode, setDateMode] = useState('checkout'); // 'checkout' | 'nights'
  const [searchNights, setSearchNights] = useState(() => {
    if (checkIn && checkOut) {
      const n = Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000);
      return n > 0 ? n : 2;
    }
    return 2;
  });

  // Header destination autocomplete
  const [headerDest, setHeaderDest] = useState(cityName || '');
  const [headerCity, setHeaderCity] = useState(null);   // selected city from dropdown
  const [headerResults, setHeaderResults] = useState([]); // [{ city }]
  const [showHeaderDrop, setShowHeaderDrop] = useState(false);
  const headerDestRef        = useRef(null);
  const mobileDestRef        = useRef(null);
  const sentinelRef          = useRef(null);
  const prevFilteredCountRef = useRef(0);

  // Build city suggestions for header destination dropdown
  useEffect(() => {
    const q = headerDest.trim().toLowerCase();
    if (q === '') {
      setHeaderResults(CITIES);
      return;
    }
    setHeaderResults(
      CITIES.filter(c =>
        c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
      )
    );
  }, [headerDest]);

  // Close header dropdown on outside click (checks both desktop & mobile refs)
  useEffect(() => {
    const handler = (e) => {
      const inDesktop = headerDestRef.current?.contains(e.target);
      const inMobile  = mobileDestRef.current?.contains(e.target);
      if (!inDesktop && !inMobile) setShowHeaderDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Infinite scroll — poll every 300ms to check if sentinel is in viewport.
  // Polling with getBoundingClientRect() is the most reliable approach for
  // iOS Safari, which has known issues with IntersectionObserver and scroll
  // events when inside complex flex layouts.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loadingMore) return;

    const check = () => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < viewH + 400) {
        loadMoreHotels();
      }
    };

    // Check immediately (handles case where all loaded hotels fit on screen)
    check();

    // Poll every 300ms — works on all browsers regardless of scroll container
    const interval = setInterval(check, 300);
    return () => clearInterval(interval);
  }, [hasMore, loadingMore, loadMoreHotels]);

  // Scroll to first newly loaded hotel after each batch
  useEffect(() => {
    prevFilteredCountRef.current = filteredHotels.length;
  }, [filteredHotels.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter state (applied filters)
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    starRating: [],
    sortBy: 'recommended',
    facilities: [],
    themes: [],
    boardingTypes: []
  });

  // Temporary filter state (for modal)
  const [tempFilters, setTempFilters] = useState({
    priceRange: [0, 5000],
    starRating: [],
    sortBy: 'recommended',
    facilities: [],
    themes: [],
    boardingTypes: []
  });

  // Update search state when URL params change
  useEffect(() => {
    setSearchCityName(cityName || '');
    setSearchCheckIn(checkIn || '');
    setSearchCheckOut(checkOut || '');
    setSearchRooms(Number(rooms));
    setSearchRoomsConfig(roomsConfig);
  }, [cityName, checkIn, checkOut, rooms, roomsConfigParam]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadHotels = async () => {
      if (!cityId) {
        return;
      }

      await fetchHotels({
        cityId,
        cityName,
        checkIn,
        checkOut,
        rooms: Number(rooms),
        roomsConfig: roomsConfig
      });
    };

    loadHotels();
  }, [cityId, checkIn, checkOut, rooms, roomsConfigParam, fetchHotels, cityName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply filters whenever filters or hotels change
  useEffect(() => {
    let result = [...hotels];

    console.log('Applying filters to', result.length, 'hotels');
    console.log('Current filters:', filters);

    // Filter by star rating
    if (filters.starRating.length > 0) {
      result = result.filter(hotel => {
        const rating = hotel.Category?.Star || hotel.StarRating || hotel.Rating || hotel.Stars || 0;
        const matches = filters.starRating.includes(rating);
        return matches;
      });
    }

    // Filter by boarding types
    if (filters.boardingTypes.length > 0) {
      result = result.filter(hotel => {
        if (!hotel.SearchData?.Price?.Boarding) return false;
        return filters.boardingTypes.some(selectedBoarding =>
          hotel.SearchData.Price.Boarding.some(b => b.Code === selectedBoarding || b.Name.toLowerCase().includes(selectedBoarding.toLowerCase()))
        );
      });
    }

    // Filter by facilities
    if (filters.facilities.length > 0) {
      result = result.filter(hotel => {
        if (!hotel.Facilities || hotel.Facilities.length === 0) return false;
        return filters.facilities.every(selectedFacility =>
          hotel.Facilities.some(f => f.Title.toLowerCase().includes(selectedFacility.toLowerCase()))
        );
      });
    }

    // Filter by themes
    if (filters.themes.length > 0) {
      result = result.filter(hotel => {
        if (!hotel.Theme || hotel.Theme.length === 0) return false;
        return filters.themes.some(selectedTheme =>
          hotel.Theme.some(t => t.toLowerCase().includes(selectedTheme.toLowerCase()))
        );
      });
    }

    // Filter by price range - only filter if price data exists
    const minPrice = filters.priceRange[0];
    const maxPrice = filters.priceRange[1];
    result = result.filter(hotel => {
      // Try to get price from SearchData first
      let hotelMinPrice = null;
      
      if (hotel.SearchData?.Price?.Boarding) {
        let minSearchPrice = Infinity;
        hotel.SearchData.Price.Boarding.forEach(boarding => {
          boarding.Pax?.forEach(pax => {
            pax.Rooms?.forEach(room => {
              const price = parseFloat(room.Price || room.BasePrice || 0);
              if (price < minSearchPrice) {
                minSearchPrice = price;
              }
            });
          });
        });
        if (minSearchPrice !== Infinity) {
          hotelMinPrice = minSearchPrice;
        }
      }
      
      // Fallback to old price fields
      if (!hotelMinPrice) {
        hotelMinPrice = hotel.Price || hotel.MinPrice || hotel.price || hotel.minPrice;
      }
      
      // If hotel has no price, include it (don't filter out)
      if (!hotelMinPrice || hotelMinPrice === 0) {
        return true;
      }
      const inRange = hotelMinPrice >= minPrice && hotelMinPrice <= maxPrice;
      return inRange;
    });

    console.log('After filtering:', result.length, 'hotels remain');

    // Sort hotels
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => {
          const priceA = getHotelMinPrice(a);
          const priceB = getHotelMinPrice(b);
          return priceA - priceB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const priceA = getHotelMinPrice(a);
          const priceB = getHotelMinPrice(b);
          return priceB - priceA;
        });
        break;
      case 'rating':
        result.sort((a, b) => (b.Category?.Star || b.StarRating || b.Rating || 0) - (a.Category?.Star || a.StarRating || a.Rating || 0));
        break;
      case 'name':
        result.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
        break;
      default:
        // recommended - keep original order
        break;
    }

    setFilteredHotels(result);
  }, [filters, hotels]);

  // Helper function to get minimum price from hotel
  const getHotelMinPrice = (hotel) => {
    // Try SearchData first
    if (hotel.SearchData?.Price?.Boarding) {
      let minPrice = Infinity;
      hotel.SearchData.Price.Boarding.forEach(boarding => {
        boarding.Pax?.forEach(pax => {
          pax.Rooms?.forEach(room => {
            const price = parseFloat(room.Price || room.BasePrice || 0);
            if (price < minPrice) {
              minPrice = price;
            }
          });
        });
      });
      if (minPrice !== Infinity) return minPrice;
    }
    // Fallback to old price fields
    return hotel.Price || hotel.MinPrice || 0;
  };

  const computeCheckOut = (checkInVal) => {
    if (dateMode === 'nights' && checkInVal && searchNights > 0) {
      const d = new Date(checkInVal);
      d.setDate(d.getDate() + searchNights);
      return d.toISOString().split('T')[0];
    }
    return searchCheckOut;
  };

  const handleHeaderCitySelect = (city) => {
    setHeaderDest(city.name);
    setHeaderCity(city);
    setSearchCityName(city.name);
    setShowHeaderDrop(false);
  };

  const handleSearch = () => {
    const targetCityId = headerCity?.id || cityId;
    const targetCityName = headerCity?.name || searchCityName;
    const out = computeCheckOut(searchCheckIn);

    const params = new URLSearchParams();
    if (targetCityId) params.set('cityId', String(targetCityId));
    if (targetCityName) params.set('cityName', targetCityName);
    if (searchCheckIn) params.set('checkIn', searchCheckIn);
    if (out) params.set('checkOut', out);
    params.set('rooms', searchRooms.toString());
    params.set('roomsConfig', JSON.stringify(searchRoomsConfig));
    setSearchParams(params);

    if (targetCityId) {
      fetchHotels({ cityId: targetCityId, cityName: targetCityName, checkIn: searchCheckIn, checkOut: out, rooms: searchRooms, roomsConfig: searchRoomsConfig });
    }
  };

  const toggleStarRating = (rating) => {
    setTempFilters(prev => ({
      ...prev,
      starRating: prev.starRating.includes(rating)
        ? prev.starRating.filter(r => r !== rating)
        : [...prev.starRating, rating]
    }));
  };

  const toggleTheme = (theme) => {
    setTempFilters(prev => ({
      ...prev,
      themes: prev.themes.includes(theme)
        ? prev.themes.filter(t => t !== theme)
        : [...prev.themes, theme]
    }));
  };

  const toggleBoardingType = (boardingType) => {
    setTempFilters(prev => ({
      ...prev,
      boardingTypes: prev.boardingTypes.includes(boardingType)
        ? prev.boardingTypes.filter(b => b !== boardingType)
        : [...prev.boardingTypes, boardingType]
    }));
  };

  const clearTempFilters = () => {
    setTempFilters({
      priceRange: [0, 5000],
      starRating: [],
      sortBy: 'recommended',
      facilities: [],
      themes: [],
      boardingTypes: []
    });
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: [0, 5000],
      starRating: [],
      sortBy: 'recommended',
      facilities: [],
      themes: [],
      boardingTypes: []
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const openFilterModal = () => {
    setTempFilters(filters); // Copy current filters to temp
    setShowFilters(true);
  };

  const allThemes = [...new Set(
    hotels.flatMap(h => h.Theme || [])
  )].sort();

  const allBoardingTypes = [...new Set(
    hotels.flatMap(h => 
      h.SearchData?.Price?.Boarding?.map(b => ({code: b.Code, name: b.Name})) || []
    ).map(b => JSON.stringify(b))
  )].map(b => JSON.parse(b));

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-md">
        <div className="max-w-5xl mx-auto px-4 pt-3 pb-4 space-y-3">

          {/* ─ Row 1: Back ← · · · Filters + Count ─ */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>

            {/* Back button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-500 hover:text-primary-700 transition-colors group flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-primary-50 flex items-center justify-center transition-colors">
                <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-primary-700">
                {language === 'fr' ? 'Retour' : language === 'ar' ? 'رجوع' : 'Back'}
              </span>
            </button>

            {/* City summary (desktop only) */}
            {cityName && (
              <div className="hidden md:flex items-center gap-1.5 text-gray-600">
                <MapPin size={13} className="text-primary-500" />
                <span className="text-sm font-bold text-gray-800">{cityName}</span>
                {searchCheckIn && searchCheckOut && (
                  <>
                    <span className="text-gray-300 mx-0.5">·</span>
                    <span className="text-xs text-gray-400">{searchCheckIn} → {searchCheckOut}</span>
                  </>
                )}
              </div>
            )}

            {/* Mobile: tappable search summary chip — opens the search bottom sheet */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex md:hidden flex-1 mx-2 items-center gap-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl px-3 py-2 min-w-0 transition-colors"
            >
              <Search size={13} className="text-primary-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">
                {cityName || (language === 'fr' ? 'Destination' : language === 'ar' ? 'الوجهة' : 'Destination')}
                {searchCheckIn ? ` · ${searchCheckIn}` : ''}
              </span>
            </button>

            {/* Filters + count + loading */}
            <div className={`flex items-center gap-2 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={openFilterModal}
                className={`relative flex items-center gap-1.5 border-2 rounded-xl py-2 px-3 font-semibold text-sm transition-colors ${
                  (filters.starRating.length > 0 || filters.boardingTypes.length > 0 || filters.themes.length > 0 || filters.priceRange[1] < 5000)
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <SlidersHorizontal size={15} />
                <span className="hidden sm:inline">
                  {language === 'fr' ? 'Filtres' : language === 'ar' ? 'فلاتر' : 'Filters'}
                </span>
                {(filters.starRating.length + filters.boardingTypes.length + filters.themes.length + (filters.priceRange[1] < 5000 ? 1 : 0)) > 0 && (
                  <span className="bg-primary-700 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {filters.starRating.length + filters.boardingTypes.length + filters.themes.length + (filters.priceRange[1] < 5000 ? 1 : 0)}
                  </span>
                )}
              </button>

              {!loading && !error && (
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-xl">
                  <HotelIcon size={13} className="text-gray-500" />
                  <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
                    {filteredHotels.length}{hasMore && total > hotels.length ? ` / ${total}` : ''}
                  </span>
                </div>
              )}
              {loading && <Loader2 size={18} className="text-primary-600 animate-spin" />}
            </div>
          </div>

          {/* ─ Row 2: Desktop-only search bar — mobile uses bottom sheet modal ─ */}
          <div ref={headerDestRef} className="hidden md:block">

            {/* ── Desktop: unified horizontal bar ── */}
            <div className={`flex items-stretch bg-white border-2 border-gray-200 rounded-2xl overflow-visible hover:border-primary-300 focus-within:border-primary-500 transition-colors shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>

              {/* Destination */}
              <div className="flex-[2] relative min-w-0">
                <button
                  type="button"
                  onClick={() => setShowHeaderDrop(true)}
                  className={`w-full h-full text-left px-5 py-3.5 hover:bg-gray-50/80 rounded-l-2xl transition-colors ${isRTL ? 'text-right' : ''}`}
                >
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    {language === 'fr' ? 'Destination' : language === 'ar' ? 'الوجهة' : 'Destination'}
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <MapPin size={14} className="text-primary-500 flex-shrink-0" />
                    <input
                      value={headerDest}
                      onChange={e => { setHeaderDest(e.target.value); setHeaderCity(null); setShowHeaderDrop(true); }}
                      onFocus={() => setShowHeaderDrop(true)}
                      placeholder={language === 'fr' ? 'Ville ou hôtel…' : language === 'ar' ? 'مدينة أو فندق…' : 'City or hotel…'}
                      className={`bg-transparent text-sm font-semibold text-gray-800 outline-none w-full placeholder:text-gray-400 placeholder:font-normal ${isRTL ? 'text-right' : ''}`}
                    />
                  </div>
                </button>

                {showHeaderDrop && headerResults.length > 0 && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                    {headerResults.map(city => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleHeaderCitySelect(city)}
                        className="w-full text-left px-4 py-2.5 hover:bg-primary-50 flex items-center gap-3 border-b border-gray-50 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <MapPin size={13} className="text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{city.name}</div>
                          {city.region && <div className="text-xs text-gray-400">{city.region}{city.country ? `, ${city.country}` : ''}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px bg-gray-200 my-2.5 flex-shrink-0" />

              {/* Check-in */}
              <div className="flex-1 min-w-0 px-4 py-3.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {language === 'fr' ? 'Arrivée' : language === 'ar' ? 'الوصول' : 'Check-in'}
                </div>
                <div className={`flex items-center gap-2 overflow-hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={searchCheckIn}
                    onChange={e => setSearchCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-transparent text-sm font-semibold text-gray-800 outline-none w-full min-w-0 appearance-none"
                  />
                </div>
              </div>

              <div className="w-px bg-gray-200 my-2.5 flex-shrink-0" />

              {/* Check-out / Nights */}
              <div className="flex-1 min-w-0 px-4 py-3.5">
                <div className={`flex items-center gap-1 mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setDateMode('checkout')}
                    className={`flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md transition-all ${dateMode === 'checkout' ? 'bg-primary-700 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Calendar size={9} />
                    {language === 'fr' ? 'Départ' : language === 'ar' ? 'مغادرة' : 'Out'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateMode('nights')}
                    className={`flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md transition-all ${dateMode === 'nights' ? 'bg-primary-700 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Moon size={9} />
                    {language === 'fr' ? 'Nuits' : language === 'ar' ? 'ليالي' : 'Nights'}
                  </button>
                </div>
                {dateMode === 'checkout' ? (
                  <div className={`flex items-center gap-2 overflow-hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="date"
                      value={searchCheckOut}
                      onChange={e => setSearchCheckOut(e.target.value)}
                      min={searchCheckIn || new Date().toISOString().split('T')[0]}
                      className="bg-transparent text-sm font-semibold text-gray-800 outline-none w-full min-w-0 appearance-none"
                    />
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button type="button" onClick={() => setSearchNights(n => Math.max(1, n - 1))} className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0">
                      <Minus size={11} />
                    </button>
                    <span className="text-sm font-bold text-primary-700 min-w-[2ch] text-center">{searchNights}</span>
                    <span className="text-xs text-gray-500">
                      {language === 'fr' ? (searchNights === 1 ? 'nuit' : 'nuits') : language === 'ar' ? (searchNights === 1 ? 'ليلة' : 'ليالي') : (searchNights === 1 ? 'night' : 'nights')}
                    </span>
                    <button type="button" onClick={() => setSearchNights(n => Math.min(30, n + 1))} className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0">
                      <Plus size={11} />
                    </button>
                  </div>
                )}
              </div>

              <div className="w-px bg-gray-200 my-2.5 flex-shrink-0" />

              {/* Guests */}
              <button
                type="button"
                onClick={() => setShowGuestSelector(true)}
                className={`flex-1 min-w-0 px-4 py-3.5 text-left hover:bg-gray-50/80 transition-colors ${isRTL ? 'text-right' : ''}`}
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {language === 'fr' ? 'Voyageurs' : language === 'ar' ? 'الضيوف' : 'Guests'}
                </div>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Users size={13} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {searchRooms} {language === 'fr' ? 'ch.' : language === 'ar' ? 'غ' : 'rm'} · {searchRoomsConfig.reduce((s, r) => s + r.adults, 0)} {language === 'fr' ? 'ad.' : language === 'ar' ? 'بالغ' : 'ad.'}
                    {searchRoomsConfig.reduce((s, r) => s + r.children.length, 0) > 0 && ` · ${searchRoomsConfig.reduce((s, r) => s + r.children.length, 0)} ${language === 'fr' ? 'enf.' : language === 'ar' ? 'أطفال' : 'ch.'}`}
                  </span>
                </div>
              </button>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className={`bg-primary-700 hover:bg-primary-800 active:scale-95 text-white px-7 font-bold text-sm transition-all flex items-center gap-2 flex-shrink-0 rounded-r-2xl ${isRTL ? 'rounded-r-none rounded-l-2xl' : ''}`}
              >
                <Search size={17} />
                <span>{language === 'fr' ? 'Rechercher' : language === 'ar' ? 'بحث' : 'Search'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ══ Mobile search modal (centered) ══════════════════════════════════ */}
      {showSearchModal && (
        <div className="md:hidden fixed inset-0 z-[100] flex items-center justify-center p-4">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearchModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-3 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-base font-bold text-gray-900">
                {language === 'fr' ? 'Modifier la recherche' : language === 'ar' ? 'تعديل البحث' : 'Edit search'}
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="px-5 py-4 space-y-4">

              {/* Destination */}
              <div ref={mobileDestRef}>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  {language === 'fr' ? 'Destination' : language === 'ar' ? 'الوجهة' : 'Destination'}
                </label>
                <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-primary-500 transition-colors">
                  <MapPin size={14} className="text-primary-500 flex-shrink-0" />
                  <input
                    value={headerDest}
                    onChange={e => { setHeaderDest(e.target.value); setHeaderCity(null); setShowHeaderDrop(true); }}
                    onFocus={() => setShowHeaderDrop(true)}
                    placeholder={language === 'fr' ? 'Ville ou hôtel…' : language === 'ar' ? 'مدينة أو فندق…' : 'City or hotel…'}
                    className={`bg-transparent text-sm font-semibold text-gray-800 outline-none w-full placeholder:text-gray-400 placeholder:font-normal ${isRTL ? 'text-right' : ''}`}
                  />
                  {headerDest && (
                    <button type="button" onClick={() => { setHeaderDest(''); setHeaderCity(null); }} className="flex-shrink-0">
                      <X size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>
                {showHeaderDrop && headerResults.length > 0 && (
                  <div className="mt-1.5 max-h-44 overflow-y-auto rounded-xl border border-gray-200 shadow-lg bg-white">
                    {headerResults.slice(0, 10).map(city => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => { handleHeaderCitySelect(city); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-primary-50 flex items-center gap-2.5 border-b border-gray-50 transition-colors last:border-0"
                      >
                        <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <MapPin size={11} className="text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{city.name}</div>
                          {city.region && <div className="text-xs text-gray-400 truncate">{city.region}{city.country !== 'Tunisie' ? `, ${city.country}` : ''}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Check-in */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  {language === 'fr' ? 'Arrivée' : language === 'ar' ? 'الوصول' : 'Check-in'}
                </label>
                <div className="flex items-center gap-2 overflow-hidden border-2 border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-primary-500 transition-colors">
                  <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={searchCheckIn}
                    onChange={e => setSearchCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-transparent text-sm font-semibold text-gray-800 outline-none w-full min-w-0 appearance-none"
                  />
                </div>
              </div>

              {/* Check-out / Nights */}
              <div>
                <div className={`flex items-center gap-2 mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setDateMode('checkout')}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${dateMode === 'checkout' ? 'bg-primary-700 text-white' : 'text-gray-400 bg-gray-100'}`}
                  >
                    <Calendar size={9} />
                    {language === 'fr' ? 'Départ' : language === 'ar' ? 'مغادرة' : 'Check-out'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateMode('nights')}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${dateMode === 'nights' ? 'bg-primary-700 text-white' : 'text-gray-400 bg-gray-100'}`}
                  >
                    <Moon size={9} />
                    {language === 'fr' ? 'Nuits' : language === 'ar' ? 'ليالي' : 'Nights'}
                  </button>
                </div>
                {dateMode === 'checkout' ? (
                  <div className="flex items-center gap-2 overflow-hidden border-2 border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-primary-500 transition-colors">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="date"
                      value={searchCheckOut}
                      onChange={e => setSearchCheckOut(e.target.value)}
                      min={searchCheckIn || new Date().toISOString().split('T')[0]}
                      className="bg-transparent text-sm font-semibold text-gray-800 outline-none w-full min-w-0 appearance-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 border-2 border-gray-200 rounded-xl px-3 py-2.5">
                    <button type="button" onClick={() => setSearchNights(n => Math.max(1, n - 1))}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="text-base font-bold text-primary-700 min-w-[2ch] text-center">{searchNights}</span>
                    <span className="text-sm text-gray-500 flex-1">
                      {language === 'fr' ? (searchNights === 1 ? 'nuit' : 'nuits') : language === 'ar' ? (searchNights === 1 ? 'ليلة' : 'ليالي') : (searchNights === 1 ? 'night' : 'nights')}
                    </span>
                    <button type="button" onClick={() => setSearchNights(n => Math.min(30, n + 1))}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Guests */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  {language === 'fr' ? 'Voyageurs' : language === 'ar' ? 'الضيوف' : 'Guests'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowGuestSelector(true)}
                  className={`w-full flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2.5 hover:border-primary-300 transition-colors text-left ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                >
                  <Users size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-800">
                    {searchRooms} {language === 'fr' ? 'chambre(s)' : language === 'ar' ? 'غرفة' : 'room(s)'} · {searchRoomsConfig.reduce((s, r) => s + r.adults, 0)} {language === 'fr' ? 'adulte(s)' : language === 'ar' ? 'بالغ' : 'adult(s)'}
                    {searchRoomsConfig.reduce((s, r) => s + r.children.length, 0) > 0 && ` · ${searchRoomsConfig.reduce((s, r) => s + r.children.length, 0)} ${language === 'fr' ? 'enfant(s)' : language === 'ar' ? 'أطفال' : 'child(ren)'}`}
                  </span>
                </button>
              </div>

              {/* Search CTA */}
              <button
                onClick={() => { handleSearch(); setShowSearchModal(false); }}
                className={`w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 active:scale-95 text-white px-4 py-3.5 rounded-2xl font-bold text-base transition-all shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Search size={18} />
                <span>{language === 'fr' ? 'Rechercher' : language === 'ar' ? 'بحث' : 'Search'}</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        {/* Active Filters Summary */}
        {(filters.starRating.length > 0 || filters.boardingTypes.length > 0 || filters.themes.length > 0 || filters.priceRange[1] < 5000 || filters.sortBy !== 'recommended') && (
          <div className="mb-6 flex items-center justify-between bg-white rounded-xl shadow-md p-4">
            <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              {filters.sortBy !== 'recommended' && (
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                  {filters.sortBy === 'price-low' ? (language === 'fr' ? 'Prix ↑' : 'Price ↑') :
                   filters.sortBy === 'price-high' ? (language === 'fr' ? 'Prix ↓' : 'Price ↓') :
                   filters.sortBy === 'rating' ? (language === 'fr' ? 'Étoiles' : 'Rating') :
                   (language === 'fr' ? 'Nom' : 'Name')}
                </span>
              )}
              {filters.starRating.length > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <Star size={12} className="fill-yellow-600" />
                  {filters.starRating.join(', ')}
                </span>
              )}
              {filters.priceRange[1] < 5000 && (
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                  ≤ {filters.priceRange[1]} TND
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 text-xs font-medium underline"
              >
                {language === 'fr' ? 'Effacer' : language === 'ar' ? 'مسح' : 'Clear'}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-8 w-full min-w-0">
          {/* Guest Selector Modal */}
          {showGuestSelector && (
            <>
              <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                onClick={() => setShowGuestSelector(false)}
              />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61]">
                <GuestSelector
                  rooms={searchRooms}
                  setRooms={setSearchRooms}
                  roomsConfig={searchRoomsConfig}
                  setRoomsConfig={setSearchRoomsConfig}
                  showGuestSelector={showGuestSelector}
                  setShowGuestSelector={setShowGuestSelector}
                  onClose={() => setShowGuestSelector(false)}
                />
              </div>
            </>
          )}

          {/* Filter Modal Popup */}
          {showFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFilters(false)}>
              <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-primary-700 text-white px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <SlidersHorizontal size={20} />
                    {language === 'fr' ? 'Filtres' : language === 'ar' ? 'الفلاتر' : 'Filters'}
                  </h2>
                  <button 
                    onClick={() => setShowFilters(false)} 
                    className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <div className="space-y-6">
                    {/* Sort By */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <ArrowLeft size={18} className="text-blue-600" />
                        {language === 'fr' ? 'Trier par' : language === 'ar' ? 'ترتيب حسب' : 'Sort By'}
                      </h3>
                      <select
                        value={tempFilters.sortBy}
                        onChange={(e) => setTempFilters({...tempFilters, sortBy: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                      >
                        <option value="recommended">{language === 'fr' ? 'Recommandé' : language === 'ar' ? 'موصى به' : 'Recommended'}</option>
                        <option value="price-low">{language === 'fr' ? 'Prix croissant' : language === 'ar' ? 'السعر من الأقل للأعلى' : 'Price: Low to High'}</option>
                        <option value="price-high">{language === 'fr' ? 'Prix décroissant' : language === 'ar' ? 'السعر من الأعلى للأقل' : 'Price: High to Low'}</option>
                        <option value="rating">{language === 'fr' ? 'Étoiles' : language === 'ar' ? 'التقييم' : 'Star Rating'}</option>
                        <option value="name">{language === 'fr' ? 'Nom' : language === 'ar' ? 'الاسم' : 'Name'}</option>
                      </select>
                    </div>

                    {/* Star Rating */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <Star size={18} className="text-yellow-500 fill-yellow-500" />
                        {language === 'fr' ? 'Étoiles' : language === 'ar' ? 'النجوم' : 'Star Rating'}
                      </h3>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => (
                          <label key={rating} className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all border-2 ${
                            tempFilters.starRating.includes(rating) 
                              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-sm' 
                              : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                          }`}>
                            <input
                              type="checkbox"
                              checked={tempFilters.starRating.includes(rating)}
                              onChange={() => toggleStarRating(rating)}
                              className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
                            />
                            <div className="flex items-center gap-1 flex-1">
                              {[...Array(rating)].map((_, i) => (
                                <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                              ))}
                              {rating < 5 && [...Array(5 - rating)].map((_, i) => (
                                <Star key={`empty-${i}`} size={16} className="text-gray-300" />
                              ))}
                            </div>
                            {tempFilters.starRating.includes(rating) && (
                              <Check size={16} className="text-yellow-600" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <DollarSign size={18} className="text-green-600" />
                        {language === 'fr' ? 'Prix maximum' : language === 'ar' ? 'السعر الأقصى' : 'Max Price'}
                      </h3>
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="50"
                          value={tempFilters.priceRange[1]}
                          onChange={(e) => setTempFilters({...tempFilters, priceRange: [0, Number(e.target.value)]})}
                          className="w-full h-2 accent-primary-600 cursor-pointer"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{tempFilters.priceRange[0]} TND</span>
                          <span className="text-base font-bold text-primary-700">{tempFilters.priceRange[1]} TND</span>
                        </div>
                      </div>
                    </div>

                    {/* Boarding Types */}
                    {allBoardingTypes.length > 0 && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                          <Utensils size={18} className="text-orange-600" />
                          {language === 'fr' ? 'Pension' : language === 'ar' ? 'نظام الوجبات' : 'Meal Plan'}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {allBoardingTypes.map(boarding => (
                            <label key={boarding.code} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                              <input
                                type="checkbox"
                                checked={tempFilters.boardingTypes.includes(boarding.code)}
                                onChange={() => toggleBoardingType(boarding.code)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-gray-900">{boarding.code}</div>
                                <div className="text-xs text-gray-600">{boarding.name}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Themes */}
                    {allThemes.length > 0 && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                          <HotelIcon size={18} className="text-purple-600" />
                          {language === 'fr' ? 'Thèmes' : language === 'ar' ? 'المواضيع' : 'Themes'}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {allThemes.map(theme => (
                            <label key={theme} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                              <input
                                type="checkbox"
                                checked={tempFilters.themes.includes(theme)}
                                onChange={() => toggleTheme(theme)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                              />
                              <span className="text-xs text-gray-900">{theme}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-white flex items-center gap-3">
                  <button
                    onClick={clearTempFilters}
                    className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    {language === 'fr' ? 'Réinitialiser' : language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    {language === 'fr' ? 'Appliquer' : language === 'ar' ? 'تطبيق' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className={`flex-1 min-w-0 w-full ${isRTL ? 'order-1' : ''}`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={48} className="text-primary-700 animate-spin mb-4" />
                <p className="text-gray-600 text-lg">
                  {language === 'fr' ? 'Chargement des hôtels...' : language === 'ar' ? 'جاري تحميل الفنادق...' : 'Loading hotels...'}
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
                  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-900 mb-2">
                    {language === 'fr' ? 'Erreur' : language === 'ar' ? 'خطأ' : 'Error'}
                  </h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {language === 'fr' ? 'Retour à l\'accueil' : language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
                  </button>
                </div>
              </div>
            ) : filteredHotels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                  <HotelIcon size={48} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {language === 'fr' ? 'Aucun hôtel trouvé' : language === 'ar' ? 'لم يتم العثور على فنادق' : 'No hotels found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'fr' ? 'Essayez de modifier vos filtres ou votre recherche' : language === 'ar' ? 'حاول تعديل الفلاتر أو بحثك' : 'Try modifying your filters or search'}
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary-700 hover:bg-primary-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  {language === 'fr' ? 'Réinitialiser les filtres' : language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Clear Filters'}
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 md:space-y-6">
                  {filteredHotels.map((hotel, idx) => (
                    <div key={hotel.Id} data-hotel-index={idx}>
                      <HotelResultCard
                        hotel={hotel}
                        checkIn={searchCheckIn}
                        checkOut={searchCheckOut}
                        roomsConfig={searchRoomsConfig}
                      />
                    </div>
                  ))}
                </div>

                {/* Infinite-scroll sentinel + loading indicator */}
                <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-6">
                  {loadingMore && (
                    <>
                      <Loader2 size={22} className="text-primary-500 animate-spin" />
                      <p className="text-xs text-gray-400">
                        {language === 'fr' ? 'Chargement…' : language === 'ar' ? 'جاري التحميل…' : 'Loading…'}
                      </p>
                    </>
                  )}
                  {!hasMore && !loadingMore && hotels.length > 0 && (
                    <p className="text-xs text-gray-400">
                      {language === 'fr'
                        ? `${hotels.length} hôtel${hotels.length > 1 ? 's' : ''} disponible${hotels.length > 1 ? 's' : ''}`
                        : language === 'ar'
                        ? `${hotels.length} فندق متاح`
                        : `${hotels.length} hotel${hotels.length > 1 ? 's' : ''} available`}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotels;
