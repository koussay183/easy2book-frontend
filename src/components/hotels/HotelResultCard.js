import React from 'react';
import { MapPin, Star, ChevronRight, Wifi, Car, Utensils, Waves, Coffee, Wind, Dumbbell, Droplets, Users, Phone, Palmtree, Baby, Heart, TreePine, PartyPopper, Briefcase, Home, Sparkles, TrendingUp, Tag, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const HotelResultCard = ({ hotel, checkIn, checkOut, roomsConfig }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  const numberOfNights = calculateNights();

  const renderStars = (count) => {
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
    ));
  };

  const getFacilityIcon = (facilityName) => {
    const name = facilityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <Wifi size={14} />;
    if (name.includes('parking') || name.includes('car')) return <Car size={14} />;
    if (name.includes('restaurant') || name.includes('dining')) return <Utensils size={14} />;
    if (name.includes('pool') || name.includes('swimming')) return <Waves size={14} />;
    if (name.includes('breakfast') || name.includes('coffee')) return <Coffee size={14} />;
    if (name.includes('ac') || name.includes('air') || name.includes('conditioning')) return <Wind size={14} />;
    if (name.includes('gym') || name.includes('fitness')) return <Dumbbell size={14} />;
    if (name.includes('spa') || name.includes('wellness')) return <Droplets size={14} />;
    if (name.includes('room') || name.includes('service')) return <Users size={14} />;
    return null;
  };

  const getThemeIcon = (themeName) => {
    const name = themeName.toLowerCase();
    if (name.includes('beach') || name.includes('plage')) return <Palmtree size={14} />;
    if (name.includes('family') || name.includes('famille') || name.includes('kids')) return <Baby size={14} />;
    if (name.includes('romantic') || name.includes('honeymoon') || name.includes('couple')) return <Heart size={14} />;
    if (name.includes('nature') || name.includes('mountain')) return <TreePine size={14} />;
    if (name.includes('party') || name.includes('nightlife')) return <PartyPopper size={14} />;
    if (name.includes('business') || name.includes('work')) return <Briefcase size={14} />;
    if (name.includes('relax') || name.includes('quiet')) return <Home size={14} />;
    return null;
  };

  // Extract pricing information from SearchData
  const getMinimumPrice = () => {
    if (!hotel.SearchData?.Price?.Boarding) return null;
    
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
    
    return minPrice !== Infinity ? minPrice : null;
  };

  // Get available boarding options
  const getBoardingOptions = () => {
    if (!hotel.SearchData?.Price?.Boarding) return [];
    return hotel.SearchData.Price.Boarding.map(b => ({
      id: b.Id,
      code: b.Code,
      name: b.Name
    }));
  };

  // Get currency
  const getCurrency = () => {
    return hotel.SearchData?.Currency || 'TND';
  };

  const minimumPrice = getMinimumPrice();
  const boardingOptions = getBoardingOptions();
  const currency = getCurrency();

  // Check if this is a new or special hotel
  const isNewHotel = hotel.IsNew || false;
  const isTopSale = hotel.IsTopSale || false;
  const hasPromo = hotel.HasPromo || minimumPrice && minimumPrice < 2000;

  const totalPrice = minimumPrice * numberOfNights;

  const handleViewDetails = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (roomsConfig && roomsConfig.length > 0) {
      params.set('roomsConfig', encodeURIComponent(JSON.stringify(roomsConfig)));
    } else {
      // Fallback to default
      params.set('roomsConfig', encodeURIComponent(JSON.stringify([{ adults: 2, children: [] }])));
    }
    navigate(`/hotel/${hotel.Id}?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 mb-6 group">
      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="lg:w-[300px] h-[240px] lg:h-auto overflow-hidden relative flex-shrink-0">
          <img
            src={hotel.Image || 'https://via.placeholder.com/400x300?text=Hotel'}
            alt={hotel.Name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Hotel';
            }}
          />
          
          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hotel.Category && (
              <span className="bg-gradient-to-r from-primary-700 to-primary-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                <Sparkles size={14} />
                {hotel.Category.Name || 'Luxe'}
              </span>
            )}
            {isTopSale && (
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <TrendingUp size={14} />
                **TOP VENTES
              </span>
            )}
            {hasPromo && (
              <span className="bg-gradient-to-r from-red-500 via-red-600 to-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-lg animate-pulse">
                <Tag size={14} className="animate-bounce" />
                PROMO
              </span>
            )}
          </div>

          {/* Free Cancellation Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/95 backdrop-blur-sm text-primary-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-primary-200">
              ✓ {language === 'fr' ? 'Annulation gratuite' : language === 'ar' ? 'إلغاء مجاني' : 'Free Cancellation'}
            </span>
          </div>

          {/* Price Overlay - Mobile Only */}
          {minimumPrice && (
            <div className="lg:hidden absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border-2 border-primary-200">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary-700">
                  {totalPrice.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-primary-600">
                  {currency}
                </span>
              </div>
              <p className="text-[10px] text-gray-600 font-medium">
                {numberOfNights} {language === 'fr' ? (numberOfNights > 1 ? 'nuits' : 'nuit') : language === 'ar' ? 'ليالي' : (numberOfNights > 1 ? 'nights' : 'night')}
              </p>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Header Section */}
          <div className="p-4 pb-3 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 hover:text-primary-700 transition-colors leading-tight flex-1">
                {hotel.Name}
              </h3>
              {hotel.Category && (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {renderStars(hotel.Category.Star)}
                </div>
              )}
            </div>

            {/* Location */}
            {hotel.City && (
              <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin size={14} className="text-primary-600 flex-shrink-0" />
                <span className="text-sm">
                  {hotel.Adress ? `${hotel.Adress}, ` : ''}{hotel.City.Name}, {hotel.City.Country?.Name}
                </span>
              </div>
            )}
          </div>

          {/* Main Content Section */}
          <div className="p-4 flex-1 space-y-3">
            {/* Themes */}
            {hotel.SearchData?.Themes && hotel.SearchData.Themes.length > 0 && (
              <div>
                <h4 className={`text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'fr' ? 'Thèmes' : language === 'ar' ? 'المواضيع' : 'Themes'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {hotel.SearchData.Themes.slice(0, 4).map((theme, index) => {
                    const themeName = theme.Name || theme;
                    const icon = getThemeIcon(themeName);
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors"
                      >
                        {icon && <span className="text-primary-600">{icon}</span>}
                        {themeName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Boarding Options */}
            {boardingOptions.length > 0 && (
              <div>
                <h4 className={`text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5 ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}`}>
                  <Utensils size={12} />
                  {language === 'fr' ? 'Formules repas' : language === 'ar' ? 'أنظمة الوجبات' : 'Meal Plans'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {boardingOptions.map(option => (
                    <div
                      key={option.id}
                      className="inline-flex items-start gap-2 px-2.5 py-1.5 bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-800 text-xs font-bold rounded-lg border-2 border-primary-200 hover:border-primary-300 transition-all"
                    >
                      <div className="flex flex-col leading-tight">
                        <span className="text-primary-900 font-extrabold">{option.code}</span>
                        {option.name && <span className="text-[10px] text-primary-700 font-medium">{option.name}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {hotel.SearchData?.Facilities && hotel.SearchData.Facilities.length > 0 && (
              <div>
                <h4 className={`text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'fr' ? 'Équipements' : language === 'ar' ? 'المرافق' : 'Facilities'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {hotel.SearchData.Facilities.slice(0, 8).map((facility, index) => {
                    const icon = getFacilityIcon(facility.Title || facility);
                    const facilityName = facility.Title || facility;
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all"
                      >
                        {icon && <span className="text-primary-600">{icon}</span>}
                        {facilityName}
                      </span>
                    );
                  })}
                  {hotel.SearchData.Facilities.length > 8 && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300">
                      +{hotel.SearchData.Facilities.length - 8}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-t-2 border-gray-100 mt-auto">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
              {/* CTA Button */}
              <div className="flex-1 lg:order-1">
                <button
                  onClick={handleViewDetails}
                  className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  <span>{language === 'fr' ? 'VOIR CHAMBRES & TARIFS' : language === 'ar' ? 'عرض الغرف والأسعار' : 'VIEW ROOMS & RATES'}</span>
                  <ChevronRight size={18} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>

              {/* Price Section - Desktop Only */}
              {minimumPrice && (
                <div className="hidden lg:block lg:order-2">
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 px-5 py-4 rounded-xl border-2 border-primary-200 text-center min-w-[140px]">
                    <p className="text-xs text-gray-500 line-through mb-1">
                      {(totalPrice * 1.2).toFixed(2)} {currency}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-primary-700">
                        {totalPrice.toFixed(2)}
                      </span>
                      <span className="text-base font-bold text-primary-600">
                        {currency}
                      </span>
                    </div>
                    <p className="text-xs text-primary-700 font-semibold mt-1">
                      {language === 'fr' 
                        ? `${numberOfNights} ${numberOfNights === 1 ? 'nuit' : 'nuits'}` 
                        : language === 'ar' 
                        ? `${numberOfNights} ${numberOfNights === 1 ? 'ليلة' : 'ليالي'}`
                        : `${numberOfNights} ${numberOfNights === 1 ? 'night' : 'nights'}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelResultCard;
