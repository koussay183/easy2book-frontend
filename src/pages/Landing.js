import React, { useState, useEffect } from 'react';
import { Hotel, Mountain, ArrowLeft, ArrowRight, Shield, Clock, Star, MapPin, Zap, TrendingUp, Award, DollarSign, Users, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBox from '../components/landing/SearchBox';
import HotelCard from '../components/landing/HotelCard';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';
import { API_ENDPOINTS } from '../config/api';

const Landing = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';

  const [activeTab, setActiveTab] = useState('hotels');
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [roomsConfig, setRoomsConfig] = useState([{ adults: 2, children: [] }]);

  // Hotel collection states
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const [mostBookedHotels, setMostBookedHotels] = useState([]);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [budgetHotels, setBudgetHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  // Omra offers state
  const [omraOffers, setOmraOffers] = useState([]);
  const [loadingOmra, setLoadingOmra] = useState(true);

  // Fetch hotel collections
  useEffect(() => {
    const fetchHotelCollections = async () => {
      setLoadingHotels(true);
      try {
        const [nearby, mostBooked, featured, budget] = await Promise.all([
          fetch(API_ENDPOINTS.MYGO_HOTELS_NEARBY).then(res => res.json()),
          fetch(API_ENDPOINTS.MYGO_HOTELS_MOST_BOOKED).then(res => res.json()),
          fetch(API_ENDPOINTS.MYGO_HOTELS_FEATURED).then(res => res.json()),
          fetch(API_ENDPOINTS.MYGO_HOTELS_BUDGET).then(res => res.json())
        ]);

        if (nearby.status === 'success' && nearby.data?.ListHotel) {
          setNearbyHotels(nearby.data.ListHotel || []);
        }
        if (mostBooked.status === 'success' && mostBooked.data?.ListHotel) {
          setMostBookedHotels(mostBooked.data.ListHotel || []);
        }
        if (featured.status === 'success' && featured.data?.ListHotel) {
          setFeaturedHotels(featured.data.ListHotel || []);
        }
        if (budget.status === 'success' && budget.data?.ListHotel) {
          setBudgetHotels(budget.data.ListHotel || []);
        }
      } catch (error) {
        console.error('Error fetching hotel collections:', error);
      } finally {
        setLoadingHotels(false);
      }
    };

    fetchHotelCollections();
  }, []);

  // Fetch latest Omra offers
  useEffect(() => {
    const fetchOmraOffers = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.OMRA_OFFERS);
        const data = await res.json();
        if (data.status === 'success') {
          setOmraOffers(data.data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingOmra(false);
      }
    };
    fetchOmraOffers();
  }, []);

  // Helper to render hotel card from API data
  const renderHotelCard = (hotel) => {
    const location = hotel.City?.Name
      ? `${hotel.City.Name}, ${hotel.City.Country?.Name || 'Tunisie'}`
      : hotel.Adress || 'Tunisia';

    return (
      <HotelCard
        key={hotel.Id}
        id={hotel.Id}
        image={hotel.Image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
        name={hotel.Name}
        location={location}
        rating={hotel.Category?.Star || 0}
        reviewCount={hotel.bookingCount || 0}
        price={hotel.minPrice || 0}
      />
    );
  };

  // Shared loading skeleton
  const HotelSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );

  // Shared section header component
  const SectionHeader = ({ icon: Icon, title, subtitle, linkTo, showLink }) => (
    <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon size={22} className="text-primary-600" />
        </div>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      {showLink && (
        <Link
          to={linkTo}
          className={`text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <span>{language === 'fr' ? 'Voir tout' : language === 'ar' ? 'عرض الكل' : 'View All'}</span>
          <ArrowLeft size={15} className={isRTL ? 'rotate-180' : ''} />
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative min-h-[620px] lg:min-h-[720px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-12 relative z-10 w-full pt-24 pb-8 lg:pt-28 lg:pb-16">
          {/* Mobile */}
          <div className="lg:hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-white bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
                <Shield size={14} className="text-secondary-400" />
                <span className="text-xs font-medium">{language === 'fr' ? 'Paiement sécurisé' : language === 'ar' ? 'دفع آمن' : 'Secure Payment'}</span>
              </div>
              <div className="flex items-center gap-2 text-white bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
                <Clock size={14} className="text-secondary-400" />
                <span className="text-xs font-medium">{language === 'fr' ? 'Support 24/7' : language === 'ar' ? 'دعم 24/7' : 'Support 24/7'}</span>
              </div>
            </div>
            <div className="text-center mb-7">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                {t.hero.title} <span className="text-secondary-400">{t.hero.titleHighlight}</span>
              </h1>
              <p className="text-sm md:text-base text-white/80 px-4">{t.hero.subtitle}</p>
            </div>
            <SearchBox
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              rooms={rooms}
              setRooms={setRooms}
              roomsConfig={roomsConfig}
              setRoomsConfig={setRoomsConfig}
              showGuestSelector={showGuestSelector}
              setShowGuestSelector={setShowGuestSelector}
            />
          </div>

          {/* Desktop */}
          <div className="hidden lg:block w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="text-center mb-8">
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-3 capitalize">
                {t.hero.title} <span className="text-secondary-400 capitalize">{t.hero.titleHighlight}</span>
              </h1>
              <p className="text-base xl:text-lg text-white/80 mb-6">{t.hero.subtitle}</p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-white bg-white/15 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                  <Shield size={15} className="text-secondary-400" />
                  <span className="text-xs font-medium">{t.hero.trustBadge1}</span>
                </div>
                <div className="flex items-center gap-2 text-white bg-white/15 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                  <Clock size={15} className="text-secondary-400" />
                  <span className="text-xs font-medium">{t.hero.trustBadge2}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mb-2">
                <div className="flex items-center gap-2 text-white/80">
                  <Hotel size={16} className="text-secondary-400" />
                  <span className="text-sm">{t.hero.feature1}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Star size={16} className="text-secondary-400" />
                  <span className="text-sm">{t.hero.feature2}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Zap size={16} className="text-secondary-400" />
                  <span className="text-sm">{t.hero.feature3}</span>
                </div>
              </div>
            </div>

            <SearchBox
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              rooms={rooms}
              setRooms={setRooms}
              roomsConfig={roomsConfig}
              setRoomsConfig={setRoomsConfig}
              showGuestSelector={showGuestSelector}
              setShowGuestSelector={setShowGuestSelector}
            />
          </div>
        </div>
      </section>

      {/* ── Nearby Hotels ── */}
      {(loadingHotels || nearbyHotels.length > 0) && (
        <section className="py-8 md:py-12 px-4 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="container mx-auto max-w-6xl">
            <SectionHeader
              icon={MapPin}
              title={language === 'fr' ? 'Hôtels à proximité' : language === 'ar' ? 'فنادق قريبة منك' : 'Nearby Hotels'}
              subtitle={language === 'fr' ? 'Basé sur votre localisation' : language === 'ar' ? 'بناءً على موقعك' : 'Based on your location'}
              linkTo="/hotels"
              showLink={!loadingHotels}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loadingHotels
                ? [...Array(4)].map((_, i) => <HotelSkeleton key={i} />)
                : nearbyHotels.slice(0, 4).map(renderHotelCard)
              }
            </div>
          </div>
        </section>
      )}

      {/* ── Most Booked ── */}
      {(loadingHotels || mostBookedHotels.length > 0) && (
        <section className="py-8 md:py-12 px-4 bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="container mx-auto max-w-6xl">
            <SectionHeader
              icon={TrendingUp}
              title={language === 'fr' ? 'Les plus réservés' : language === 'ar' ? 'الأكثر حجزاً' : 'Most Booked'}
              subtitle={language === 'fr' ? 'Choix populaires des voyageurs' : language === 'ar' ? 'الخيارات الشائعة للمسافرين' : 'Popular traveler choices'}
              linkTo="/hotels"
              showLink={!loadingHotels}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loadingHotels
                ? [...Array(4)].map((_, i) => <HotelSkeleton key={i} />)
                : mostBookedHotels.slice(0, 4).map(renderHotelCard)
              }
            </div>
          </div>
        </section>
      )}

      {/* ── Luxury Hotels ── */}
      {(loadingHotels || featuredHotels.length > 0) && (
        <section className="py-8 md:py-12 px-4 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="container mx-auto max-w-6xl">
            <SectionHeader
              icon={Award}
              title={language === 'fr' ? 'Hôtels de luxe' : language === 'ar' ? 'فنادق فاخرة' : 'Luxury Hotels'}
              subtitle={language === 'fr' ? 'Hôtels 4 et 5 étoiles premium' : language === 'ar' ? 'فنادق 4 و 5 نجوم فاخرة' : 'Premium 4 & 5 star hotels'}
              linkTo="/hotels"
              showLink={!loadingHotels}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loadingHotels
                ? [...Array(4)].map((_, i) => <HotelSkeleton key={i} />)
                : featuredHotels.slice(0, 4).map(renderHotelCard)
              }
            </div>
          </div>
        </section>
      )}

      {/* ── Budget Hotels ── */}
      {(loadingHotels || budgetHotels.length > 0) && (
        <section className="py-8 md:py-12 px-4 bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="container mx-auto max-w-6xl">
            <SectionHeader
              icon={DollarSign}
              title={language === 'fr' ? 'Hôtels économiques' : language === 'ar' ? 'فنادق اقتصادية' : 'Budget Hotels'}
              subtitle={language === 'fr' ? 'Options confortables et abordables' : language === 'ar' ? 'خيارات مريحة وبأسعار معقولة' : 'Comfortable & affordable options'}
              linkTo="/hotels"
              showLink={!loadingHotels}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loadingHotels
                ? [...Array(4)].map((_, i) => <HotelSkeleton key={i} />)
                : budgetHotels.slice(0, 4).map(renderHotelCard)
              }
            </div>
          </div>
        </section>
      )}

      {/* ── Omra & Hajj ── */}
      <section className="py-8 md:py-12 px-4 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto max-w-6xl">
          <SectionHeader
            icon={Mountain}
            title={language === 'fr' ? 'Omra & Hajj' : language === 'ar' ? 'عمرة وحج' : 'Omra & Hajj'}
            subtitle={language === 'fr' ? 'Forfaits spirituels depuis la Tunisie' : language === 'ar' ? 'باقات روحية من تونس' : 'Spiritual packages from Tunisia'}
            linkTo="/omra"
            showLink={true}
          />

          {loadingOmra ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => <HotelSkeleton key={i} />)}
            </div>
          ) : omraOffers.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
              <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mountain size={26} className="text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {language === 'fr' ? 'Offres à venir' : language === 'ar' ? 'عروض قادمة' : 'Upcoming offers'}
              </h3>
              <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
                {language === 'fr'
                  ? 'Nos prochains forfaits Omra et Hajj seront bientôt disponibles.'
                  : language === 'ar'
                  ? 'ستكون باقات العمرة والحج القادمة متاحة قريباً.'
                  : 'Our upcoming Omra and Hajj packages will be available soon.'}
              </p>
              <Link
                to="/omra"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                {language === 'fr' ? 'En savoir plus' : language === 'ar' ? 'اعرف أكثر' : 'Learn more'}
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {omraOffers.slice(0, 3).map((offer) => {
                const spotsLeft = offer.availableSpots ?? offer.capacity;
                const isFull = spotsLeft === 0;
                const catColors = {
                  umrah: 'bg-primary-50 text-primary-700',
                  hajj: 'bg-secondary-100 text-secondary-700',
                  umrah_plus: 'bg-accent-50 text-accent-700'
                };
                const catLabels = { umrah: 'Omra', hajj: 'Hajj', umrah_plus: 'Omra Plus' };
                return (
                  <Link
                    key={offer._id}
                    to={`/omra/${offer._id}/book`}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={offer.imageUrl || 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=400&q=70'}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=400&q=70'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className={`absolute top-2 left-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${catColors[offer.category] || 'bg-gray-100 text-gray-600'}`}>
                        {catLabels[offer.category] || offer.category}
                      </span>
                      {isFull && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {language === 'fr' ? 'Complet' : language === 'ar' ? 'مكتمل' : 'Full'}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h4 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">{offer.title}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Calendar size={11} className="text-primary-500 flex-shrink-0" />
                        <span>{new Date(offer.departureDate).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs mb-3">
                        <Users size={11} className={spotsLeft <= 5 && spotsLeft > 0 ? 'text-orange-500' : 'text-primary-500'} />
                        <span className={spotsLeft <= 5 && spotsLeft > 0 ? 'text-orange-600 font-semibold' : 'text-gray-500'}>
                          {spotsLeft} {language === 'fr' ? 'places' : language === 'ar' ? 'مقاعد' : 'spots'}
                        </span>
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-primary-700">{offer.price?.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 ml-1">TND</span>
                        </div>
                        <span className="text-xs text-primary-600 font-semibold flex items-center gap-1">
                          {language === 'fr' ? 'Réserver' : language === 'ar' ? 'احجز' : 'Book'} <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* See all card */}
              <Link
                to="/omra"
                className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:border-primary-300 hover:bg-primary-50 transition-all group"
              >
                <div className="w-11 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-3 group-hover:border-primary-200 group-hover:bg-primary-50 transition-colors">
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
                <p className="text-gray-600 group-hover:text-primary-700 font-semibold text-sm transition-colors">
                  {omraOffers.length > 3
                    ? `+${omraOffers.length - 3} ${language === 'fr' ? 'autres offres' : language === 'ar' ? 'عروض أخرى' : 'more offers'}`
                    : (language === 'fr' ? 'Voir toutes les offres' : language === 'ar' ? 'عرض جميع العروض' : 'View all offers')}
                </p>
                <p className="text-gray-400 text-xs mt-1">Omra & Hajj</p>
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Landing;
