import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, CreditCard, Building2, CheckCircle2,
  Calendar, Home, Loader2, MapPin, Star, Info,
  Shield, Moon, ChevronDown, ChevronUp, CheckCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';

/* ─── Field wrapper ─── */
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

/* ─── Input class helper ─── */
const inputCls = (error) =>
  `w-full px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors outline-none
   focus:ring-2 focus:ring-primary-100 focus:border-primary-600
   ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`;

/* ─── Section card ─── */
const Section = ({ step, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200">
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {step}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */

const HotelBooking = () => {
  const location     = useLocation();
  const navigate     = useNavigate();
  const { language } = useLanguage();
  const isRTL        = language === 'ar';
  const state        = location.state;

  const [isLoggedIn,        setIsLoggedIn]        = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [guestInfo,         setGuestInfo]         = useState(null);
  const [contactInfo,       setContactInfo]       = useState({ email: '', phone: '' });
  const [guestBookingInfo,  setGuestBookingInfo]  = useState({ name: '', email: '', phone: '', country: '', address: '' });
  const [paymentMethod,     setPaymentMethod]     = useState('agency');
  const [paymentPlan,       setPaymentPlan]       = useState('full'); // 'full' | 'installment' (online only)
  const [notes,             setNotes]             = useState('');
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [errors,            setErrors]            = useState({});

  /* ── Guard ── */
  if (!state?.hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Home className="text-primary-700" size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'fr' ? 'Aucune réservation' : language === 'ar' ? 'لا يوجد حجز' : 'No booking selected'}
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            {language === 'fr' ? "Veuillez d'abord sélectionner un hôtel." : language === 'ar' ? 'يرجى اختيار فندق أولاً.' : 'Please select a hotel first.'}
          </p>
          <button onClick={() => navigate('/')}
            className="bg-primary-700 hover:bg-primary-800 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">
            {language === 'fr' ? "Retour à l'accueil" : language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  const { hotel, room, boarding, checkIn, checkOut,
          adults, children, nights, pricePerNight, totalPrice } = state;

  const currency   = hotel.SearchData?.Currency || 'TND';
  const starRating = hotel.Category?.Star || 0;
  const cityName   = hotel.City?.Name || '';

  /* ── Init ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setGuestInfo({
      adults:   Array(adults   || 2).fill(0).map((_, i) => ({ civility: 'Mr', name: '', surname: '', holder: i === 0 })),
      children: Array(children || 0).fill(0).map(() => ({ name: '', surname: '', age: '' })),
    });
    const token = localStorage.getItem('accessToken');
    if (token) { setIsLoggedIn(true); fetchUser(token); }
  }, []); // eslint-disable-line

  const fetchUser = async (token) => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_ME, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setContactInfo({ email: d.data.user.email || '', phone: d.data.user.phone || '' });
      }
    } catch (_) {}
  };

  /* ── Handlers ── */
  const handleAdultChange = (idx, field, val) => {
    const arr = [...guestInfo.adults];
    if (field === 'holder') arr.forEach((_, i) => { arr[i] = { ...arr[i], holder: i === idx }; });
    else arr[idx] = { ...arr[idx], [field]: val };
    setGuestInfo({ ...guestInfo, adults: arr });
    const key = `adult_${idx}_${field}`;
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const handleChildChange = (idx, field, val) => {
    const arr = [...guestInfo.children];
    arr[idx] = { ...arr[idx], [field]: val };
    setGuestInfo({ ...guestInfo, children: arr });
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    guestInfo.adults.forEach((a, i) => {
      if (!a.name.trim())    e[`adult_${i}_name`]    = t.required;
      if (!a.surname.trim()) e[`adult_${i}_surname`] = t.required;
    });
    guestInfo.children.forEach((c, i) => {
      if (!c.name.trim())    e[`child_${i}_name`]    = t.required;
      if (!c.surname.trim()) e[`child_${i}_surname`] = t.required;
    });
    if (!isLoggedIn) {
      if (!guestBookingInfo.name.trim())  e.guestName  = t.required;
      if (!guestBookingInfo.email.trim()) e.guestEmail = t.required;
      if (!guestBookingInfo.phone.trim()) e.guestPhone = t.required;
    }
    return e;
  };

  /* ── Submit ── */
  const handleSubmit = async (ev) => {
    if (ev) ev.preventDefault();
    if (!guestInfo) return;
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstEl = document.querySelector('[data-error="true"]');
      if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const bookingData = {
        hotelBooking: {
          PreBooking: true,
          City: hotel.City?.toString() || '',
          Hotel: parseInt(hotel.Id),
          CheckIn: checkIn, CheckOut: checkOut,
          Option: [], Source: hotel.SearchData?.Source || 'local-2',
          Rooms: [{
            Id: room.Id?.toString() || room.RoomType,
            Boarding: boarding.Id?.toString() || boarding.Name,
            View: [], Supplement: [],
            Pax: {
              Adult: guestInfo.adults.map(a => ({ Civility: a.civility, Name: a.name, Surname: a.surname, Holder: a.holder })),
              ...(guestInfo.children.length > 0 && {
                Child: guestInfo.children.map(c => ({ Name: c.name, Surname: c.surname, Age: c.age.toString() }))
              })
            }
          }]
        },
        paymentMethod,
        ...(paymentMethod === 'online' && { paymentPlan }),
        totalPrice: parseFloat(totalPrice),
        notes,
      };

      if (!isLoggedIn) {
        bookingData.guestInfo = {
          name: guestBookingInfo.name, email: guestBookingInfo.email, phone: guestBookingInfo.phone,
          ...(guestBookingInfo.country && { country: guestBookingInfo.country }),
          ...(guestBookingInfo.address && { address: guestBookingInfo.address }),
        };
      } else {
        if (contactInfo.email) bookingData.contactEmail = contactInfo.email;
        if (contactInfo.phone) bookingData.contactPhone = contactInfo.phone;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (paymentMethod === 'online') {
        const { initiatePayment } = await import('../services/paymentService');
        try {
          const { payUrl, paymentRef } = await initiatePayment(bookingData);
          localStorage.setItem('pendingPaymentRef', paymentRef);
          window.location.href = payUrl;
          return;
        } catch (pErr) {
          alert(language === 'fr' ? `Erreur paiement: ${pErr.message}` : `Payment error: ${pErr.message}`);
          setLoading(false); return;
        }
      }

      const res  = await fetch(API_ENDPOINTS.BOOKINGS, { method: 'POST', headers, credentials: 'include', body: JSON.stringify(bookingData) });
      const data = await res.json();

      if (data.status === 'success') {
        if (!isLoggedIn && data.data?.booking?._id) {
          localStorage.setItem('guestBookingId', data.data.booking._id);
          localStorage.setItem('guestBookingEmail', guestBookingInfo.email);
        }
        navigate('/booking-confirmation', { state: { booking: data.data.booking, paymentMethod, isGuest: !isLoggedIn } });
      } else {
        alert(data.message || (language === 'fr' ? 'Une erreur est survenue' : 'An error occurred'));
      }
    } catch (_) {
      alert(language === 'fr' ? 'Erreur de connexion. Réessayez.' : language === 'ar' ? 'خطأ في الاتصال.' : 'Connection error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString(
      language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : 'en-US',
      { day: 'numeric', month: 'short', year: 'numeric' }
    ) : '';

  const t = {
    required:  language === 'fr' ? 'Champ requis' : language === 'ar' ? 'حقل مطلوب' : 'Required',
    back:      language === 'fr' ? 'Retour'       : language === 'ar' ? 'رجوع'      : 'Back',
    pageTitle: language === 'fr' ? 'Finaliser la réservation' : language === 'ar' ? 'إتمام الحجز' : 'Complete Booking',
    nightsLbl: language === 'fr' ? (nights > 1 ? 'nuits' : 'nuit') : language === 'ar' ? 'ليالي' : (nights > 1 ? 'nights' : 'night'),
  };

  if (!guestInfo) return null;

  /* ── Summary row helper ── */
  const Row = ({ label, value }) => (
    <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-800 text-right">{value}</span>
    </div>
  );

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Sticky sub-nav ── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 relative">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">

          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft size={15} className={isRTL ? 'rotate-180' : ''} />
            <span className="font-medium">{t.back}</span>
          </button>

          <h1 className="text-sm font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">{t.pageTitle}</h1>

          {/* Spacer to balance back button */}
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">

        {/* Guest notice */}
        {!isLoggedIn && (
          <div className={`mb-5 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Info size={15} className="text-primary-600 flex-shrink-0" />
            <p className="text-sm text-primary-800">
              {language === 'fr' ? "Réservation en tant qu'invité. " : language === 'ar' ? 'الحجز كضيف. ' : 'Booking as a guest. '}
              <button
                onClick={() => { sessionStorage.setItem('pendingBooking', JSON.stringify(state)); navigate('/login'); }}
                className="font-semibold underline underline-offset-2 hover:text-primary-900"
              >
                {language === 'fr' ? 'Se connecter' : language === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </button>
              {language === 'fr' ? ' pour gérer vos réservations.' : language === 'ar' ? ' لإدارة حجوزاتك.' : ' to manage your bookings.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ═══ LEFT — Summary ═══ */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden lg:sticky lg:top-[60px]">

              {/* Hotel image */}
              {hotel.Image && (
                <div className="relative h-40 overflow-hidden">
                  <img src={hotel.Image} alt={hotel.Name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {starRating > 0 && (
                      <div className="flex items-center gap-0.5 mb-1">
                        {Array.from({ length: starRating }).map((_, i) => (
                          <Star key={i} size={11} className="fill-secondary-400 text-secondary-400" />
                        ))}
                      </div>
                    )}
                    <p className="text-white font-semibold text-sm leading-tight line-clamp-2">{hotel.Name}</p>
                    {cityName && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-white/70" />
                        <p className="text-white/80 text-xs">{cityName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-5 space-y-4">

                {/* Hotel name (no image fallback) */}
                {!hotel.Image && (
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{hotel.Name}</p>
                    {cityName && (
                      <div className={`flex items-center gap-1 mt-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <MapPin size={11} className="text-gray-400" />
                        <p className="text-xs text-gray-500">{cityName}</p>
                      </div>
                    )}
                    {starRating > 0 && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: starRating }).map((_, i) => (
                          <Star key={i} size={11} className="fill-secondary-400 text-secondary-400" />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Nights badge */}
                <div className={`inline-flex items-center gap-1.5 bg-primary-50 border border-primary-100 text-primary-700 rounded-lg px-3 py-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Moon size={12} />
                  <span className="text-xs font-semibold">{nights} {t.nightsLbl}</span>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: language === 'fr' ? 'Arrivée'  : language === 'ar' ? 'الوصول'    : 'Check-in',  val: fmt(checkIn)  },
                    { label: language === 'fr' ? 'Départ'   : language === 'ar' ? 'المغادرة'  : 'Check-out', val: fmt(checkOut) },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                      <p className="text-xs font-semibold text-gray-800 mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <Row
                    label={language === 'fr' ? 'Chambre'   : language === 'ar' ? 'الغرفة'     : 'Room'}
                    value={room.Name || room.RoomType}
                  />
                  <Row
                    label={language === 'fr' ? 'Pension'   : language === 'ar' ? 'الإقامة'    : 'Board'}
                    value={`${boarding.Code || boarding.Name}${boarding.Code && boarding.Name ? ` · ${boarding.Name}` : ''}`}
                  />
                  <Row
                    label={language === 'fr' ? 'Voyageurs' : language === 'ar' ? 'المسافرون'  : 'Guests'}
                    value={`${adults} ${language === 'fr' ? 'adulte(s)' : language === 'ar' ? 'بالغ' : 'adult(s)'}${children > 0 ? ` · ${children} ${language === 'fr' ? 'enfant(s)' : language === 'ar' ? 'طفل' : 'child(ren)'}` : ''}`}
                  />
                </div>

                {/* Total */}
                <div className={`flex items-center justify-between pt-3 border-t border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <p className="text-xs text-gray-400">
                      {Math.round(pricePerNight)} {currency} × {nights} {t.nightsLbl}
                    </p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">Total</p>
                  </div>
                  <p className="text-xl font-bold text-primary-700" dir="ltr">
                    {totalPrice} <span className="text-sm font-medium">{currency}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Trust note */}
            <div className={`mt-3 flex items-start gap-2 text-xs text-gray-400 px-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Shield size={13} className="mt-0.5 flex-shrink-0" />
              <span>
                {language === 'fr' ? 'Réservation sécurisée — annulation gratuite selon conditions.' : language === 'ar' ? 'حجز آمن — إلغاء مجاني وفق الشروط.' : 'Secure booking — free cancellation per conditions.'}
              </span>
            </div>
          </div>

          {/* ═══ RIGHT — Form ═══ */}
          <div className="lg:col-span-2 order-2 lg:order-2">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* ─── 1. Travelers ─── */}
              <Section
                step="1"
                title={language === 'fr' ? 'Informations des voyageurs' : language === 'ar' ? 'معلومات المسافرين' : 'Traveler Information'}
                subtitle={language === 'fr' ? "Noms tels qu'ils apparaissent sur les pièces d'identité" : language === 'ar' ? 'الأسماء كما تظهر على وثائق الهوية' : 'Names as they appear on ID documents'}
              >
                <div className="space-y-3">

                  {/* Adults */}
                  {guestInfo.adults.map((adult, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50/50"
                      data-error={!!(errors[`adult_${idx}_name`] || errors[`adult_${idx}_surname`]) || undefined}
                    >
                      <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-semibold text-gray-700">
                          {language === 'fr' ? `Adulte ${idx + 1}` : language === 'ar' ? `البالغ ${idx + 1}` : `Adult ${idx + 1}`}
                        </span>
                        <label className={`flex items-center gap-1.5 cursor-pointer select-none ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <input
                            type="checkbox"
                            checked={adult.holder}
                            onChange={() => handleAdultChange(idx, 'holder', true)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                          <span className="text-xs text-gray-500">
                            {language === 'fr' ? 'Titulaire' : language === 'ar' ? 'صاحب الحجز' : 'Holder'}
                          </span>
                          {adult.holder && <CheckCircle size={12} className="text-primary-600" />}
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label={language === 'fr' ? 'Civilité' : language === 'ar' ? 'اللقب' : 'Title'}>
                          <select
                            value={adult.civility}
                            onChange={e => handleAdultChange(idx, 'civility', e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 hover:border-gray-400 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600 bg-white"
                          >
                            <option value="Mr">Mr</option>
                            <option value="Ms">Ms</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Mde">Mde</option>
                          </select>
                        </Field>

                        <Field
                          label={language === 'fr' ? 'Prénom' : language === 'ar' ? 'الاسم الأول' : 'First Name'}
                          required
                          error={errors[`adult_${idx}_name`]}
                        >
                          <input
                            type="text"
                            value={adult.name}
                            placeholder={language === 'fr' ? 'Mohamed' : language === 'ar' ? 'محمد' : 'John'}
                            onChange={e => handleAdultChange(idx, 'name', e.target.value)}
                            dir={isRTL ? 'rtl' : 'ltr'}
                            className={inputCls(errors[`adult_${idx}_name`])}
                          />
                        </Field>

                        <Field
                          label={language === 'fr' ? 'Nom de famille' : language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                          required
                          error={errors[`adult_${idx}_surname`]}
                        >
                          <input
                            type="text"
                            value={adult.surname}
                            placeholder={language === 'fr' ? 'Ben Ali' : language === 'ar' ? 'بن علي' : 'Smith'}
                            onChange={e => handleAdultChange(idx, 'surname', e.target.value)}
                            dir={isRTL ? 'rtl' : 'ltr'}
                            className={inputCls(errors[`adult_${idx}_surname`])}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}

                  {/* Children */}
                  {guestInfo.children.map((child, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                      <span className="block text-xs font-semibold text-gray-700 mb-3">
                        {language === 'fr' ? `Enfant ${idx + 1}` : language === 'ar' ? `الطفل ${idx + 1}` : `Child ${idx + 1}`}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label={language === 'fr' ? 'Prénom' : language === 'ar' ? 'الاسم الأول' : 'First Name'} required error={errors[`child_${idx}_name`]}>
                          <input type="text" value={child.name} onChange={e => handleChildChange(idx, 'name', e.target.value)} dir={isRTL ? 'rtl' : 'ltr'} className={inputCls(errors[`child_${idx}_name`])} />
                        </Field>
                        <Field label={language === 'fr' ? 'Nom' : language === 'ar' ? 'اسم العائلة' : 'Last Name'} required error={errors[`child_${idx}_surname`]}>
                          <input type="text" value={child.surname} onChange={e => handleChildChange(idx, 'surname', e.target.value)} dir={isRTL ? 'rtl' : 'ltr'} className={inputCls(errors[`child_${idx}_surname`])} />
                        </Field>
                        <Field label={language === 'fr' ? 'Âge (0–17)' : language === 'ar' ? 'العمر (0–17)' : 'Age (0–17)'} required>
                          <input type="number" value={child.age} onChange={e => handleChildChange(idx, 'age', e.target.value)} min="0" max="17" dir="ltr" className={inputCls()} />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* ─── 2. Contact ─── */}
              <Section
                step="2"
                title={language === 'fr' ? 'Informations de contact' : language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                subtitle={language === 'fr' ? 'Pour recevoir votre confirmation de réservation' : language === 'ar' ? 'لاستلام تأكيد حجزك' : 'To receive your booking confirmation'}
              >
                {!isLoggedIn ? (
                  <div className="space-y-4">
                    <Field
                      label={language === 'fr' ? 'Nom complet' : language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      required
                      error={errors.guestName}
                    >
                      <div className="relative">
                        <User size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
                        <input
                          type="text"
                          value={guestBookingInfo.name}
                          onChange={e => { setGuestBookingInfo({ ...guestBookingInfo, name: e.target.value }); if (errors.guestName) setErrors(er => { const n = { ...er }; delete n.guestName; return n; }); }}
                          placeholder={language === 'fr' ? 'Votre nom complet' : language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                          dir={isRTL ? 'rtl' : 'ltr'}
                          className={`${inputCls(errors.guestName)} ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                        />
                      </div>
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Email" required error={errors.guestEmail}>
                        <div className="relative">
                          <Mail size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
                          <input
                            type="email"
                            value={guestBookingInfo.email}
                            onChange={e => { setGuestBookingInfo({ ...guestBookingInfo, email: e.target.value }); if (errors.guestEmail) setErrors(er => { const n = { ...er }; delete n.guestEmail; return n; }); }}
                            placeholder="email@example.com"
                            dir="ltr"
                            className={`${inputCls(errors.guestEmail)} ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                          />
                        </div>
                      </Field>
                      <Field
                        label={language === 'fr' ? 'Téléphone' : language === 'ar' ? 'الهاتف' : 'Phone'}
                        required
                        error={errors.guestPhone}
                      >
                        <div className="relative">
                          <Phone size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
                          <input
                            type="tel"
                            value={guestBookingInfo.phone}
                            onChange={e => { setGuestBookingInfo({ ...guestBookingInfo, phone: e.target.value }); if (errors.guestPhone) setErrors(er => { const n = { ...er }; delete n.guestPhone; return n; }); }}
                            placeholder="+216 XX XXX XXX"
                            dir="ltr"
                            className={`${inputCls(errors.guestPhone)} ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                          />
                        </div>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label={`${language === 'fr' ? 'Pays' : language === 'ar' ? 'البلد' : 'Country'} (${language === 'fr' ? 'optionnel' : language === 'ar' ? 'اختياري' : 'optional'})`}>
                        <input type="text" value={guestBookingInfo.country} onChange={e => setGuestBookingInfo({ ...guestBookingInfo, country: e.target.value })} placeholder={language === 'fr' ? 'Tunisie' : language === 'ar' ? 'تونس' : 'Tunisia'} dir={isRTL ? 'rtl' : 'ltr'} className={inputCls()} />
                      </Field>
                      <Field label={`${language === 'fr' ? 'Adresse' : language === 'ar' ? 'العنوان' : 'Address'} (${language === 'fr' ? 'optionnel' : language === 'ar' ? 'اختياري' : 'optional'})`}>
                        <input type="text" value={guestBookingInfo.address} onChange={e => setGuestBookingInfo({ ...guestBookingInfo, address: e.target.value })} placeholder={language === 'fr' ? 'Votre adresse' : language === 'ar' ? 'عنوانك' : 'Your address'} dir={isRTL ? 'rtl' : 'ltr'} className={inputCls()} />
                      </Field>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-2.5 bg-primary-50 border border-primary-100 rounded-xl p-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle2 size={15} className="text-primary-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-primary-900">
                          {language === 'fr' ? 'Vous êtes connecté' : language === 'ar' ? 'أنت متصل' : 'You are logged in'}
                        </p>
                        <p className="text-xs text-primary-600 mt-0.5">
                          {language === 'fr' ? 'Vos informations sont utilisées automatiquement.' : language === 'ar' ? 'معلوماتك تُستخدم تلقائياً.' : 'Your information is used automatically.'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {language === 'fr' ? 'Modifier le contact (optionnel)' : language === 'ar' ? 'تعديل بيانات الاتصال (اختياري)' : 'Update contact (optional)'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Email">
                        <div className="relative">
                          <Mail size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
                          <input type="email" value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} dir="ltr" className={`${inputCls()} ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`} />
                        </div>
                      </Field>
                      <Field label={language === 'fr' ? 'Téléphone' : language === 'ar' ? 'الهاتف' : 'Phone'}>
                        <div className="relative">
                          <Phone size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
                          <input type="tel" value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} dir="ltr" className={`${inputCls()} ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`} />
                        </div>
                      </Field>
                    </div>
                  </div>
                )}
              </Section>

              {/* ─── 3. Payment ─── */}
              <Section
                step="3"
                title={language === 'fr' ? 'Mode de paiement' : language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                subtitle={language === 'fr' ? 'Choisissez comment vous souhaitez payer' : language === 'ar' ? 'اختر كيف تريد الدفع' : 'Choose how you would like to pay'}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* Easy2Book Agency */}
                  {(() => {
                    const active = paymentMethod === 'agency';
                    return (
                      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${active ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <input type="radio" name="payment" value="agency" checked={active} onChange={() => setPaymentMethod('agency')} className="sr-only" />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${active ? 'bg-primary-700' : 'bg-primary-50'}`}>
                          <Building2 size={18} className={active ? 'text-white' : 'text-primary-600'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <p className="text-sm font-semibold text-gray-900">
                              {language === 'fr' ? 'Agence Easy2Book' : language === 'ar' ? 'وكالة Easy2Book' : 'Easy2Book Agency'}
                            </p>
                            {active && <CheckCircle2 size={14} className="text-primary-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {language === 'fr' ? 'Payez dans notre agence la plus proche' : language === 'ar' ? 'ادفع في أقرب وكالة Easy2Book' : 'Pay at your nearest Easy2Book branch'}
                          </p>
                        </div>
                      </label>
                    );
                  })()}

                  {/* Wafacash */}
                  {(() => {
                    const active = paymentMethod === 'wafacash';
                    return (
                      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${active ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-200'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <input type="radio" name="payment" value="wafacash" checked={active} onChange={() => setPaymentMethod('wafacash')} className="sr-only" />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden ${active ? 'bg-orange-500' : 'bg-orange-50'}`}>
                          {/* Wafacash logo */}
                          <svg viewBox="0 0 40 40" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="6" fill={active ? '#EA6913' : '#EA6913'} />
                            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial,sans-serif">WC</text>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <p className="text-sm font-semibold text-gray-900">Wafacash</p>
                            {active && <CheckCircle2 size={14} className="text-orange-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {language === 'fr' ? 'Paiement en espèces chez un point Wafacash' : language === 'ar' ? 'الدفع نقداً في نقطة Wafacash' : 'Cash payment at any Wafacash point'}
                          </p>
                        </div>
                      </label>
                    );
                  })()}

                  {/* Izi */}
                  {(() => {
                    const active = paymentMethod === 'izi';
                    return (
                      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${active ? 'border-violet-500 bg-violet-50' : 'border-gray-200 bg-white hover:border-violet-200'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <input type="radio" name="payment" value="izi" checked={active} onChange={() => setPaymentMethod('izi')} className="sr-only" />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden`}>
                          {/* Izi logo */}
                          <svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="6" fill="#6D28D9" />
                            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial,sans-serif">izi</text>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <p className="text-sm font-semibold text-gray-900">Izi</p>
                            {active && <CheckCircle2 size={14} className="text-violet-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {language === 'fr' ? 'Paiement en espèces chez un point Izi' : language === 'ar' ? 'الدفع نقداً في نقطة Izi' : 'Cash payment at any Izi point'}
                          </p>
                        </div>
                      </label>
                    );
                  })()}

                  {/* Online Payment */}
                  {(() => {
                    const active = paymentMethod === 'online';
                    return (
                      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${active ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <input type="radio" name="payment" value="online" checked={active} onChange={() => setPaymentMethod('online')} className="sr-only" />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${active ? 'bg-primary-700' : 'bg-gray-100'}`}>
                          <CreditCard size={18} className={active ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <p className="text-sm font-semibold text-gray-900">
                              {language === 'fr' ? 'Paiement en ligne' : language === 'ar' ? 'الدفع عبر الإنترنت' : 'Online Payment'}
                            </p>
                            {active && <CheckCircle2 size={14} className="text-primary-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {language === 'fr' ? 'Paiement sécurisé par carte bancaire' : language === 'ar' ? 'دفع آمن ببطاقة بنكية' : 'Secure credit/debit card payment'}
                          </p>
                        </div>
                      </label>
                    );
                  })()}

                </div>

                {/* Online payment plan sub-option */}
                {paymentMethod === 'online' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-xs font-semibold text-blue-800 mb-3">
                      {language === 'fr' ? 'Comment souhaitez-vous régler ?' : language === 'ar' ? 'كيف تريد الدفع؟' : 'How would you like to pay?'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentPlan('full')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-center ${paymentPlan === 'full' ? 'border-primary-600 bg-white shadow-sm' : 'border-transparent bg-white/60 hover:bg-white'}`}
                      >
                        <Shield size={16} className={paymentPlan === 'full' ? 'text-primary-600' : 'text-gray-400'} />
                        <span className={`text-xs font-bold ${paymentPlan === 'full' ? 'text-primary-700' : 'text-gray-600'}`}>
                          {language === 'fr' ? 'Paiement total' : language === 'ar' ? 'الدفع الكامل' : 'Full Payment'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {language === 'fr' ? 'Montant complet' : language === 'ar' ? 'المبلغ كاملاً' : 'Pay full amount'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentPlan('installment')}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-center ${paymentPlan === 'installment' ? 'border-primary-600 bg-white shadow-sm' : 'border-transparent bg-white/60 hover:bg-white'}`}
                      >
                        <Calendar size={16} className={paymentPlan === 'installment' ? 'text-primary-600' : 'text-gray-400'} />
                        <span className={`text-xs font-bold ${paymentPlan === 'installment' ? 'text-primary-700' : 'text-gray-600'}`}>
                          {language === 'fr' ? 'En tranches' : language === 'ar' ? 'على أقساط' : 'Installments'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {language === 'fr' ? 'Paiement échelonné' : language === 'ar' ? 'دفع مقسّط' : 'Split the payment'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

              </Section>

              {/* ─── 4. Special Requests ─── */}
              <Section
                step="4"
                title={language === 'fr' ? 'Demandes spéciales' : language === 'ar' ? 'طلبات خاصة' : 'Special Requests'}
                subtitle={language === 'fr' ? 'Non garanties — selon disponibilité' : language === 'ar' ? 'غير مضمونة — حسب التوفر' : 'Not guaranteed — subject to availability'}
              >
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder={
                    language === 'fr' ? 'Ex: Chambre en étage élevé, vue mer, arrivée tardive...'
                    : language === 'ar' ? 'مثال: غرفة في طابق عالٍ، إطلالة على البحر، وصول متأخر...'
                    : 'E.g., High floor, sea view, late check-in...'
                  }
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 hover:border-gray-400 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-600 resize-none outline-none transition-colors"
                />
              </Section>

              {/* ─── Mobile summary accordion ─── */}
              <div className="lg:hidden bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowMobileSummary(v => !v)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {hotel.Image
                        ? <img src={hotel.Image} alt="" className="w-full h-full object-cover" />
                        : <Home size={14} className="text-gray-400 m-2.5" />
                      }
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{hotel.Name}</p>
                      <p className="text-xs text-gray-400">{nights} {t.nightsLbl}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-bold text-primary-700" dir="ltr">{totalPrice} {currency}</span>
                    {showMobileSummary ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </div>
                </button>
                {showMobileSummary && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{language === 'fr' ? 'Arrivée' : language === 'ar' ? 'الوصول' : 'Check-in'}</p>
                        <p className="text-xs font-semibold text-gray-800 mt-0.5">{fmt(checkIn)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{language === 'fr' ? 'Départ' : language === 'ar' ? 'المغادرة' : 'Check-out'}</p>
                        <p className="text-xs font-semibold text-gray-800 mt-0.5">{fmt(checkOut)}</p>
                      </div>
                    </div>
                    <Row label={language === 'fr' ? 'Chambre' : language === 'ar' ? 'الغرفة' : 'Room'} value={room.Name || room.RoomType} />
                    <Row label={language === 'fr' ? 'Pension' : language === 'ar' ? 'الإقامة' : 'Board'} value={boarding.Code || boarding.Name} />
                  </div>
                )}
              </div>

              {/* ─── Submit ─── */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2
                  ${loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-700 hover:bg-primary-800 text-white'
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{language === 'fr' ? 'Traitement en cours...' : language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    {paymentMethod === 'online' ? <Shield size={16} /> : <CheckCircle2 size={16} />}
                    <span>
                      {paymentMethod === 'online'
                        ? (language === 'fr'
                            ? `Payer en ligne${paymentPlan === 'installment' ? ' (tranches)' : ''}`
                            : language === 'ar'
                              ? `ادفع الآن${paymentPlan === 'installment' ? ' (أقساط)' : ''}`
                              : `Pay Online${paymentPlan === 'installment' ? ' (installments)' : ''}`)
                        : paymentMethod === 'wafacash'
                          ? (language === 'fr' ? 'Confirmer — payer via Wafacash' : language === 'ar' ? 'تأكيد — الدفع عبر Wafacash' : 'Confirm — Pay via Wafacash')
                          : paymentMethod === 'izi'
                            ? (language === 'fr' ? 'Confirmer — payer via Izi' : language === 'ar' ? 'تأكيد — الدفع عبر Izi' : 'Confirm — Pay via Izi')
                            : (language === 'fr' ? 'Confirmer la réservation' : language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking')
                      }
                    </span>
                    <span className="font-normal opacity-70">— {totalPrice} {currency}</span>
                  </>
                )}
              </button>

              {/* Trust row */}
              <div className={`flex flex-wrap items-center justify-center gap-4 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {[
                  { icon: Shield,       text: language === 'fr' ? 'Paiement sécurisé'        : language === 'ar' ? 'دفع آمن'       : 'Secure payment'        },
                  { icon: CheckCircle2, text: language === 'fr' ? 'Confirmation instantanée'  : language === 'ar' ? 'تأكيد فوري'   : 'Instant confirmation'  },
                  { icon: Calendar,     text: language === 'fr' ? 'Annulation gratuite'       : language === 'ar' ? 'إلغاء مجاني'  : 'Free cancellation'     },
                ].map(({ icon: Ic, text }) => (
                  <div key={text} className={`flex items-center gap-1.5 text-xs text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Ic size={12} className="text-gray-400" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HotelBooking;
