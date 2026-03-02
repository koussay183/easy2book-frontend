import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar, Clock, Users, MapPin, Star, ArrowRight,
  Shield, Check, Plane, RefreshCw
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { useLanguage } from '../context/LanguageContext';

const defaultImage = 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=800&q=80';

const T = {
  fr: {
    title: 'Omra & Hajj',
    subtitle: 'Forfaits complets depuis la Tunisie — vol, hébergement et guide inclus.',
    all: 'Toutes', umrah: 'Omra', hajj: 'Hajj', umrah_plus: 'Omra Plus',
    offers: (n) => `${n} offre${n > 1 ? 's' : ''}`,
    days: 'j', spots: 'places', per: '/ pers.',
    book: 'Réserver', full: 'Complet', featured: 'Vedette',
    loading: 'Chargement...', retry: 'Réessayer',
    noOffers: 'Aucune offre disponible',
    noOffersDesc: 'Revenez bientôt pour découvrir nos nouvelles offres.',
    noCategory: 'Aucune offre pour cette catégorie.',
    viewAll: 'Voir toutes les offres',
    trust1: 'Forfaits complets', trust1d: 'Vol + hébergement + guide',
    trust2: 'Voyages certifiés', trust2d: 'Agence agréée MRE',
    trust3: 'Accompagnement', trust3d: 'Guide dédié tout au long du voyage',
  },
  ar: {
    title: 'عمرة وحج',
    subtitle: 'باقات متكاملة من تونس — طيران وإقامة ومرشد مشمولون.',
    all: 'الكل', umrah: 'عمرة', hajj: 'حج', umrah_plus: 'عمرة بلس',
    offers: (n) => `${n} عرض`,
    days: 'ي', spots: 'مقاعد', per: '/ ش.',
    book: 'احجز', full: 'مكتمل', featured: 'مميز',
    loading: 'جاري التحميل...', retry: 'حاول مجدداً',
    noOffers: 'لا توجد عروض متاحة',
    noOffersDesc: 'عد قريباً لاكتشاف عروضنا الجديدة.',
    noCategory: 'لا توجد عروض لهذه الفئة.',
    viewAll: 'عرض جميع العروض',
    trust1: 'باقات متكاملة', trust1d: 'طيران + إقامة + مرشد',
    trust2: 'رحلات معتمدة', trust2d: 'وكالة معتمدة',
    trust3: 'مرافقة متخصصة', trust3d: 'مرشدون متخصصون طوال الرحلة',
  },
  en: {
    title: 'Umrah & Hajj',
    subtitle: 'Complete packages from Tunisia — flight, accommodation & guide included.',
    all: 'All', umrah: 'Umrah', hajj: 'Hajj', umrah_plus: 'Umrah Plus',
    offers: (n) => `${n} offer${n > 1 ? 's' : ''}`,
    days: 'd', spots: 'spots', per: '/ pax',
    book: 'Book', full: 'Full', featured: 'Featured',
    loading: 'Loading...', retry: 'Retry',
    noOffers: 'No offers available',
    noOffersDesc: 'Check back soon for new offers.',
    noCategory: 'No offers for this category.',
    viewAll: 'View all offers',
    trust1: 'Complete packages', trust1d: 'Flight + hotel + guide',
    trust2: 'Certified trips', trust2d: 'Licensed & experienced agency',
    trust3: 'Expert guidance', trust3d: 'Dedicated guides throughout',
  }
};

const CATEGORY_COLORS = {
  umrah:      'bg-primary-50 text-primary-700 border-primary-200',
  hajj:       'bg-secondary-100 text-secondary-700 border-secondary-300',
  umrah_plus: 'bg-accent-50 text-accent-700 border-accent-200'
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Offer Card ────────────────────────────────────────────────
const OfferCard = ({ offer, t, isRTL, onBook }) => {
  const spots  = offer.availableSpots ?? offer.capacity;
  const isFull = spots === 0;
  const low    = spots > 0 && spots <= 5;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${isFull ? 'opacity-70' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={offer.imageUrl || defaultImage} alt={offer.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = defaultImage; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        <span className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} text-xs font-bold px-2 py-0.5 rounded border ${CATEGORY_COLORS[offer.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {t[offer.category] || offer.category}
        </span>

        {offer.isFeatured && (
          <span className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} bg-secondary-400 text-secondary-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
            <Star size={9} fill="currentColor" /> {t.featured}
          </span>
        )}

        {isFull && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl">{t.full}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 leading-snug">{offer.title}</h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{offer.description}</p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-500 mb-3">
          <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Clock size={11} className="text-primary-500 flex-shrink-0" />
            <span>{offer.duration} {t.days}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Users size={11} className={`flex-shrink-0 ${low ? 'text-orange-500' : 'text-primary-500'}`} />
            <span className={low ? 'text-orange-600 font-semibold' : ''}>{spots} {t.spots}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar size={11} className="text-primary-500 flex-shrink-0" />
            <span>{fmt(offer.departureDate)}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MapPin size={11} className="text-primary-500 flex-shrink-0" />
            <span>{offer.departureCity || 'Tunis'}</span>
          </div>
        </div>

        {/* Highlights */}
        {offer.highlights?.length > 0 && (
          <div className={`flex flex-wrap gap-1 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {offer.highlights.slice(0, 2).map((h, i) => (
              <span key={i} className="text-xs bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{h}</span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className={`mt-auto flex items-center justify-between pt-3 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <span className="text-lg font-extrabold text-primary-700">{offer.price?.toLocaleString()}</span>
            <span className="text-xs text-gray-400 ml-1">TND {t.per}</span>
          </div>
          <button onClick={() => onBook(offer._id)} disabled={isFull}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isFull
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-700 hover:bg-primary-800 text-white shadow-sm'
            } ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isFull ? t.full : t.book}
            {!isFull && <ArrowRight size={13} className={isRTL ? 'rotate-180' : ''} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const Omra = () => {
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();
  const { language }          = useLanguage();
  const isRTL                 = language === 'ar';
  const t                     = T[language] || T.fr;

  const validCategories = ['umrah', 'hajj', 'umrah_plus'];
  const catFromUrl      = searchParams.get('category');

  const [offers,          setOffers]         = useState([]);
  const [loading,         setLoading]        = useState(true);
  const [error,           setError]          = useState(null);
  const [activeCategory,  setActiveCategory] = useState(
    validCategories.includes(catFromUrl) ? catFromUrl : 'all'
  );

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(API_ENDPOINTS.OMRA_OFFERS);
      const data = await res.json();
      if (data.status === 'success') setOffers(data.data);
      else setError(t.noOffers);
    } catch {
      setError(t.noOffers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []); // eslint-disable-line

  const filtered = activeCategory === 'all'
    ? offers
    : offers.filter((o) => o.category === activeCategory);

  const categories = [
    { id: 'all',        label: t.all },
    { id: 'umrah',      label: t.umrah },
    { id: 'hajj',       label: t.hajj },
    { id: 'umrah_plus', label: t.umrah_plus }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Compact Page Header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div>
              <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Plane size={18} className="text-primary-700" />
                <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
              </div>
              <p className="text-sm text-gray-500 max-w-lg">{t.subtitle}</p>
            </div>
            {!loading && !error && (
              <p className="text-xs text-gray-400 font-medium flex-shrink-0">
                {t.offers(filtered.length)}
              </p>
            )}
          </div>

          {/* Category pills */}
          <div className={`flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide pb-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Offers Grid ── */}
      <div className="container mx-auto px-4 py-7 max-w-6xl">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw size={28} className="animate-spin text-primary-600" />
            <p className="text-sm text-gray-400">{t.loading}</p>
          </div>

        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button onClick={fetchOffers}
              className="px-5 py-2 bg-primary-700 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 transition-colors">
              {t.retry}
            </button>
          </div>

        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plane size={24} className="text-primary-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">{t.noOffers}</h3>
            <p className="text-sm text-gray-400 mb-5">
              {activeCategory === 'all' ? t.noOffersDesc : t.noCategory}
            </p>
            {activeCategory !== 'all' && (
              <button onClick={() => setActiveCategory('all')}
                className="text-primary-700 font-semibold text-sm hover:underline">
                {t.viewAll}
              </button>
            )}
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((offer) => (
              <OfferCard key={offer._id} offer={offer} t={t} isRTL={isRTL}
                onBook={(id) => navigate(`/omra/${id}/book`)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Trust Bar ── */}
      {!loading && filtered.length > 0 && (
        <div className="border-t border-gray-100 bg-white">
          <div className="container mx-auto px-4 py-7 max-w-6xl">
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-5 ${isRTL ? 'direction-rtl' : ''}`}>
              {[
                { icon: Check,  title: t.trust1, desc: t.trust1d },
                { icon: Shield, title: t.trust2, desc: t.trust2d },
                { icon: Users,  title: t.trust3, desc: t.trust3d }
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-primary-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Omra;
