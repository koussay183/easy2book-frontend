import React, { useState, useRef, useEffect } from 'react';
import { Hotel, Plane, Mountain, Sparkles, MapPin, Calendar, Search, Car, Train } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GuestSelector from './GuestSelector';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../locales/translations';

// City data
const cities = [
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

const SearchBox = ({
  activeTab,
  setActiveTab,
  rooms,
  setRooms,
  roomsConfig,
  setRoomsConfig,
  showGuestSelector,
  setShowGuestSelector
}) => {
  const { language } = useLanguage();
  const t = translations[language].search;
  const isRTL = language === 'ar';
  const navigate = useNavigate();

  // Destination state and suggestions
  const [destination, setDestination] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const destinationRef = useRef(null);

  // Date states
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  // Omra category state
  const [selectedOmraCategory, setSelectedOmraCategory] = useState('');

  // Filter cities based on input
  useEffect(() => {
    if (destination.trim().length > 0) {
      const filtered = cities.filter(city => 
        city.name.toLowerCase().includes(destination.toLowerCase()) ||
        city.region.toLowerCase().includes(destination.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      // Show all cities when input is empty
      setFilteredCities(cities);
    }
  }, [destination]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city) => {
    setDestination(city.name);
    setSelectedCity(city);
    setShowSuggestions(false);
  };
  
  const handleSearch = () => {
    if (!selectedCity) {
      alert(language === 'fr' ? 'Veuillez sélectionner une destination' : language === 'ar' ? 'الرجاء اختيار وجهة' : 'Please select a destination');
      return;
    }
    if (!checkInDate || !checkOutDate) {
      alert(language === 'fr' ? 'Veuillez sélectionner les dates' : language === 'ar' ? 'الرجاء اختيار التواريخ' : 'Please select dates');
      return;
    }
    const searchParams = new URLSearchParams({
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      rooms: rooms,
      roomsConfig: JSON.stringify(roomsConfig)
    });
    navigate(`/hotels?${searchParams.toString()}`);
  };
  
  const services = [
    { id: 'hotels', icon: Hotel },
    { id: 'flights', icon: Plane },
    { id: 'omra', icon: Mountain },
    { id: 'trains', icon: Train },
    { id: 'cars', icon: Car },
    { 
      id: 'houses', 
      icon: ({ size, className }) => (
        <svg className={className} width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    { id: 'attractions', icon: Sparkles },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-visible border border-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Service Tabs */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 rounded-t-2xl">
        <div className="px-6 md:px-8 py-5">
          <div className="flex flex-wrap gap-2.5 justify-center">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveTab(service.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium text-sm whitespace-nowrap ${
                    activeTab === service.id
                      ? 'bg-primary-700 text-white shadow-md scale-[1.02]'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  <IconComponent size={18} className="flex-shrink-0" />
                  <span>{t.services[service.id]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="px-6 md:px-8 py-6 overflow-visible">
        {activeTab === 'hotels' ? (
          <>
            <div className="space-y-5">
              {/* Destination - Full Width on its own line */}
              <div className="w-full" ref={destinationRef}>
                <label className={`block text-xs font-bold text-gray-700 mb-2.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.destination}
                </label>
                <div className="relative">
                  <MapPin size={20} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10`} />
                  <input 
                    type="text" 
                    placeholder={t.destinationPlaceholder}
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100 transition-all bg-white hover:border-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && filteredCities.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredCities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className={`w-full ${isRTL ? 'text-right pr-4 pl-4' : 'text-left pl-4 pr-4'} py-3 hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0 flex flex-col gap-1`}
                        >
                          <span className="font-medium text-gray-900 text-sm">{city.name}</span>
                          <span className="text-xs text-gray-500">
                            {city.region && city.region !== '' ? `${city.region}, ` : ''}{city.country}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dates Row */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Check-in Date */}
                <div className="w-full md:flex-1">
                  <label className={`block text-xs font-bold text-gray-700 mb-2.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t.checkIn}
                  </label>
                  <div className="relative">
                    <Calendar size={20} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} />
                    <input 
                      type="date" 
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100 transition-all bg-white hover:border-gray-400`}
                    />
                  </div>
                </div>

                {/* Check-out Date */}
                <div className="w-full md:flex-1">
                  <label className={`block text-xs font-bold text-gray-700 mb-2.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t.checkOut}
                  </label>
                  <div className="relative">
                    <Calendar size={20} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} />
                    <input 
                      type="date" 
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100 transition-all bg-white hover:border-gray-400`}
                    />
                  </div>
                </div>
              </div>

              {/* Guest Selector - Full Width */}
              <div className="w-full">
                <GuestSelector
                  rooms={rooms}
                  setRooms={setRooms}
                  roomsConfig={roomsConfig}
                  setRoomsConfig={setRoomsConfig}
                  showGuestSelector={showGuestSelector}
                  setShowGuestSelector={setShowGuestSelector}
                />
              </div>

              {/* Search Button - Full Width */}
              <div className="w-full pt-2">
                <button
                  onClick={handleSearch}
                  className="w-full bg-primary-700 hover:bg-primary-800 active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5"
                >
                  <Search size={20} />
                  <span>{t.searchButton}</span>
                </button>
              </div>
            </div>
          </>
        ) : activeTab === 'omra' ? (
          <div className="space-y-6 py-2">
            {/* Omra Header */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mountain size={24} className="text-primary-600" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'fr' ? 'Omra & Hajj' : language === 'ar' ? 'عمرة وحج' : 'Omra & Hajj'}
                </h3>
                <p className="text-sm text-gray-500">
                  {language === 'fr' ? 'Forfaits complets depuis la Tunisie' : language === 'ar' ? 'باقات متكاملة من تونس' : 'Complete packages from Tunisia'}
                </p>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className={`block text-xs font-bold text-gray-700 mb-2.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'fr' ? 'Type de voyage' : language === 'ar' ? 'نوع الرحلة' : 'Trip type'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'umrah', label: language === 'fr' ? 'Omra' : language === 'ar' ? 'عمرة' : 'Umrah', desc: language === 'fr' ? 'Toute l\'année' : language === 'ar' ? 'طوال العام' : 'Year-round' },
                  { id: 'hajj', label: language === 'fr' ? 'Hajj' : language === 'ar' ? 'حج' : 'Hajj', desc: language === 'fr' ? 'Saison annuelle' : language === 'ar' ? 'موسم سنوي' : 'Annual season' },
                  { id: 'umrah_plus', label: language === 'fr' ? 'Omra Plus' : language === 'ar' ? 'عمرة بلس' : 'Umrah Plus', desc: language === 'fr' ? 'Premium 5★' : language === 'ar' ? 'فاخر 5★' : 'Premium 5★' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedOmraCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-4 rounded-xl border-2 transition-all text-center ${
                      selectedOmraCategory === cat.id
                        ? 'border-primary-600 bg-primary-50 text-primary-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50/50'
                    }`}
                  >
                    <span className="font-bold text-sm">{cat.label}</span>
                    <span className="text-xs text-gray-400">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Features list */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  language === 'fr' ? '✓ Vols inclus' : language === 'ar' ? '✓ الطيران مشمول' : '✓ Flights included',
                  language === 'fr' ? '✓ Hôtels 4★ & 5★' : language === 'ar' ? '✓ فنادق 4★ و5★' : '✓ 4★ & 5★ Hotels',
                  language === 'fr' ? '✓ Guide accompagnateur' : language === 'ar' ? '✓ مرشد مرافق' : '✓ Guided groups'
                ].map((feature, i) => (
                  <span key={i} className="text-sm text-primary-700 font-medium text-center">{feature}</span>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <button
                onClick={() => navigate(selectedOmraCategory ? `/omra?category=${selectedOmraCategory}` : '/omra')}
                className="w-full bg-primary-700 hover:bg-primary-800 active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5"
              >
                <Mountain size={20} />
                <span>{language === 'fr' ? 'Voir les offres disponibles' : language === 'ar' ? 'عرض العروض المتاحة' : 'View available offers'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-full mb-6 shadow-lg">
              <Sparkles size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.comingSoon}</h3>
            <p className="text-gray-600">{t.comingSoonText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
