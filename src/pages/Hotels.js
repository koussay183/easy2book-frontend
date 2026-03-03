 import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, ArrowLeft, Loader2, AlertCircle, Hotel as HotelIcon, Search, SlidersHorizontal, Star, DollarSign, Utensils, X, Check, Moon, Plus, Minus } from 'lucide-react';
import HotelResultCard from '../components/hotels/HotelResultCard';
import GuestSelector from '../components/landing/GuestSelector';
import { useLanguage } from '../context/LanguageContext';
import { useHotels } from '../context/HotelsContext';

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { hotels, loading, error, fetchHotels } = useHotels();
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

  // Filter state (applied filters)
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    starRating: [],
    sortBy: 'price-low',
    facilities: [],
    themes: [],
    boardingTypes: []
  });

  // Temporary filter state (for modal)
  const [tempFilters, setTempFilters] = useState({
    priceRange: [0, 5000],
    starRating: [],
    sortBy: 'price-low',
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

  const handleSearch = () => {
    // Compute checkout date
    let computedCheckOut = searchCheckOut;
    if (dateMode === 'nights' && searchCheckIn && searchNights > 0) {
      const d = new Date(searchCheckIn);
      d.setDate(d.getDate() + searchNights);
      computedCheckOut = d.toISOString().split('T')[0];
    }

    // Update URL (also triggers useEffect as a backup)
    const params = new URLSearchParams();
    if (cityId) params.set('cityId', cityId);
    if (searchCityName) params.set('cityName', searchCityName);
    if (searchCheckIn) params.set('checkIn', searchCheckIn);
    if (computedCheckOut) params.set('checkOut', computedCheckOut);
    params.set('rooms', searchRooms.toString());
    params.set('roomsConfig', JSON.stringify(searchRoomsConfig));
    setSearchParams(params);

    // Directly trigger fetch so results refresh immediately
    if (cityId) {
      fetchHotels({
        cityId,
        cityName: searchCityName,
        checkIn: searchCheckIn,
        checkOut: computedCheckOut,
        rooms: searchRooms,
        roomsConfig: searchRoomsConfig
      });
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
      sortBy: 'price-low',
      facilities: [],
      themes: [],
      boardingTypes: []
    });
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: [0, 5000],
      starRating: [],
      sortBy: 'price-low',
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

      {/* ── Redesigned Sticky Header ── */}
      <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">

          {/* Top row: back + city badge + hotel count */}
          <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-1.5 text-gray-600 hover:text-primary-700 transition-colors flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
              <span className="text-sm font-medium hidden sm:inline">
                {language === 'fr' ? 'Retour' : language === 'ar' ? 'رجوع' : 'Back'}
              </span>
            </button>

            {/* City badge */}
            {searchCityName && (
              <div className={`flex items-center gap-1.5 bg-primary-50 border border-primary-200 rounded-xl px-3 py-1.5 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin size={14} className="text-primary-600 flex-shrink-0" />
                <span className="font-semibold text-primary-700 text-sm truncate">{searchCityName}</span>
              </div>
            )}

            <div className="flex-1" />

            {/* Hotel count */}
            {!loading && !error && (
              <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl flex-shrink-0">
                <HotelIcon size={14} className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {filteredHotels.length} {language === 'fr' ? 'hôtels' : language === 'ar' ? 'فنادق' : 'hotels'}
                </span>
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <Loader2 size={14} className="text-primary-600 animate-spin" />
                <span className="text-sm text-gray-500">
                  {language === 'fr' ? 'Chargement…' : language === 'ar' ? 'جارٍ التحميل…' : 'Loading…'}
                </span>
              </div>
            )}
          </div>

          {/* Bottom row: search fields */}
          <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>

            {/* Check-in */}
            <div className="relative flex-shrink-0">
              <Calendar size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="date"
                value={searchCheckIn}
                onChange={(e) => setSearchCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`border border-gray-200 rounded-xl py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600 w-[140px] ${isRTL ? 'pr-9 pl-2' : 'pl-9 pr-2'}`}
              />
            </div>

            {/* Date mode toggle */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
              <button
                type="button"
                onClick={() => setDateMode('checkout')}
                className={`flex items-center gap-1 px-3 py-2.5 text-xs font-semibold transition-all ${dateMode === 'checkout' ? 'bg-primary-700 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Calendar size={13} />
                <span className="hidden sm:inline">{language === 'fr' ? 'Départ' : language === 'ar' ? 'المغادرة' : 'Out'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDateMode('nights')}
                className={`flex items-center gap-1 px-3 py-2.5 text-xs font-semibold transition-all border-l border-gray-200 ${dateMode === 'nights' ? 'bg-primary-700 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Moon size={13} />
                <span className="hidden sm:inline">{language === 'fr' ? 'Nuits' : language === 'ar' ? 'ليالي' : 'Nights'}</span>
              </button>
            </div>

            {/* Check-out date OR nights counter */}
            {dateMode === 'checkout' ? (
              <div className="relative flex-shrink-0">
                <Calendar size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="date"
                  value={searchCheckOut}
                  onChange={(e) => setSearchCheckOut(e.target.value)}
                  min={searchCheckIn || new Date().toISOString().split('T')[0]}
                  className={`border border-gray-200 rounded-xl py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600 w-[140px] ${isRTL ? 'pr-9 pl-2' : 'pl-9 pr-2'}`}
                />
              </div>
            ) : (
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-[38px] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchNights(n => Math.max(1, n - 1))}
                  className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors border-r border-gray-200"
                >
                  <Minus size={14} />
                </button>
                <div className="px-3 flex items-center gap-1">
                  <span className="text-sm font-bold text-primary-700">{searchNights}</span>
                  <span className="text-xs text-gray-500">
                    {language === 'fr' ? (searchNights === 1 ? 'nuit' : 'nuits') : language === 'ar' ? (searchNights === 1 ? 'ليلة' : 'ليالي') : (searchNights === 1 ? 'night' : 'nights')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchNights(n => Math.min(30, n + 1))}
                  className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors border-l border-gray-200"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            {/* Guests */}
            <button
              onClick={() => setShowGuestSelector(true)}
              className={`flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-700 font-medium transition-colors whitespace-nowrap flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Users size={14} className="text-gray-500 flex-shrink-0" />
              <span>
                {searchRooms} {language === 'fr' ? 'ch.' : language === 'ar' ? 'غ' : 'rm'}{' '}
                · {searchRoomsConfig.reduce((s, r) => s + r.adults, 0)} {language === 'fr' ? 'ad.' : language === 'ar' ? 'بالغ' : 'ad.'}
                {searchRoomsConfig.reduce((s, r) => s + r.children.length, 0) > 0 && (
                  <> · {searchRoomsConfig.reduce((s, r) => s + r.children.length, 0)} {language === 'fr' ? 'enf.' : language === 'ar' ? 'أطفال' : 'ch.'}</>
                )}
              </span>
            </button>

            {/* Search */}
            <button
              onClick={handleSearch}
              className="bg-primary-700 hover:bg-primary-800 active:scale-95 text-white rounded-xl py-2.5 px-4 font-semibold text-sm transition-all flex items-center gap-2 flex-shrink-0 shadow-sm"
            >
              <Search size={15} />
              <span className="hidden sm:inline">
                {language === 'fr' ? 'Rechercher' : language === 'ar' ? 'بحث' : 'Search'}
              </span>
            </button>

            {/* Filters */}
            <button
              onClick={openFilterModal}
              className={`relative flex items-center gap-2 border rounded-xl py-2.5 px-4 font-semibold text-sm transition-colors flex-shrink-0 ${
                (filters.starRating.length > 0 || filters.boardingTypes.length > 0 || filters.themes.length > 0 || filters.priceRange[1] < 5000)
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">
                {language === 'fr' ? 'Filtres' : language === 'ar' ? 'فلاتر' : 'Filters'}
              </span>
              {(filters.starRating.length > 0 || filters.boardingTypes.length > 0 || filters.themes.length > 0 || filters.priceRange[1] < 5000) && (
                <span className="bg-primary-700 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {filters.starRating.length + filters.boardingTypes.length + filters.themes.length + (filters.priceRange[1] < 5000 ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Active Filters Summary */}
        {(filters.starRating.length > 0 || filters.boardingTypes.length > 0 || filters.themes.length > 0 || filters.priceRange[1] < 5000 || filters.sortBy !== 'price-low') && (
          <div className="mb-6 flex items-center justify-between bg-white rounded-xl shadow-md p-4">
            <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              {filters.sortBy !== 'price-low' && (
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

        <div className="flex gap-8">
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
          <div className={`flex-1 ${isRTL ? 'order-1' : ''}`}>
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
                <div className="space-y-6">
                  {filteredHotels.map((hotel) => (
                    <HotelResultCard 
                      key={hotel.Id} 
                      hotel={hotel} 
                      checkIn={searchCheckIn} 
                      checkOut={searchCheckOut}
                      roomsConfig={searchRoomsConfig}
                    />
                  ))}
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
