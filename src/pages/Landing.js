import React from 'react';
import { Hotel, Plane, Mountain, ArrowLeft, Sparkles, Shield, Clock, Heart, Star, MapPin, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBox from '../components/landing/SearchBox';
import VoucherCard from '../components/landing/VoucherCard';
import HotelCard from '../components/landing/HotelCard';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const Landing = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';
  
  const [activeTab, setActiveTab] = React.useState('hotels');
  const [showGuestSelector, setShowGuestSelector] = React.useState(false);
  const [rooms, setRooms] = React.useState(1);
  const [roomsConfig, setRoomsConfig] = React.useState([{ adults: 2, children: [] }]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[650px] lg:min-h-[750px] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900">
          <div className="absolute inset-0 opacity-10">
            <img 
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80" 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content - Split Layout on Desktop */}
        <div className="container mx-auto px-4 lg:px-12 relative z-10 w-full pt-24 pb-8 lg:pt-28 lg:pb-16">
          {/* Mobile Layout - Centered */}
          <div className="lg:hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Trust Badges */}
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

            {/* Heading */}
            <div className="text-center mb-7">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                {t.hero.title} <span className="text-secondary-400">{t.hero.titleHighlight}</span>
              </h1>
              <p className="text-sm md:text-base text-white/90 px-4">
                {t.hero.subtitle}
              </p>
            </div>

            {/* Search Box */}
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

          {/* Desktop Layout - Vertical Design */}
          <div className="hidden lg:block w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Hero Content */}
            <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
              {/* Main Heading */}
              <div className="text-center mb-6">
                <h1 className="text-4xl xl:text-5xl font-bold text-white mb-3 capitalize">
                  {t.hero.title} <span className="text-secondary-400 capitalize">{t.hero.titleHighlight}</span>
                </h1>
                <p className="text-base xl:text-lg text-white/90 mb-6">
                  {t.hero.subtitle}
                </p>
                
                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-white bg-white/15 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                    <Shield size={16} className="text-secondary-400" />
                    <span className="text-xs font-medium">{t.hero.trustBadge1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white bg-white/15 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                    <Clock size={16} className="text-secondary-400" />
                    <span className="text-xs font-medium">{t.hero.trustBadge2}</span>
                  </div>
                </div>

                {/* Features Icons */}
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-white/90">
                    <Hotel size={18} className="text-secondary-400" />
                    <span className="text-sm">{t.hero.feature1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <Star size={18} className="text-secondary-400" />
                    <span className="text-sm">{t.hero.feature2}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <Zap size={18} className="text-secondary-400" />
                    <span className="text-sm">{t.hero.feature3}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
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
        </div>
      </section>

      {/* Exclusive Offers */}
      <section className="py-6 md:py-10 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t.offers.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <VoucherCard
              theme="pink"
              discount="5%"
              badge={t.offers.new}
              title={t.offers.hotel5Stars}
              code="HOTEL5"
              icon={Hotel}
            />
            <VoucherCard
              theme="blue"
              discount="5%"
              badge={t.offers.limited}
              title={t.offers.travelHotels}
              code="TRAVEL5"
              icon={Plane}
            />
            <VoucherCard
              theme="orange"
              discount="10%"
              badge="🔥"
              title={t.offers.omraPackages}
              code="OMRA10"
              icon={Mountain}
            />
          </div>
        </div>
      </section>

      {/* Get Inspired Section */}
      <section className="py-6 md:py-10 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">{t.getInspired.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            <Link to="/destinations/anywhere" className="relative rounded-xl overflow-hidden h-40 md:h-44 group shadow-md hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80" 
                alt={t.getInspired.destinations.anywhere} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 right-4">
                <span className="text-white font-bold text-xl drop-shadow-lg">{t.getInspired.destinations.anywhere}</span>
              </div>
            </Link>

            <Link to="/destinations/tunis" className="relative rounded-xl overflow-hidden h-40 md:h-44 group shadow-md hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&q=80" 
                alt={t.getInspired.destinations.tunis} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 right-4">
                <span className="text-white font-bold text-xl drop-shadow-lg">{t.getInspired.destinations.tunis}</span>
              </div>
            </Link>

            <Link to="/destinations/sousse" className="relative rounded-xl overflow-hidden h-40 md:h-44 group shadow-md hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&q=80" 
                alt={t.getInspired.destinations.sousse} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 right-4">
                <span className="text-white font-bold text-xl drop-shadow-lg">{t.getInspired.destinations.sousse}</span>
              </div>
            </Link>

            <Link to="/destinations/hammamet" className="relative rounded-2xl overflow-hidden h-40 group">
              <img 
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80" 
                alt={t.getInspired.destinations.hammamet} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 right-3">
                <span className="text-white font-bold text-lg">{t.getInspired.destinations.hammamet}</span>
              </div>
            </Link>

            <Link to="/destinations/djerba" className="relative rounded-2xl overflow-hidden h-40 group">
              <img 
                src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&q=80" 
                alt={t.getInspired.destinations.djerba} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 right-4">
                <span className="text-white font-bold text-xl drop-shadow-lg">{t.getInspired.destinations.djerba}</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Places You May Like */}
      <section className="py-6 md:py-10 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t.popularHotels.title}</h2>
            <Link to="/hotels" className="text-primary-700 hover:text-primary-800 font-semibold flex items-center gap-1 transition-colors">
              <span>{t.popularHotels.viewAll}</span>
              <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <HotelCard
              id={1}
              image="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80"
              name="فندق المرسى الكبير"
              location="تونس، الحمامات"
              rating={4}
              reviewCount={1234}
              price={120}
            />
            <HotelCard
              id={2}
              image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"
              name="قصر القرطاج الفاخر"
              location="تونس، قرطاج"
              rating={5}
              reviewCount={856}
              price={180}
            />
            <HotelCard
              id={3}
              image="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80"
              name="منتجع الياسمين الشاطئي"
              location="سوسة، القنطاوي"
              rating={4}
              reviewCount={567}
              price={95}
            />
            <HotelCard
              id={4}
              image="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"
              name="فندق النخيل الذهبي"
              location="جربة، ميدون"
              rating={4}
              reviewCount={432}
              price={110}
              originalPrice={140}
            />
          </div>
        </div>
      </section>

      {/* Magical Trip Moments - Trip.com Style Cards */}
      <section className="py-12 px-4 bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{t.experiences.title}</h2>
            <Link to="/experiences" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              <span>{t.experiences.more}</span>
              <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Experience Card 1 - Red Theme */}
            <Link to="/experience/1" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="relative h-64">
                <img 
                  src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80" 
                  alt={t.experiences.cards.omra.location} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <button className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100`}>
                  <Heart size={18} className="text-gray-600" />
                </button>
                <div className={`absolute bottom-4 ${isRTL ? 'right-4 left-4' : 'left-4 right-4'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-white" />
                    <span className="text-white text-sm">{t.experiences.cards.omra.location}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{t.experiences.cards.omra.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className={`text-sm font-semibold ${isRTL ? 'mr-1' : 'ml-1'}`}>4.8</span>
                  </div>
                  <span className="text-sm text-gray-600">• {language === 'fr' ? 'Voyage béni' : language === 'ar' ? 'رحلة مباركة' : 'Blessed journey'}</span>
                </div>
              </div>
            </Link>

            {/* Experience Card 2 */}
            <Link to="/experience/2" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="relative h-64">
                <img 
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80" 
                  alt={t.experiences.cards.desert.location} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <button className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100`}>
                  <Heart size={18} className="text-gray-600" />
                </button>
                <div className={`absolute bottom-4 ${isRTL ? 'right-4 left-4' : 'left-4 right-4'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-white" />
                    <span className="text-white text-sm">{t.experiences.cards.desert.location}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{t.experiences.cards.desert.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className={`text-sm font-semibold ${isRTL ? 'mr-1' : 'ml-1'}`}>4.9</span>
                  </div>
                  <span className="text-sm text-gray-600">• {language === 'fr' ? 'Expérience unique' : language === 'ar' ? 'تجربة فريدة' : 'Unique experience'}</span>
                </div>
              </div>
            </Link>

            {/* Experience Card 3 */}
            <Link to="/experience/3" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="relative h-64">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" 
                  alt={t.experiences.cards.medina.location} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <button className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100`}>
                  <Heart size={18} className="text-gray-600" />
                </button>
                <div className={`absolute bottom-4 ${isRTL ? 'right-4 left-4' : 'left-4 right-4'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-white" />
                    <span className="text-white text-sm">{t.experiences.cards.medina.location}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{t.experiences.cards.medina.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className={`text-sm font-semibold ${isRTL ? 'mr-1' : 'ml-1'}`}>4.7</span>
                  </div>
                  <span className="text-sm text-gray-600">• {language === 'fr' ? 'Vues imprenables' : language === 'ar' ? 'مناظر خلابة' : 'Stunning views'}</span>
                </div>
              </div>
            </Link>

            {/* Experience Card 4 */}
            <Link to="/experience/4" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="relative h-64">
                <img 
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80" 
                  alt={t.experiences.cards.beach.location} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <button className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100`}>
                  <Heart size={18} className="text-gray-600" />
                </button>
                <div className={`absolute bottom-4 ${isRTL ? 'right-4 left-4' : 'left-4 right-4'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-white" />
                    <span className="text-white text-sm">{t.experiences.cards.beach.location}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{t.experiences.cards.beach.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className={`text-sm font-semibold ${isRTL ? 'mr-1' : 'ml-1'}`}>5.0</span>
                  </div>
                  <span className="text-sm text-gray-600">• {language === 'fr' ? 'Ambiance formidable' : language === 'ar' ? 'أجواء رائعة' : 'Wonderful atmosphere'}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stay Cozy at Handpicked Hotels - Trip.com Style */}
      <section className="py-12 px-4 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{t.handpickedHotels.title}</h2>
            <Link to="/hotels" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              <span>{t.handpickedHotels.more}</span>
              <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Featured Hotel 1 */}
            <Link to="/hotel/5" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80" 
                  alt="Hotel" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100`}>
                  <Heart size={18} className="text-gray-600" />
                </button>
                <div className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1`}>
                  <span className="font-bold">9.0</span>
                  <span>{t.handpickedHotels.excellent}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-semibold">{language === 'fr' ? 'Le Cap' : language === 'ar' ? 'كيب تاون' : 'Cape Town'}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{language === 'fr' ? 'Hôtel de luxe du Cap' : language === 'ar' ? 'فندق كيب تاون الفاخر' : 'Luxury Cape Town Hotel'}</h3>
                <p className="text-xs text-gray-500 mb-2">4.4 km {t.handpickedHotels.fromCenter}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500 line-through">250DT</span>
                  <span className="text-xl font-bold text-primary-600">199DT{t.handpickedHotels.perNight}</span>
                </div>
              </div>
            </Link>

            {/* Featured Hotel 2 */}
            <Link to="/hotel/6" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" 
                  alt="Hotel" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100`}>
                  <Heart size={18} className="text-gray-600" />
                </button>
                <div className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1`}>
                  <span className="font-bold">8.5</span>
                  <span>{language === 'fr' ? 'Superbe' : language === 'ar' ? 'رائع' : 'Great'}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-semibold">Playa Flamingo</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{language === 'fr' ? 'Hôtel Playa Flamingo Beach Resort' : language === 'ar' ? 'فندق بلايا فلامنجو سبينج' : 'Playa Flamingo Beach Resort Hotel'}</h3>
                <p className="text-xs text-gray-500 mb-2">0.4 km {t.handpickedHotels.fromCenter}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">من</span>
                  <span className="text-xl font-bold text-primary-600">389د.ت</span>
                </div>
              </div>
            </Link>

            {/* Featured Hotel 3 */}
            <Link to="/hotel/7" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80" 
                  alt="Hotel" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100`}>
                  <Heart size={18} className="text-gray-600" />
                </button>
                <div className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1`}>
                  <span className="font-bold">8.9</span>
                  <span>{t.handpickedHotels.excellent}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-semibold">{language === 'fr' ? 'Istanbul' : language === 'ar' ? 'إسطنبول' : 'Istanbul'}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{language === 'fr' ? 'Resort Istanbul de luxe' : language === 'ar' ? 'منتجع إسطنبول الراقي' : 'Luxury Istanbul Resort'}</h3>
                <p className="text-xs text-gray-500 mb-2">1.1 km {t.handpickedHotels.fromCenter}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">{t.travelPackages.from}</span>
                  <span className="text-xl font-bold text-primary-600">168DT{t.handpickedHotels.perNight}</span>
                </div>
              </div>
            </Link>

            {/* Featured Hotel 4 */}
            <Link to="/hotel/8" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80" 
                  alt="Hotel" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100`}>
                  <Heart size={18} className="text-gray-600" />
                </button>
                <div className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1`}>
                  <span className="font-bold">9.2</span>
                  <span>{language === 'fr' ? 'Superbe' : language === 'ar' ? 'رائع' : 'Great'}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-semibold">{language === 'fr' ? 'Maldives' : language === 'ar' ? 'المالديف' : 'Maldives'}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{language === 'fr' ? 'Hôtel de plage Maldives' : language === 'ar' ? 'فندق المالديف الشاطئي' : 'Maldives Beach Hotel'}</h3>
                <p className="text-xs text-gray-500 mb-2">0.8 km {t.handpickedHotels.fromCenter}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">{t.travelPackages.from}</span>
                  <span className="text-xl font-bold text-primary-600">299DT{t.handpickedHotels.perNight}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Multiple Ways to Roam - Trip.com Style */}
      <section className="py-12 px-4 bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{language === 'fr' ? 'Forfaits Voyage' : language === 'ar' ? 'طرق متعددة للتجول' : 'Travel Packages'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Travel Package 1 */}
            <Link to="/package/hongkong" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="relative h-56">
                <img 
                  src="https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80" 
                  alt="Hong Kong" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className={`absolute bottom-4 ${isRTL ? 'right-4 left-4' : 'left-4 right-4'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Plane size={16} className="text-white" />
                    <span className="text-white text-sm font-medium">{t.travelPackages.flightHotel}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{language === 'fr' ? '3 jours à Hong Kong' : language === 'ar' ? '3 أيام في هونغ كونغ' : '3 days in Hong Kong'}</h3>
                  <p className="text-white/80 text-sm">{language === 'fr' ? '15 nov - 18 déc' : language === 'ar' ? 'من 15 نوفمبر - 18 ديسمبر' : 'Nov 15 - Dec 18'}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">{t.travelPackages.from}</span>
                  <span className="text-xl font-bold text-primary-600">508DT{t.travelPackages.perPerson}</span>
                </div>
              </div>
            </Link>

            {/* Travel Package 2 */}
            <Link to="/package/phuket" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="relative h-56">
                <img 
                  src="https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80" 
                  alt="Phuket" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className={`absolute bottom-4 ${isRTL ? 'right-4 left-4' : 'left-4 right-4'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Plane size={16} className="text-white" />
                    <span className="text-white text-sm font-medium">{t.travelPackages.flightHotel}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{language === 'fr' ? '5 jours à Phuket' : language === 'ar' ? '5 أيام في فوكيت' : '5 days in Phuket'}</h3>
                  <p className="text-white/80 text-sm">{language === 'fr' ? '10 déc - 15 jan' : language === 'ar' ? 'من 10 ديسمبر - 15 يناير' : 'Dec 10 - Jan 15'}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">{t.travelPackages.from}</span>
                  <span className="text-xl font-bold text-primary-600">653DT{t.travelPackages.perPerson}</span>
                </div>
              </div>
            </Link>

            {/* Travel Package 3 */}
            <Link to="/package/guatemala" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="relative h-56">
                <img 
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80" 
                  alt="Guatemala" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className={`absolute bottom-4 ${isRTL ? 'right-4 left-4' : 'left-4 right-4'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    <span className="text-white text-sm font-medium">{t.travelPackages.quickTrip}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{language === 'fr' ? 'Voyage au Guatemala' : language === 'ar' ? 'رحلة إلى غواتيمالا' : 'Trip to Guatemala'}</h3>
                  <p className="text-white/80 text-sm">{language === 'fr' ? '5 jan - 20 fév' : language === 'ar' ? 'من 5 يناير - 20 فبراير' : 'Jan 5 - Feb 20'}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">{t.travelPackages.from}</span>
                  <span className="text-xl font-bold text-primary-600">587DT{t.travelPackages.perPerson}</span>
                </div>
              </div>
            </Link>

            {/* Travel Package 4 */}
            <Link to="/package/cairo" className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
              <div className="relative h-56">
                <img 
                  src="https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80" 
                  alt="Cairo" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className={`absolute bottom-4 ${isRTL ? 'right-4 left-4' : 'left-4 right-4'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-white" />
                    <span className="text-white text-sm font-medium">{t.travelPackages.culturalTrip}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{language === 'fr' ? 'Une semaine au Caire' : language === 'ar' ? 'أسبوع في القاهرة' : 'A week in Cairo'}</h3>
                  <p className="text-white/80 text-sm">{language === 'fr' ? '1 mars - 30 mars' : language === 'ar' ? 'من 1 مارس - 30 مارس' : 'Mar 1 - Mar 30'}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">{t.travelPackages.from}</span>
                  <span className="text-xl font-bold text-primary-600">429DT{t.travelPackages.perPerson}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
