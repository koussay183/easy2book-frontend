import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Loader2, Calendar, DollarSign, Users,
  CheckCircle2, XCircle, AlertCircle, Clock, ArrowLeft,
  CreditCard, Building2, ChevronRight, RotateCcw, Phone, Mail
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';

/* ══════════════════════════════════════════════════════════════════════ */

const t = (fr, ar, en, language) =>
  language === 'fr' ? fr : language === 'ar' ? ar : en;

/* ── Status config ─────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    pill: 'bg-amber-100 text-amber-800',
    Icon: Clock,
    fr: 'En attente', ar: 'قيد الانتظار', en: 'Pending',
  },
  confirmed: {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    pill: 'bg-green-100 text-green-800',
    Icon: CheckCircle2,
    fr: 'Confirmée', ar: 'مؤكد', en: 'Confirmed',
  },
  cancelled: {
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    pill: 'bg-red-100 text-red-800',
    Icon: XCircle,
    fr: 'Annulée', ar: 'ملغى', en: 'Cancelled',
  },
  completed: {
    gradient: 'from-primary-600 to-primary-700',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-700',
    pill: 'bg-primary-100 text-primary-800',
    Icon: CheckCircle2,
    fr: 'Terminée', ar: 'مكتمل', en: 'Completed',
  },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { pill: 'bg-orange-100 text-orange-700', fr: 'Paiement en attente', ar: 'في انتظار الدفع', en: 'Payment pending' },
  paid:    { pill: 'bg-green-100 text-green-700',   fr: 'Payé',               ar: 'مدفوع',           en: 'Paid' },
  failed:  { pill: 'bg-red-100 text-red-700',       fr: 'Paiement échoué',    ar: 'فشل الدفع',       en: 'Payment failed' },
  refunded:{ pill: 'bg-blue-100 text-blue-700',     fr: 'Remboursé',          ar: 'مسترد',           en: 'Refunded' },
};

/* ══════════════════════════════════════════════════════════════════════ */

const GuestBookingLookup = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError]     = useState('');

  /* ── Lookup ────────────────────────────────────────────────────────── */
  const handleLookup = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const res  = await fetch(`${API_ENDPOINTS.BOOKINGS_DETAILS}/${trimmed}`);
      const data = await res.json();

      if (data.status === 'success' && data.data?.booking) {
        setBooking(data.data.booking);
      } else {
        setError(
          t('Réservation introuvable. Vérifiez le code et réessayez.',
            'الحجز غير موجود. تحقق من الرمز وأعد المحاولة.',
            'Booking not found. Check the code and try again.',
            language)
        );
      }
    } catch {
      setError(
        t('Erreur de connexion. Veuillez réessayer.',
          'خطأ في الاتصال. يرجى المحاولة لاحقاً.',
          'Connection error. Please try again.',
          language)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived values ────────────────────────────────────────────────── */
  const statusCfg  = booking ? (STATUS_CONFIG[booking.status]  || STATUS_CONFIG.pending)  : null;
  const paymentCfg = booking ? (PAYMENT_STATUS_CONFIG[booking.paymentStatus] || PAYMENT_STATUS_CONFIG.pending) : null;

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return d; }
  };

  const nights = (() => {
    if (!booking?.hotelBooking?.CheckIn || !booking?.hotelBooking?.CheckOut) return null;
    const n = Math.ceil(
      (new Date(booking.hotelBooking.CheckOut) - new Date(booking.hotelBooking.CheckIn)) / 86400000
    );
    return n > 0 ? n : null;
  })();

  /* ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8 transition-colors font-medium ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
          <span>{t('Retour à l\'accueil', 'العودة للرئيسية', 'Back to home', language)}</span>
        </button>

        {/* ── Header ──────────────────────────────────────────────────── */}
        {!booking && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
              <Search size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('Retrouvez votre réservation', 'ابحث عن حجزك', 'Find your booking', language)}
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t(
                'Entrez le code de confirmation reçu après votre réservation',
                'أدخل رمز التأكيد الذي تلقيته بعد الحجز',
                'Enter the confirmation code you received after booking',
                language
              )}
            </p>
          </div>
        )}

        {/* ── Input Card ──────────────────────────────────────────────── */}
        {!booking && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t('Code de confirmation', 'رمز التأكيد', 'Confirmation code', language)}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="BK-20260221-A7G9"
                  required
                  autoFocus
                  spellCheck={false}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-400 font-mono text-base tracking-widest text-center transition-colors"
                  dir="ltr"
                />
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  {t(
                    'Format : BK-AAAAAAAA-XXXX (indiqué dans votre email de confirmation)',
                    'الصيغة: BK-AAAAAAAA-XXXX (موجود في بريد التأكيد)',
                    'Format: BK-AAAAAAAA-XXXX (shown in your confirmation email)',
                    language
                  )}
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" />{t('Recherche...', 'جاري البحث...', 'Searching...', language)}</>
                ) : (
                  <><Search size={18} />{t('Trouver ma réservation', 'ابحث عن حجزي', 'Find my booking', language)}</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── Result Card ─────────────────────────────────────────────── */}
        {booking && statusCfg && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

            {/* Status Hero Banner */}
            <div className={`bg-gradient-to-r ${statusCfg.gradient} px-6 py-6 text-white`}>
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <statusCfg.Icon size={30} className="text-white" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-0.5">
                    {t('Statut de votre réservation', 'حالة حجزك', 'Booking status', language)}
                  </p>
                  <h2 className="text-2xl font-black text-white leading-tight">
                    {t(statusCfg.fr, statusCfg.ar, statusCfg.en, language)}
                  </h2>
                  <p className="text-white/60 text-xs font-mono mt-1" dir="ltr">
                    {booking.confirmationCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment status pill */}
            {paymentCfg && (
              <div className={`px-6 py-3 border-b border-gray-100 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CreditCard size={14} className="text-gray-400 flex-shrink-0" />
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${paymentCfg.pill}`}>
                  {t(paymentCfg.fr, paymentCfg.ar, paymentCfg.en, language)}
                </span>
                {booking.paymentMethod && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    {booking.paymentMethod === 'online'
                      ? <><CreditCard size={12} /> {t('En ligne', 'عبر الإنترنت', 'Online', language)}</>
                      : <><Building2 size={12} /> {t('À l\'agence', 'في الوكالة', 'At agency', language)}</>
                    }
                  </span>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5 space-y-5">

              {/* Guest greeting */}
              {(booking.guestInfo?.name || booking.contactEmail) && (
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Users size={18} className="text-primary-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-xs text-gray-400">
                      {t('Titulaire', 'صاحب الحجز', 'Booking holder', language)}
                    </p>
                    <p className="font-bold text-gray-900">
                      {booking.guestInfo?.name || booking.contactEmail}
                    </p>
                  </div>
                </div>
              )}

              {/* Dates */}
              {(booking.hotelBooking?.CheckIn || booking.hotelBooking?.CheckOut) && (
                <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar size={18} className="text-primary-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-xs text-gray-400 mb-1">
                      {t('Dates du séjour', 'تواريخ الإقامة', 'Stay dates', language)}
                    </p>
                    <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="font-bold text-gray-900 text-sm">
                        {formatDate(booking.hotelBooking.CheckIn)}
                      </span>
                      <ChevronRight size={14} className={`text-gray-400 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                      <span className="font-bold text-gray-900 text-sm">
                        {formatDate(booking.hotelBooking.CheckOut)}
                      </span>
                      {nights && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {nights} {t(nights > 1 ? 'nuits' : 'nuit', nights > 1 ? 'ليالي' : 'ليلة', nights > 1 ? 'nights' : 'night', language)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Price */}
              {booking.totalPrice && (
                <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <DollarSign size={18} className="text-primary-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-xs text-gray-400 mb-0.5">
                      {t('Prix total', 'السعر الإجمالي', 'Total price', language)}
                    </p>
                    <p className="text-2xl font-black text-gray-900 leading-none">
                      {parseFloat(booking.totalPrice).toLocaleString('fr-TN')}
                      <span className="text-base font-semibold text-primary-600 ml-1">TND</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Contact info (masked) */}
              {(booking.guestInfo?.email || booking.contactEmail || booking.guestInfo?.phone || booking.contactPhone) && (
                <div className={`pt-4 border-t border-gray-100 space-y-2 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t('Contact', 'معلومات الاتصال', 'Contact', language)}
                  </p>
                  {(booking.guestInfo?.email || booking.contactEmail) && (
                    <div className={`flex items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <span dir="ltr">{booking.guestInfo?.email || booking.contactEmail}</span>
                    </div>
                  )}
                  {(booking.guestInfo?.phone || booking.contactPhone) && (
                    <div className={`flex items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span dir="ltr">{booking.guestInfo?.phone || booking.contactPhone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status-specific message */}
              {booking.status === 'pending' && (
                <div className={`flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <Clock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    {t(
                      'Votre réservation est en cours de traitement. Notre équipe vous contactera sous 24h.',
                      'حجزك قيد المعالجة. سيتصل بك فريقنا خلال 24 ساعة.',
                      'Your booking is being processed. Our team will contact you within 24 hours.',
                      language
                    )}
                  </p>
                </div>
              )}
              {booking.status === 'confirmed' && (
                <div className={`flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">
                    {t(
                      'Votre réservation est confirmée. Bon séjour !',
                      'تم تأكيد حجزك. استمتع بإقامتك!',
                      'Your booking is confirmed. Enjoy your stay!',
                      language
                    )}
                  </p>
                </div>
              )}
              {booking.status === 'cancelled' && (
                <div className={`flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    {t(
                      'Cette réservation a été annulée. Contactez-nous pour plus d\'informations.',
                      'تم إلغاء هذا الحجز. تواصل معنا لمزيد من المعلومات.',
                      'This booking has been cancelled. Contact us for more information.',
                      language
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Help footer */}
            <div className={`px-6 py-4 bg-primary-50 border-t border-primary-100 ${isRTL ? 'text-right' : ''}`}>
              <p className="text-xs text-primary-700 font-semibold mb-0.5">
                {t('Des questions ?', 'هل لديك أسئلة؟', 'Have questions?', language)}
              </p>
              <p className="text-xs text-primary-600">
                {t(
                  'Contactez notre agence en mentionnant votre code de réservation.',
                  'تواصل مع وكالتنا مع ذكر رمز الحجز.',
                  'Contact our agency with your booking code.',
                  language
                )}
              </p>
            </div>
          </div>
        )}

        {/* Search again */}
        {booking && (
          <button
            onClick={() => { setBooking(null); setCode(''); setError(''); }}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-white hover:border-gray-300 transition-all text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <RotateCcw size={15} />
            {t('Rechercher un autre code', 'البحث برمز آخر', 'Search another code', language)}
          </button>
        )}

        {/* Help tip (when no result yet) */}
        {!booking && !error && (
          <div className={`flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl p-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
            <AlertCircle size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-primary-700 leading-relaxed">
              {t(
                'Votre code de confirmation se trouve dans l\'email de confirmation reçu après votre réservation.',
                'يمكنك إيجاد رمز التأكيد في البريد الإلكتروني الذي تلقيته بعد الحجز.',
                'Your confirmation code can be found in the confirmation email you received after booking.',
                language
              )}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default GuestBookingLookup;
