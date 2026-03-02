import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, MapPin, CheckCircle, ChevronLeft, ChevronRight,
  Phone, Mail, CreditCard, MessageSquare, AlertCircle, Check,
  Plane, Star, RefreshCw
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { useLanguage } from '../context/LanguageContext';

const defaultImage = 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=800&q=80';

const T = {
  fr: {
    back: 'Retour aux offres',
    duration: 'Durée', departure: 'Départ', return: 'Retour', spots: 'Places',
    days: 'jours', remaining: 'restantes',
    description: 'Description',
    included: 'Inclus', excluded: 'Non inclus',
    program: 'Programme',
    day: 'J',
    bookTitle: 'Réserver cette offre',
    pricePerPerson: 'Prix par personne',
    departureFrom: 'Départ de',
    fullName: 'Nom complet', fullNamePh: 'Ahmed Ben Ali',
    email: 'Email', emailPh: 'ahmed@example.com',
    phone: 'Téléphone', phonePh: '+216 XX XXX XXX',
    nationalId: 'CIN / Passeport', nationalIdPh: 'Ex: 12345678',
    people: 'Nombre de personnes',
    message: 'Message (optionnel)', messagePh: 'Questions ou demandes particulières...',
    priceSummary: (price, n) => `${price?.toLocaleString()} TND × ${n} pers.`,
    priceNote: 'Prix indicatif — confirmé à réception',
    submit: 'Envoyer ma demande de réservation',
    submitting: 'Envoi en cours...',
    full: 'Complet',
    required: '*',
    errFullName: 'Le nom complet est requis',
    errEmail: 'Email invalide',
    errPhone: 'Le numéro de téléphone est requis',
    errNationalId: 'CIN ou numéro de passeport requis',
    errPeople: (max) => `Entre 1 et ${max} personnes`,
    errGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    errConnection: 'Erreur de connexion. Veuillez réessayer.',
    errLoad: 'Offre introuvable.',
    loading: 'Chargement de l\'offre...',
    notFound: 'Offre introuvable',
    successTitle: 'Demande envoyée !',
    successDesc: 'Votre demande de réservation a été reçue. Notre équipe vous contactera dans les plus brefs délais.',
    confirmCode: 'Code de confirmation',
    labelName: 'Nom', labelEmail: 'Email', labelPeople: 'Nombre de personnes', labelStatus: 'Statut',
    statusPending: 'En attente de confirmation',
    keepCode: 'Conservez votre code de confirmation. Vous serez contacté par email ou téléphone.',
    backToOffers: 'Retour aux offres',
    featured: 'Vedette',
  },
  ar: {
    back: 'العودة إلى العروض',
    duration: 'المدة', departure: 'المغادرة', return: 'العودة', spots: 'المقاعد',
    days: 'أيام', remaining: 'متبقية',
    description: 'الوصف',
    included: 'مشمول', excluded: 'غير مشمول',
    program: 'البرنامج',
    day: 'ي',
    bookTitle: 'احجز هذا العرض',
    pricePerPerson: 'السعر للشخص',
    departureFrom: 'المغادرة من',
    fullName: 'الاسم الكامل', fullNamePh: 'أحمد بن علي',
    email: 'البريد الإلكتروني', emailPh: 'ahmed@example.com',
    phone: 'الهاتف', phonePh: '+216 XX XXX XXX',
    nationalId: 'بطاقة هوية / جواز سفر', nationalIdPh: 'مثال: 12345678',
    people: 'عدد الأشخاص',
    message: 'رسالة (اختياري)', messagePh: 'أسئلة أو طلبات خاصة...',
    priceSummary: (price, n) => `${price?.toLocaleString()} TND × ${n} أشخاص`,
    priceNote: 'سعر إرشادي — يُؤكد عند الاستلام',
    submit: 'إرسال طلب الحجز',
    submitting: 'جاري الإرسال...',
    full: 'مكتمل',
    required: '*',
    errFullName: 'الاسم الكامل مطلوب',
    errEmail: 'البريد الإلكتروني غير صالح',
    errPhone: 'رقم الهاتف مطلوب',
    errNationalId: 'بطاقة الهوية أو جواز السفر مطلوب',
    errPeople: (max) => `بين 1 و ${max} أشخاص`,
    errGeneric: 'حدث خطأ. يرجى المحاولة مجدداً.',
    errConnection: 'خطأ في الاتصال. يرجى المحاولة مجدداً.',
    errLoad: 'العرض غير موجود.',
    loading: 'جاري تحميل العرض...',
    notFound: 'العرض غير موجود',
    successTitle: 'تم إرسال الطلب!',
    successDesc: 'تم استلام طلب حجزك. سيتصل بك فريقنا في أقرب وقت ممكن.',
    confirmCode: 'رمز التأكيد',
    labelName: 'الاسم', labelEmail: 'البريد', labelPeople: 'عدد الأشخاص', labelStatus: 'الحالة',
    statusPending: 'في انتظار التأكيد',
    keepCode: 'احتفظ برمز التأكيد. سيتم التواصل معك عبر البريد الإلكتروني أو الهاتف.',
    backToOffers: 'العودة إلى العروض',
    featured: 'مميز',
  },
  en: {
    back: 'Back to offers',
    duration: 'Duration', departure: 'Departure', return: 'Return', spots: 'Spots',
    days: 'days', remaining: 'remaining',
    description: 'Description',
    included: 'Included', excluded: 'Not included',
    program: 'Program',
    day: 'D',
    bookTitle: 'Book this offer',
    pricePerPerson: 'Price per person',
    departureFrom: 'Departing from',
    fullName: 'Full name', fullNamePh: 'Ahmed Ben Ali',
    email: 'Email', emailPh: 'ahmed@example.com',
    phone: 'Phone', phonePh: '+216 XX XXX XXX',
    nationalId: 'ID / Passport', nationalIdPh: 'e.g. 12345678',
    people: 'Number of people',
    message: 'Message (optional)', messagePh: 'Questions or special requests...',
    priceSummary: (price, n) => `${price?.toLocaleString()} TND × ${n} pax`,
    priceNote: 'Indicative price — confirmed upon receipt',
    submit: 'Send booking request',
    submitting: 'Sending...',
    full: 'Full',
    required: '*',
    errFullName: 'Full name is required',
    errEmail: 'Invalid email',
    errPhone: 'Phone number is required',
    errNationalId: 'ID or passport number is required',
    errPeople: (max) => `Between 1 and ${max} people`,
    errGeneric: 'An error occurred. Please try again.',
    errConnection: 'Connection error. Please try again.',
    errLoad: 'Offer not found.',
    loading: 'Loading offer...',
    notFound: 'Offer not found',
    successTitle: 'Request sent!',
    successDesc: 'Your booking request has been received. Our team will contact you shortly.',
    confirmCode: 'Confirmation code',
    labelName: 'Name', labelEmail: 'Email', labelPeople: 'Number of people', labelStatus: 'Status',
    statusPending: 'Pending confirmation',
    keepCode: 'Keep your confirmation code. You will be contacted by email or phone.',
    backToOffers: 'Back to offers',
    featured: 'Featured',
  }
};

const CATEGORY_LABELS = {
  fr: { umrah: 'Omra', hajj: 'Hajj', umrah_plus: 'Omra Plus' },
  ar: { umrah: 'عمرة', hajj: 'حج', umrah_plus: 'عمرة بلس' },
  en: { umrah: 'Umrah', hajj: 'Hajj', umrah_plus: 'Umrah Plus' },
};

const fmt = (d, lang) => {
  if (!d) return '—';
  const locale = lang === 'ar' ? 'ar-TN' : lang === 'en' ? 'en-GB' : 'fr-TN';
  return new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
};

const OmraBooking = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { language } = useLanguage();
  const isRTL       = language === 'ar';
  const t           = T[language] || T.fr;
  const catLabels   = CATEGORY_LABELS[language] || CATEGORY_LABELS.fr;

  const [offer,       setOffer]       = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(true);
  const [offerError,  setOfferError]  = useState(null);

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', nationalId: '', numberOfPeople: 1, message: ''
  });
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res  = await fetch(API_ENDPOINTS.OMRA_OFFER_DETAIL(id));
        const data = await res.json();
        if (data.status === 'success') setOffer(data.data);
        else setOfferError(t.errLoad);
      } catch {
        setOfferError(t.errConnection);
      } finally {
        setLoadingOffer(false);
      }
    };
    fetchOffer();
  }, [id]); // eslint-disable-line

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = t.errFullName;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.errEmail;
    if (!form.phone.trim()) e.phone = t.errPhone;
    if (!form.nationalId.trim()) e.nationalId = t.errNationalId;
    if (form.numberOfPeople < 1 || form.numberOfPeople > (offer?.availableSpots || 1))
      e.numberOfPeople = t.errPeople(offer?.availableSpots || 1);
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res  = await fetch(API_ENDPOINTS.OMRA_RESERVE(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, numberOfPeople: parseInt(form.numberOfPeople) })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') setReservation(data.data);
      else setErrors({ submit: data.message || t.errGeneric });
    } catch {
      setErrors({ submit: t.errConnection });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const iconPos   = isRTL ? 'right-3' : 'left-3';
  const inputPad  = isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4';
  const BackIcon  = isRTL ? ChevronRight : ChevronLeft;

  // ── SUCCESS STATE ──────────────────────────────────────────────
  if (reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-primary-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.successTitle}</h2>
          <p className="text-sm text-gray-500 mb-6">{t.successDesc}</p>

          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 mb-5 text-sm space-y-3">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-500">{t.confirmCode}</span>
              <span className="font-bold text-primary-700 text-base tracking-wide">{reservation.confirmationCode}</span>
            </div>
            <div className="border-t border-primary-100" />
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-500">{t.labelName}</span>
              <span className="font-medium text-gray-800">{reservation.fullName}</span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-500">{t.labelEmail}</span>
              <span className="font-medium text-gray-800">{reservation.email}</span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-500">{t.labelPeople}</span>
              <span className="font-medium text-gray-800">{reservation.numberOfPeople}</span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-500">{t.labelStatus}</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                {t.statusPending}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-6">{t.keepCode}</p>

          <button onClick={() => navigate('/omra')}
            className="w-full py-3 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-bold text-sm transition-colors">
            {t.backToOffers}
          </button>
        </div>
      </div>
    );
  }

  // ── LOADING ────────────────────────────────────────────────────
  if (loadingOffer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={26} className="animate-spin text-primary-600" />
          <p className="text-sm text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  // ── ERROR ──────────────────────────────────────────────────────
  if (offerError || !offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t.notFound}</h2>
          <p className="text-sm text-gray-400 mb-6">{offerError}</p>
          <button onClick={() => navigate('/omra')}
            className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-semibold transition-colors">
            {t.backToOffers}
          </button>
        </div>
      </div>
    );
  }

  const spotsLeft = offer.availableSpots ?? offer.capacity;

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <button onClick={() => navigate('/omra')}
            className={`flex items-center gap-2 text-sm text-gray-500 hover:text-primary-700 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
            <BackIcon size={16} />
            {t.back}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-8`}>

          {/* ── LEFT: Offer details ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Hero image */}
            <div className="relative rounded-2xl overflow-hidden h-60 border border-gray-100">
              <img src={offer.imageUrl || defaultImage} alt={offer.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = defaultImage; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} p-5 text-white`}>
                <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2 inline-block">
                  {catLabels[offer.category] || offer.category}
                </span>
                <h1 className="text-xl font-bold leading-tight">{offer.title}</h1>
              </div>
              {offer.isFeatured && (
                <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
                  <span className="bg-secondary-400 text-secondary-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> {t.featured}
                  </span>
                </div>
              )}
            </div>

            {/* Key facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Clock,    label: t.duration,   value: `${offer.duration} ${t.days}` },
                { icon: Calendar, label: t.departure,  value: fmt(offer.departureDate, language) },
                { icon: Plane,    label: t.return,     value: fmt(offer.returnDate, language) },
                { icon: Users,    label: t.spots,      value: `${spotsLeft} ${t.remaining}`, warn: spotsLeft <= 5 }
              ].map(({ icon: Icon, label, value, warn }) => (
                <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <Icon size={18} className={`mx-auto mb-1 ${warn ? 'text-orange-500' : 'text-primary-600'}`} />
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`text-sm font-semibold mt-0.5 ${warn ? 'text-orange-600' : 'text-gray-800'}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="text-base font-bold text-gray-800 mb-3">{t.description}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{offer.description}</p>
            </div>

            {/* Includes / Excludes */}
            {(offer.includes?.length > 0 || offer.excludes?.length > 0) && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {offer.includes?.length > 0 && (
                    <div>
                      <h3 className={`font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Check size={15} className="text-primary-600 flex-shrink-0" /> {t.included}
                      </h3>
                      <ul className="space-y-2">
                        {offer.includes.map((item, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Check size={13} className="text-primary-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {offer.excludes?.length > 0 && (
                    <div>
                      <h3 className={`font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <AlertCircle size={15} className="text-red-400 flex-shrink-0" /> {t.excluded}
                      </h3>
                      <ul className="space-y-2">
                        {offer.excludes.map((item, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="text-red-400 mt-0.5 flex-shrink-0 font-bold text-xs">✕</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Program */}
            {offer.plan?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h2 className="text-base font-bold text-gray-800 mb-4">{t.program}</h2>
                <div className="space-y-4">
                  {offer.plan.map((day) => (
                    <div key={day.day} className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-shrink-0 w-10 h-10 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">
                        {t.day}{day.day}
                      </div>
                      <div className={`flex-1 pb-4 border-b border-gray-100 last:border-0 ${isRTL ? 'text-right' : ''}`}>
                        <h4 className="font-semibold text-gray-800 text-sm">{day.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Booking form ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 space-y-4">

              {/* Price banner */}
              <div className="bg-primary-700 rounded-2xl p-5 text-white">
                <p className="text-primary-200 text-xs mb-1">{t.pricePerPerson}</p>
                <p className="text-3xl font-extrabold">
                  {offer.price?.toLocaleString()} <span className="text-lg font-medium">TND</span>
                </p>
                <div className={`mt-3 flex items-center gap-2 text-primary-200 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin size={13} />
                  <span>{t.departureFrom} {offer.departureCity || 'Tunis'}</span>
                </div>
              </div>

              {/* Form card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-base font-bold text-gray-800 mb-4">{t.bookTitle}</h3>

                {errors.submit && (
                  <div className={`bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">{errors.submit}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">

                  {/* Full name */}
                  <div>
                    <label className={`block text-xs font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                      {t.fullName} <span className="text-red-500">{t.required}</span>
                    </label>
                    <div className="relative">
                      <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                        placeholder={t.fullNamePh}
                        className={`w-full ${inputPad} py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                          errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`} />
                      <Users size={14} className={`absolute ${iconPos} top-3 text-gray-400`} />
                    </div>
                    {errors.fullName && <p className={`text-xs text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-xs font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                      {t.email} <span className="text-red-500">{t.required}</span>
                    </label>
                    <div className="relative">
                      <input type="email" name="email" value={form.email} onChange={handleChange}
                        placeholder={t.emailPh}
                        className={`w-full ${inputPad} py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`} />
                      <Mail size={14} className={`absolute ${iconPos} top-3 text-gray-400`} />
                    </div>
                    {errors.email && <p className={`text-xs text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={`block text-xs font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                      {t.phone} <span className="text-red-500">{t.required}</span>
                    </label>
                    <div className="relative">
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                        placeholder={t.phonePh}
                        className={`w-full ${inputPad} py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                          errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`} />
                      <Phone size={14} className={`absolute ${iconPos} top-3 text-gray-400`} />
                    </div>
                    {errors.phone && <p className={`text-xs text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{errors.phone}</p>}
                  </div>

                  {/* National ID */}
                  <div>
                    <label className={`block text-xs font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                      {t.nationalId} <span className="text-red-500">{t.required}</span>
                    </label>
                    <div className="relative">
                      <input type="text" name="nationalId" value={form.nationalId} onChange={handleChange}
                        placeholder={t.nationalIdPh}
                        className={`w-full ${inputPad} py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                          errors.nationalId ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`} />
                      <CreditCard size={14} className={`absolute ${iconPos} top-3 text-gray-400`} />
                    </div>
                    {errors.nationalId && <p className={`text-xs text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{errors.nationalId}</p>}
                  </div>

                  {/* Number of people */}
                  <div>
                    <label className={`block text-xs font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                      {t.people} <span className="text-red-500">{t.required}</span>
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button type="button"
                        onClick={() => handleChange({ target: { name: 'numberOfPeople', value: Math.max(1, form.numberOfPeople - 1) } })}
                        className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors">
                        −
                      </button>
                      <span className="flex-1 text-center font-semibold text-gray-800 py-2.5 text-sm">
                        {form.numberOfPeople}
                      </span>
                      <button type="button"
                        onClick={() => handleChange({ target: { name: 'numberOfPeople', value: Math.min(spotsLeft, form.numberOfPeople + 1) } })}
                        className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors">
                        +
                      </button>
                    </div>
                    {errors.numberOfPeople && <p className={`text-xs text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{errors.numberOfPeople}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className={`block text-xs font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                      {t.message}
                    </label>
                    <div className="relative">
                      <textarea name="message" value={form.message} onChange={handleChange}
                        placeholder={t.messagePh} rows={3}
                        className={`w-full ${inputPad} py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none`} />
                      <MessageSquare size={14} className={`absolute ${iconPos} top-3 text-gray-400`} />
                    </div>
                  </div>

                  {/* Price summary */}
                  <div className={`bg-primary-50 border border-primary-100 rounded-xl p-3 text-xs ${isRTL ? 'text-right' : ''}`}>
                    <div className={`flex justify-between text-gray-600 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{t.priceSummary(offer.price, form.numberOfPeople)}</span>
                      <span className="font-bold text-primary-800">
                        {(offer.price * form.numberOfPeople).toLocaleString()} TND
                      </span>
                    </div>
                    <p className="text-gray-400">{t.priceNote}</p>
                  </div>

                  <button type="submit" disabled={submitting || spotsLeft === 0}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      spotsLeft === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : submitting
                        ? 'bg-primary-400 text-white cursor-not-allowed'
                        : 'bg-primary-700 hover:bg-primary-800 text-white shadow-sm hover:shadow-md'
                    }`}>
                    {submitting ? (
                      <span className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.submitting}
                      </span>
                    ) : spotsLeft === 0 ? t.full : t.submit}
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OmraBooking;
