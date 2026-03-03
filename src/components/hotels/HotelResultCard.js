import React, { useState } from 'react';
import { MapPin, Star, ChevronRight, Utensils, ThumbsUp, Clock, BadgePercent, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import useTripAdvisor from '../../hooks/useTripAdvisor';

/* ── Number formatter ─────────────────────────────────────────────────── */
const fmt = (v) =>
  parseFloat(v).toLocaleString('fr-TN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/* ══════════════════════════════════════════════════════════════════════ */
const HotelResultCard = ({ hotel, checkIn, checkOut, roomsConfig }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [imgError, setImgError] = useState(false);

  /* ── TripAdvisor data — richer query: name + city + address for better matching ── */
  const taQuery = [
    hotel.Name,
    hotel.City?.Name,
    hotel.City?.Country?.Name !== 'Tunisie' ? hotel.City?.Country?.Name : null,
  ].filter(Boolean).join(' ');
  const { taData, loading: taLoading } = useTripAdvisor(taQuery);

  /* ── Nights ── */
  const nights = (() => {
    if (!checkIn || !checkOut) return 1;
    const n = Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000);
    return n > 0 ? n : 1;
  })();

  /* ── Stars ── */
  const stars = hotel.Category?.Star || 0;

  /* ── Pricing ── */
  const pricing = (() => {
    const boardings = hotel.SearchData?.Price?.Boarding;
    if (!boardings) return null;
    let minPrice = Infinity, pairedBase = Infinity;
    boardings.forEach(b => {
      b.Pax?.forEach(p => {
        p.Rooms?.forEach(r => {
          const pr = parseFloat(r.Price   || 0);
          const ba = parseFloat(r.BasePrice || r.Price || 0);
          if (pr > 0 && pr < minPrice) { minPrice = pr; pairedBase = ba; }
        });
      });
    });
    if (minPrice === Infinity) return null;
    const savings     = pairedBase > minPrice ? pairedBase - minPrice : 0;
    const discountPct = pairedBase > minPrice ? Math.round((savings / pairedBase) * 100) : 0;
    return {
      price: minPrice,
      basePrice: pairedBase,
      currency: hotel.SearchData?.Currency || 'TND',
      discountPct,
      savings,
    };
  })();

  /* ── Boarding options (unique, max 4) ── */
  const boardings = (() => {
    const seen = new Set();
    return (hotel.SearchData?.Price?.Boarding || []).filter(b => {
      if (seen.has(b.Code)) return false;
      seen.add(b.Code);
      return true;
    }).slice(0, 4);
  })();

  /* ── Recommended ── */
  const recommended = hotel.SearchData?.Recommended || 0;

  /* ── Promo ── */
  const hasDiscount    = pricing && pricing.discountPct >= 5;
  const hasBigDiscount = pricing && pricing.discountPct >= 15;
  const promoTitle     = hotel.SearchData?.Promotion?.Title || null;

  /* ── Cancellation ── */
  const hasCancellationPolicy = (hotel.SearchData?.Price?.Boarding || []).some(b =>
    b.Pax?.some(p => p.Rooms?.some(r => r.CancellationDeadline || r.CancellationPolicy))
  );

  /* ── Facilities (max 4) ── */
  const facilities = (hotel.Facilities || []).slice(0, 4);

  /* ── Navigation ── */
  const handleViewDetails = () => {
    const params = new URLSearchParams();
    if (checkIn)  params.set('checkIn',  checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('roomsConfig', encodeURIComponent(
      JSON.stringify(roomsConfig || [{ adults: 2, children: [] }])
    ));
    navigate(`/hotel/${hotel.Id}?${params.toString()}`);
  };

  /* ── Location text ── */
  const location = hotel.Adress
    ? hotel.Adress
    : [hotel.City?.Name, hotel.City?.Country?.Name].filter(Boolean).join(', ');

  /* ══ Render ════════════════════════════════════════════════════════ */
  return (
    <div
      onClick={handleViewDetails}
      className="w-full bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden cursor-pointer group"
    >
      {/* ── Promo banner (top strip) ── */}
      {(hasBigDiscount || promoTitle) && (
        <div className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Flame size={15} className="flex-shrink-0" />
          <span>
            {promoTitle
              ? promoTitle
              : language === 'fr'
              ? `Offre limitée — ${pricing.discountPct}% de réduction`
              : language === 'ar'
              ? `عرض محدود — خصم ${pricing.discountPct}٪`
              : `Limited deal — ${pricing.discountPct}% off`}
          </span>
        </div>
      )}

      <div className={`w-full flex flex-col md:flex-row ${isRTL ? 'md:flex-row-reverse' : ''}`}>

        {/* ── Image ── */}
        {/* h-44 on mobile (compact), auto on desktop (fills card height) */}
        <div className="w-full md:w-60 lg:w-72 h-44 md:h-auto flex-shrink-0 relative overflow-hidden">
          <img
            src={imgError
              ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=70'
              : (hotel.Image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=70')}
            alt={hotel.Name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />

          {/* Discount badge */}
          {hasDiscount && (
            <div className={`absolute top-2 md:top-3 ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'}`}>
              <span className="inline-flex items-center gap-1 md:gap-1.5 bg-red-500 text-white text-xs md:text-sm font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-xl shadow-md">
                <BadgePercent size={12} /> -{pricing.discountPct}%
              </span>
            </div>
          )}

          {/* Cancellable */}
          {hasCancellationPolicy && (
            <div className={`absolute bottom-2 md:bottom-3 ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'}`}>
              <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg">
                <Clock size={10} />
                <span className="hidden sm:inline">
                  {language === 'fr' ? 'Annulation gratuite' : language === 'ar' ? 'إلغاء مجاني' : 'Free cancellation'}
                </span>
                <span className="sm:hidden">
                  {language === 'fr' ? 'Annulable' : language === 'ar' ? 'قابل للإلغاء' : 'Cancellable'}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className={`flex-1 flex flex-col md:flex-row min-w-0 ${isRTL ? 'md:flex-row-reverse' : ''}`}>

          {/* Left: hotel info */}
          <div
            className={`flex-1 p-4 md:p-5 flex flex-col gap-2 md:gap-3 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Name + Stars */}
            <div>
              <h3 className="text-base md:text-xl font-bold text-gray-900 leading-tight group-hover:text-primary-700 transition-colors line-clamp-2">
                {hotel.Name}
              </h3>
              {stars > 0 && (
                <div className={`flex items-center gap-0.5 md:gap-1 mt-1.5 md:mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                  {[...Array(5 - stars)].map((_, i) => (
                    <Star key={`e${i}`} size={13} className="fill-gray-200 text-gray-200" />
                  ))}
                  <span className="hidden md:inline text-sm text-gray-400 ml-1.5 font-medium">{stars} étoiles</span>
                  <span className="md:hidden text-xs text-gray-400 ml-1 font-medium">{stars}★</span>
                </div>
              )}
            </div>

            {/* TripAdvisor rating — own row, sibling of Name+Stars */}
            {taLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 rounded-lg bg-gray-200 animate-pulse" />
              </div>
            ) : taData?.rating ? (
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-1.5 bg-[#34E0A1]/10 border border-[#34E0A1]/30 rounded-lg px-2 py-0.5 md:px-2.5 md:py-1">
                  {taData.ratingImageUrl
                    ? <img src={taData.ratingImageUrl} alt={`${taData.rating}`} className="h-4 md:h-5" />
                    : <span className="text-xs font-bold text-gray-800">{taData.rating.toFixed(1)}</span>
                  }
                  {taData.numReviews && (
                    <span className="text-xs text-gray-400">
                      · {taData.numReviews.toLocaleString()}{' '}
                      <span className="hidden sm:inline">
                        {language === 'fr' ? 'avis' : language === 'ar' ? 'تقييم' : 'reviews'}
                      </span>
                    </span>
                  )}
                </div>
                {taData.webUrl && (
                  <a
                    href={taData.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="hidden sm:inline text-[13px] text-[#34E0A1] hover:underline font-medium"
                  >
                    TripAdvisor →
                  </a>
                )}
              </div>
            ) : null}

            {/* Location */}
            {location && (
              <div className={`flex items-center gap-1.5 md:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm md:text-base text-gray-600 truncate">{location}</span>
              </div>
            )}

            {/* Boarding */}
            {boardings.length > 0 && (
              <div className={`flex items-center gap-1.5 md:gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Utensils size={13} className="text-gray-400 flex-shrink-0" />
                {boardings.map(b => (
                  <span
                    key={b.Id}
                    title={b.Name}
                    className="text-xs md:text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-2 md:px-3 py-0.5 md:py-1 rounded-lg"
                  >
                    {b.Code}
                  </span>
                ))}
              </div>
            )}

            {/* Facilities — hidden on mobile to save space */}
            {facilities.length > 0 && (
              <div className={`hidden md:flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {facilities.map((f, i) => (
                  <span
                    key={i}
                    className="text-sm text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg"
                  >
                    {f.Title}
                  </span>
                ))}
              </div>
            )}

            {/* Recommended — hidden on mobile */}
            {recommended >= 1 && (
              <div className={`hidden md:flex items-center gap-1.5 text-primary-600 text-sm font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                <ThumbsUp size={14} />
                {language === 'fr' ? 'Recommandé' : language === 'ar' ? 'موصى به' : 'Recommended'}
              </div>
            )}
          </div>

          {/* ── Price + CTA ──────────────────────────────────────────────────
           *  Mobile : highlighted bar — large price left, button right
           *  Desktop: vertical right panel (unchanged)
           * ─────────────────────────────────────────────────────────────── */}
          <div
            className={`flex-shrink-0
              flex flex-row items-center justify-between gap-3
              border-t-2 border-primary-100 bg-gradient-to-r from-primary-50 to-white
              px-4 py-3
              md:flex-col md:justify-between md:border-t-0 md:bg-transparent md:p-5 md:w-52 lg:w-56
              ${isRTL ? 'md:border-r border-gray-200' : 'md:border-l border-gray-200'}`}
            dir="ltr"
          >
            {/* Price info */}
            <div className={`min-w-0 flex-1 ${isRTL ? 'md:text-left' : 'md:text-right'}`}>
              {pricing ? (
                <>
                  {/* "From" label — mobile + desktop */}
                  <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wider mb-0.5 md:text-xs md:text-gray-400 md:mb-1">
                    {language === 'fr' ? 'À partir de' : language === 'ar' ? 'ابتداءً من' : 'From'}
                  </p>

                  {/* Price — enlarged on mobile */}
                  <div className="flex items-baseline gap-1 md:gap-1.5 md:justify-end leading-none">
                    <span className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                      {fmt(pricing.price)}
                    </span>
                    <span className="text-sm md:text-lg font-bold text-primary-600 md:text-gray-500">{pricing.currency}</span>
                  </div>

                  {/* Nights + mobile discount in one row */}
                  <div className="flex items-center gap-2 mt-0.5 md:mt-2 md:block">
                    <p className="text-xs text-gray-500 md:text-sm md:text-gray-400">
                      <span className="font-semibold text-gray-700 md:text-gray-600">
                        {nights}{' '}
                        {language === 'fr'
                          ? (nights > 1 ? 'nuits' : 'nuit')
                          : language === 'ar'
                          ? (nights > 1 ? 'ليالي' : 'ليلة')
                          : (nights > 1 ? 'nights' : 'night')}
                      </span>
                    </p>
                    {/* Discount tag — mobile only */}
                    {pricing.discountPct >= 5 && (
                      <span className="md:hidden inline-flex items-center bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        -{pricing.discountPct}%
                      </span>
                    )}
                  </div>

                  {/* Strikethrough — desktop only */}
                  {pricing.discountPct >= 5 && (
                    <p className="hidden md:block text-sm text-gray-400 line-through mt-0.5">
                      {fmt(pricing.basePrice)} {pricing.currency}
                    </p>
                  )}

                  {/* Savings — desktop only */}
                  {pricing.savings > 5 && (
                    <p className="hidden md:flex text-sm text-green-600 font-semibold mt-2 items-center gap-1 justify-end">
                      <span className="text-green-500">↓</span>
                      {language === 'fr'
                        ? `Économie ${fmt(pricing.savings)} ${pricing.currency}`
                        : language === 'ar'
                        ? `وفّر ${fmt(pricing.savings)} ${pricing.currency}`
                        : `Save ${fmt(pricing.savings)} ${pricing.currency}`}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">
                  {language === 'fr' ? 'Prix sur demande' : language === 'ar' ? 'السعر عند الطلب' : 'Price on request'}
                </p>
              )}
            </div>

            {/* CTA button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
              className={`flex-shrink-0 flex items-center justify-center gap-1.5
                bg-primary-700 hover:bg-primary-800 active:scale-95 text-white font-bold
                transition-all shadow-md rounded-xl
                px-4 py-3 text-sm
                md:mt-5 md:w-full md:px-4 md:py-3 md:text-base md:gap-2
                ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <span className="hidden md:inline">
                {language === 'fr' ? "Voir l'offre" : language === 'ar' ? 'عرض التفاصيل' : 'View deal'}
              </span>
              <span className="md:hidden">
                {language === 'fr' ? "Voir" : language === 'ar' ? 'عرض' : 'View'}
              </span>
              <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HotelResultCard;
