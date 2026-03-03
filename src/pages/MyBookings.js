import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hotel, Clock, CheckCircle, XCircle, ChevronRight,
  Copy, Check, Phone, Mail, Moon, Users,
  CreditCard, Building2, AlertCircle, RefreshCw, X,
  MapPin, Utensils
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';
import { initiatePayment } from '../services/paymentService';
import Loader from '../components/Loader';

/* ── helpers ─────────────────────────────────────── */
const fmtDate = (d, lang) =>
  d ? new Date(d).toLocaleDateString(
    lang === 'ar' ? 'ar-TN' : 'fr-FR',
    { day: '2-digit', month: 'short', year: 'numeric' }
  ) : '—';

const calcNights = (a, b) =>
  a && b ? Math.max(Math.round((new Date(b) - new Date(a)) / 86400000), 0) : 0;

/* ── Copy button ── */
const CopyBtn = ({ text }) => {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-white/60 hover:bg-white transition-colors border border-white/40">
      {done ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
      <span>{done ? 'Copié' : 'Copier'}</span>
    </button>
  );
};

/* ── Status config ── */
const STATUS = {
  pending:   { label: { fr: 'En attente', ar: 'قيد الانتظار', en: 'Pending' },
               cls: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400', Icon: Clock },
  confirmed: { label: { fr: 'Confirmée', ar: 'مؤكدة', en: 'Confirmed' },
               cls: 'bg-green-50 text-green-700 border-green-200',  bar: 'bg-green-500',  Icon: CheckCircle },
  completed: { label: { fr: 'Terminée',  ar: 'منتهية', en: 'Completed' },
               cls: 'bg-blue-50 text-blue-700 border-blue-200',     bar: 'bg-blue-500',   Icon: CheckCircle },
  cancelled: { label: { fr: 'Annulée',   ar: 'ملغاة', en: 'Cancelled' },
               cls: 'bg-red-50 text-red-600 border-red-200',        bar: 'bg-red-400',    Icon: XCircle },
};

const PAY_STATUS = {
  pending:  { fr: 'Paiement en attente', ar: 'في انتظار الدفع',      en: 'Payment pending',  cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  paid:     { fr: 'Payé',                ar: 'تم الدفع',              en: 'Paid',             cls: 'text-green-700 bg-green-50 border-green-200'  },
  failed:   { fr: 'Échoué',              ar: 'فشل',                   en: 'Failed',           cls: 'text-red-600   bg-red-50   border-red-200'    },
  refunded: { fr: 'Remboursé',           ar: 'مسترد',                 en: 'Refunded',         cls: 'text-gray-600  bg-gray-50  border-gray-200'   },
};

const METHOD_NAME = {
  wafacash: 'Wafacash', izi: 'Izi',
  agency: { fr: 'Agence Easy2Book', ar: 'وكالة Easy2Book', en: 'Easy2Book Agency' },
  online: { fr: 'En ligne', ar: 'عبر الإنترنت', en: 'Online' },
};

/* ── Inline payment action block ── */
const PaymentAction = ({ booking, settings, lang }) => {
  const pm = booking.paymentMethod;
  const needsPay = booking.paymentStatus === 'pending';
  if (!needsPay) return null;

  /* Wafacash */
  if (pm === 'wafacash' && settings?.wafacash) {
    const w = settings.wafacash;
    return (
      <div className="mt-3 rounded-xl bg-orange-50 border border-orange-200 overflow-hidden">
        <div className="px-3 py-2 bg-orange-100 flex items-center gap-2">
          <AlertCircle size={12} className="text-orange-600" />
          <span className="text-xs font-semibold text-orange-700">
            {lang === 'fr' ? 'À payer via Wafacash' : lang === 'ar' ? 'الدفع عبر Wafacash' : 'Pay via Wafacash'}
          </span>
        </div>
        <div className="px-3 py-3 space-y-2">
          {w.rib && (
            <div className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-orange-100">
              <div>
                <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wide mb-0.5">RIB</p>
                <p className="font-mono text-sm font-bold text-gray-900 tracking-wider">{w.rib}</p>
              </div>
              <CopyBtn text={w.rib} />
            </div>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            {w.accountName && <span><span className="text-gray-400">Titulaire:</span> <strong>{w.accountName}</strong></span>}
            {w.phone       && <span><span className="text-gray-400">Tél.:</span> <strong dir="ltr">{w.phone}</strong></span>}
          </div>
          {booking.confirmationCode && (
            <div className="flex items-center gap-1.5 text-xs text-orange-700 bg-orange-100 rounded-lg px-2.5 py-2">
              <AlertCircle size={11} className="flex-shrink-0" />
              <span>
                {lang === 'fr' ? 'Indiquez' : 'Include'}&nbsp;
                <strong className="font-mono">{booking.confirmationCode}</strong>
                &nbsp;{lang === 'fr' ? 'en référence' : 'as reference'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* Izi */
  if (pm === 'izi' && settings?.izi) {
    const iz = settings.izi;
    return (
      <div className="mt-3 rounded-xl bg-violet-50 border border-violet-200 overflow-hidden">
        <div className="px-3 py-2 bg-violet-100 flex items-center gap-2">
          <AlertCircle size={12} className="text-violet-600" />
          <span className="text-xs font-semibold text-violet-700">
            {lang === 'fr' ? 'À payer via Izi' : lang === 'ar' ? 'الدفع عبر Izi' : 'Pay via Izi'}
          </span>
        </div>
        <div className="px-3 py-3 space-y-2">
          {iz.rib && (
            <div className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-violet-100">
              <div>
                <p className="text-[9px] font-bold text-violet-500 uppercase tracking-wide mb-0.5">RIB</p>
                <p className="font-mono text-sm font-bold text-gray-900 tracking-wider">{iz.rib}</p>
              </div>
              <CopyBtn text={iz.rib} />
            </div>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            {iz.accountName && <span><span className="text-gray-400">Titulaire:</span> <strong>{iz.accountName}</strong></span>}
            {iz.phone       && <span><span className="text-gray-400">Tél.:</span> <strong dir="ltr">{iz.phone}</strong></span>}
          </div>
          {booking.confirmationCode && (
            <div className="flex items-center gap-1.5 text-xs text-violet-700 bg-violet-100 rounded-lg px-2.5 py-2">
              <AlertCircle size={11} className="flex-shrink-0" />
              <span>
                {lang === 'fr' ? 'Indiquez' : 'Include'}&nbsp;
                <strong className="font-mono">{booking.confirmationCode}</strong>
                &nbsp;{lang === 'fr' ? 'en référence' : 'as reference'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* Agency */
  if (pm === 'agency' && settings?.agency) {
    const ag = settings.agency;
    return (
      <div className="mt-3 rounded-xl bg-primary-50 border border-primary-200 overflow-hidden">
        <div className="px-3 py-2 bg-primary-100 flex items-center gap-2">
          <Building2 size={12} className="text-primary-600" />
          <span className="text-xs font-semibold text-primary-700">
            {lang === 'fr' ? 'Rendez-vous en agence' : lang === 'ar' ? 'تفضل إلى الوكالة' : 'Visit the agency'}
          </span>
        </div>
        <div className="px-3 py-3 space-y-1.5 text-xs">
          {ag.address && (
            <div className="flex items-start gap-1.5 text-gray-600">
              <MapPin size={11} className="text-primary-500 mt-0.5 flex-shrink-0" />
              <span>{ag.address}</span>
            </div>
          )}
          {ag.phone && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Phone size={11} className="text-primary-500 flex-shrink-0" />
              <strong dir="ltr">{ag.phone}</strong>
            </div>
          )}
          {ag.hours && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock size={11} className="text-primary-400 flex-shrink-0" />
              <span>{ag.hours}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* Online */
  if (pm === 'online') {
    return (
      <div className="mt-3 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2.5 flex items-center gap-2">
        <RefreshCw size={12} className="text-blue-500 animate-spin flex-shrink-0" />
        <span className="text-xs text-blue-700 font-medium">
          {lang === 'fr' ? 'Paiement en cours de traitement…' : 'Payment processing…'}
        </span>
      </div>
    );
  }

  return null;
};

/* ═══════════════════════════ MAIN ═══════════════════════════ */
export default function MyBookings() {
  const navigate    = useNavigate();
  const { language: lang } = useLanguage();
  const isRTL       = lang === 'ar';

  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [selected,  setSelected]  = useState(null);
  const [payLoad,   setPayLoad]   = useState(null);
  const [settings,  setSettings]  = useState(null);

  /* ── Fetch bookings ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      let all = [];
      if (token) {
        const res  = await fetch(API_ENDPOINTS.BOOKINGS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') all = data.data.bookings || [];
      }
      const guest = JSON.parse(localStorage.getItem('guestBookings') || '[]');
      const ids   = all.map(b => b._id);
      all = [...all, ...guest.filter(g => !ids.includes(g._id))];
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(all);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  /* ── Fetch public settings (RIBs) ── */
  useEffect(() => {
    fetch(API_ENDPOINTS.PUBLIC_SETTINGS)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setSettings(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Online pay ── */
  const payNow = async (id) => {
    try {
      setPayLoad(id);
      const { payUrl, paymentRef } = await initiatePayment(id);
      localStorage.setItem('pendingPaymentRef', paymentRef);
      localStorage.setItem('pendingBookingId', id);
      window.location.href = payUrl;
    } catch (err) {
      alert(err.message);
      setPayLoad(null);
    }
  };

  if (loading) return <Loader />;

  const FILTERS  = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const l = (fr, ar, en) => lang === 'ar' ? ar : lang === 'en' ? en : fr;

  /* ── Status labels for filter pills ── */
  const FILTER_LABELS = {
    all: l('Toutes', 'الكل', 'All'),
    pending:   l('En attente', 'قيد الانتظار', 'Pending'),
    confirmed: l('Confirmées', 'مؤكدة', 'Confirmed'),
    completed: l('Terminées', 'منتهية', 'Completed'),
    cancelled: l('Annulées', 'ملغاة', 'Cancelled'),
  };

  /* ── Summary count for filter pills ── */
  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 pt-8">

        {/* ─ Header ─ */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {l('Mes réservations', 'حجوزاتي', 'My bookings')}
            </h1>
            {bookings.length > 0 && (
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {bookings.length}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {l('Retrouvez toutes vos réservations et les infos de paiement', 'جميع حجوزاتك وتفاصيل الدفع', 'All your bookings and payment info')}
          </p>
        </div>

        {/* ─ Filter pills ─ */}
        {bookings.length > 0 && (
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.filter(f => f === 'all' || counts[f] > 0).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  filter === f
                    ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                }`}>
                {FILTER_LABELS[f]}
                {f !== 'all' && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    filter === f ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{counts[f]}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ─ Empty state ─ */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Hotel size={28} className="text-primary-400" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              {filter === 'all'
                ? l('Aucune réservation', 'لا توجد حجوزات', 'No bookings yet')
                : l(`Aucune réservation ${FILTER_LABELS[filter].toLowerCase()}`, 'لا توجد نتائج', 'No bookings')}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {filter === 'all'
                ? l("Commencez par réserver un hôtel !", "ابدأ بحجز فندق!", "Start by booking a hotel!")
                : l("Essayez un autre filtre.", "جرّب فلتراً آخر.", "Try another filter.")}
            </p>
            {filter !== 'all' ? (
              <button onClick={() => setFilter('all')}
                className="text-primary-700 font-semibold text-sm hover:underline">
                {l('Voir toutes', 'عرض الكل', 'View all')}
              </button>
            ) : (
              <button onClick={() => navigate('/hotels')}
                className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-semibold transition-colors">
                {l('Chercher un hôtel', 'ابحث عن فندق', 'Search hotels')}
              </button>
            )}
          </div>
        )}

        {/* ─ Booking cards ─ */}
        <div className="space-y-4">
          {filtered.map(booking => {
            const st      = STATUS[booking.status] || STATUS.pending;
            const py      = PAY_STATUS[booking.paymentStatus] || PAY_STATUS.pending;
            const nights  = calcNights(booking.hotelBooking?.CheckIn, booking.hotelBooking?.CheckOut);
            const canPay  = booking.paymentMethod === 'online' && booking.paymentStatus === 'pending';

            return (
              <div key={booking._id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                {/* Colored status bar */}
                <div className={`h-1 ${st.bar}`} />

                <div className="p-4">

                  {/* Row 1: Hotel + badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Hotel size={18} className="text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                          {booking.hotelBooking?.Hotel || l('Hôtel', 'فندق', 'Hotel')}
                        </p>
                        {booking.confirmationCode && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-gray-400">{l('Code', 'كود', 'Code')} :</span>
                            <span className="font-mono text-xs font-bold text-primary-700 tracking-wider">{booking.confirmationCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${st.cls}`}>
                        <st.Icon size={10} />
                        {st.label[lang] || st.label.fr}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Dates grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">{l('Arrivée', 'الوصول', 'Check-in')}</p>
                      <p className="text-xs font-bold text-gray-800 leading-snug">{fmtDate(booking.hotelBooking?.CheckIn, lang)}</p>
                    </div>
                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-primary-500 uppercase tracking-wide mb-1 flex items-center justify-center gap-0.5">
                        <Moon size={8} />{l('Nuits', 'ليالي', 'Nights')}
                      </p>
                      <p className="text-lg font-black text-primary-700 leading-none">{nights}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">{l('Départ', 'المغادرة', 'Check-out')}</p>
                      <p className="text-xs font-bold text-gray-800 leading-snug">{fmtDate(booking.hotelBooking?.CheckOut, lang)}</p>
                    </div>
                  </div>

                  {/* Row 3: Payment action block (RIB if needed) */}
                  <PaymentAction booking={booking} settings={settings} lang={lang} />

                  {/* Row 4: Total + actions */}
                  <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">{l('Total', 'المبلغ', 'Total')}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-gray-900" dir="ltr">
                          {parseFloat(booking.totalPrice || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{booking.currency || 'TND'}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${py.cls}`}>
                        {py[lang] || py.fr}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {canPay && (
                        <button onClick={() => payNow(booking._id)}
                          disabled={payLoad === booking._id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                          {payLoad === booking._id
                            ? <RefreshCw size={12} className="animate-spin" />
                            : <CreditCard size={12} />}
                          {payLoad === booking._id ? '…' : l('Payer', 'ادفع', 'Pay')}
                        </button>
                      )}
                      <button onClick={() => setSelected(booking)}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors">
                        {l('Détails', 'التفاصيل', 'Details')}
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ═══════ DETAILS SHEET ═══════ */}
      {selected && (() => {
        const st       = STATUS[selected.status] || STATUS.pending;
        const py       = PAY_STATUS[selected.paymentStatus] || PAY_STATUS.pending;
        const nights   = calcNights(selected.hotelBooking?.CheckIn, selected.hotelBooking?.CheckOut);
        const allRooms = selected.hotelBooking?.Rooms || [];
        const mName    = typeof METHOD_NAME[selected.paymentMethod] === 'string'
          ? METHOD_NAME[selected.paymentMethod]
          : (METHOD_NAME[selected.paymentMethod]?.[lang] || METHOD_NAME[selected.paymentMethod]?.fr || selected.paymentMethod);

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={() => setSelected(null)}>
            <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[92vh] overflow-y-auto flex flex-col rounded-t-2xl"
              dir={isRTL ? 'rtl' : 'ltr'}
              onClick={e => e.stopPropagation()}>

              {/* Sheet header */}
              <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
                <div>
                  <p className="text-base font-bold text-gray-900">{selected.hotelBooking?.Hotel || '—'}</p>
                  {selected.confirmationCode && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {l('Code', 'كود', 'Code')}&nbsp;
                      <span className="font-mono font-bold text-primary-700">{selected.confirmationCode}</span>
                    </p>
                  )}
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-4 flex-1">

                {/* Status row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                    <st.Icon size={11} /> {st.label[lang] || st.label.fr}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${py.cls}`}>
                    {py[lang] || py.fr}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {mName}
                  </span>
                </div>

                {/* Date box */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: l('Arrivée', 'الوصول', 'Check-in'), val: fmtDate(selected.hotelBooking?.CheckIn, lang) },
                    { label: l('Nuits', 'ليالي', 'Nights'), val: nights, highlight: true },
                    { label: l('Départ', 'المغادرة', 'Check-out'), val: fmtDate(selected.hotelBooking?.CheckOut, lang) },
                  ].map(({ label, val, highlight }) => (
                    <div key={label} className={`rounded-xl p-3 text-center ${highlight ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50'}`}>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                      <p className={`text-sm font-bold ${highlight ? 'text-primary-700 text-xl' : 'text-gray-800'}`}>{val}</p>
                    </div>
                  ))}
                </div>

                {/* Rooms / guests */}
                {allRooms.length > 0 && (
                  <div className="rounded-xl border border-gray-150 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
                      <Users size={13} className="text-primary-600" />
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        {l('Voyageurs', 'المسافرون', 'Guests')}
                      </p>
                    </div>
                    {allRooms.map((rm, ri) => {
                      const rAdults   = rm.Pax?.Adult || [];
                      const rChildren = rm.Pax?.Child || [];
                      return (
                        <div key={ri} className="px-4 py-3 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            {allRooms.length > 1 && (
                              <span className="text-[10px] text-gray-400 font-semibold">
                                {l(`Chambre ${ri + 1}`, `غرفة ${ri + 1}`, `Room ${ri + 1}`)}
                              </span>
                            )}
                            {rm.Boarding && (
                              <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                <Utensils size={9} /> {rm.Boarding}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            {rAdults.map((a, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-[9px] font-bold text-primary-700">{a.Civility?.[0] || 'M'}</span>
                                </div>
                                <span className="font-medium">{a.Civility} {a.Name} {a.Surname}</span>
                                {a.Holder && (
                                  <span className="text-[9px] font-bold bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-full border border-primary-100">
                                    {l('Titulaire', 'صاحب الحجز', 'Holder')}
                                  </span>
                                )}
                              </div>
                            ))}
                            {rChildren.map((c, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-[9px] font-bold text-orange-600">E</span>
                                </div>
                                <span>{c.Name} {c.Surname}</span>
                                {c.Age && <span className="text-[10px] text-gray-400">{c.Age} {l('ans', 'سنة', 'yrs')}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Contact */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
                    <Mail size={13} className="text-primary-600" />
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      {l('Contact', 'التواصل', 'Contact')}
                    </p>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {selected.contactEmail && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail size={13} className="text-gray-400" />
                        <span>{selected.contactEmail}</span>
                      </div>
                    )}
                    {selected.contactPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone size={13} className="text-gray-400" />
                        <span dir="ltr">{selected.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">
                      {l('Demandes spéciales', 'طلبات خاصة', 'Special requests')}
                    </p>
                    <p className="text-sm text-gray-700 italic">{selected.notes}</p>
                  </div>
                )}

                {/* Payment action (RIB in details too) */}
                <PaymentAction booking={selected} settings={settings} lang={lang} />

                {/* Total */}
                <div className="bg-primary-700 rounded-2xl p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-xs mb-1">{l('Montant total', 'المبلغ الإجمالي', 'Total amount')}</p>
                      <p className="text-3xl font-black" dir="ltr">
                        {parseFloat(selected.totalPrice || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-base font-medium opacity-70 ml-1">{selected.currency || 'TND'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${py.cls}`}>
                        {py[lang] || py.fr}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Close */}
                <button onClick={() => setSelected(null)}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold transition-colors border border-gray-200">
                  {l('Fermer', 'إغلاق', 'Close')}
                </button>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
