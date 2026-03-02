import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hotel, Clock, Phone, Mail, CheckCircle, XCircle,
  AlertCircle, Eye, CreditCard, RefreshCw, X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';
import { initiatePayment } from '../services/paymentService';
import Loader from '../components/Loader';

const T = {
  fr: {
    title: 'Mes Réservations',
    subtitle: 'Gérez vos réservations d\'hôtels facilement',
    noBookings: 'Aucune réservation',
    noBookingsDesc: 'Vous n\'avez pas encore effectué de réservation.',
    noFilter: 'Aucune réservation pour ce statut.',
    searchHotels: 'Chercher un hôtel',
    viewAll: 'Voir toutes',
    viewDetails: 'Voir les détails',
    payNow: 'Payer',
    processing: 'Traitement...',
    nights: (n) => `${n} nuit${n > 1 ? 's' : ''}`,
    checkIn: 'Arrivée', checkOut: 'Départ',
    stay: 'Séjour', total: 'Total',
    online: 'En ligne', atAgency: 'À l\'agence',
    status: { all: 'Tous', pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée', completed: 'Terminée' },
    payStatus: { pending: 'Paiement en attente', paid: 'Payé', failed: 'Échoué', refunded: 'Remboursé' },
    modalTitle: 'Détails de la réservation',
    refLabel: 'Référence', hotelLabel: 'Hôtel', stayLabel: 'Séjour',
    roomLabel: 'Chambre', guestsLabel: 'Voyageurs',
    adults: 'Adultes', children: 'Enfants', years: 'ans',
    board: 'Pension', contactLabel: 'Contact',
    paymentLabel: 'Mode de paiement', notesLabel: 'Notes',
    totalLabel: 'Prix total', close: 'Fermer',
  },
  ar: {
    title: 'حجوزاتي',
    subtitle: 'إدارة حجوزاتك بكل سهولة',
    noBookings: 'لا توجد حجوزات',
    noBookingsDesc: 'لم تقم بأي حجز بعد.',
    noFilter: 'لا توجد حجوزات بهذه الحالة.',
    searchHotels: 'ابحث عن فندق',
    viewAll: 'عرض الكل',
    viewDetails: 'عرض التفاصيل',
    payNow: 'ادفع الآن',
    processing: 'جارٍ المعالجة...',
    nights: (n) => `${n} ليلة`,
    checkIn: 'الوصول', checkOut: 'المغادرة',
    stay: 'الإقامة', total: 'الإجمالي',
    online: 'عبر الإنترنت', atAgency: 'في الوكالة',
    status: { all: 'الكل', pending: 'قيد الانتظار', confirmed: 'مؤكد', cancelled: 'ملغى', completed: 'مكتمل' },
    payStatus: { pending: 'في انتظار الدفع', paid: 'مدفوع', failed: 'فشل', refunded: 'مسترد' },
    modalTitle: 'تفاصيل الحجز',
    refLabel: 'المرجع', hotelLabel: 'الفندق', stayLabel: 'الإقامة',
    roomLabel: 'الغرفة', guestsLabel: 'الضيوف',
    adults: 'البالغون', children: 'الأطفال', years: 'سنوات',
    board: 'الوجبات', contactLabel: 'التواصل',
    paymentLabel: 'طريقة الدفع', notesLabel: 'ملاحظات',
    totalLabel: 'السعر الإجمالي', close: 'إغلاق',
  },
  en: {
    title: 'My Bookings',
    subtitle: 'Manage your hotel reservations easily',
    noBookings: 'No bookings yet',
    noBookingsDesc: 'You haven\'t made any bookings yet.',
    noFilter: 'No bookings for this status.',
    searchHotels: 'Search Hotels',
    viewAll: 'View all',
    viewDetails: 'View Details',
    payNow: 'Pay Now',
    processing: 'Processing...',
    nights: (n) => `${n} night${n !== 1 ? 's' : ''}`,
    checkIn: 'Check-in', checkOut: 'Check-out',
    stay: 'Stay', total: 'Total',
    online: 'Online', atAgency: 'At agency',
    status: { all: 'All', pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled', completed: 'Completed' },
    payStatus: { pending: 'Payment pending', paid: 'Paid', failed: 'Failed', refunded: 'Refunded' },
    modalTitle: 'Booking Details',
    refLabel: 'Reference', hotelLabel: 'Hotel', stayLabel: 'Stay',
    roomLabel: 'Room', guestsLabel: 'Guests',
    adults: 'Adults', children: 'Children', years: 'years',
    board: 'Board', contactLabel: 'Contact',
    paymentLabel: 'Payment method', notesLabel: 'Notes',
    totalLabel: 'Total price', close: 'Close',
  }
};

const STATUS_STYLES = {
  pending:   { bar: 'bg-amber-400',    badge: 'bg-amber-50 text-amber-700 border-amber-200',    icon: Clock },
  confirmed: { bar: 'bg-green-500',    badge: 'bg-green-50 text-green-700 border-green-200',    icon: CheckCircle },
  cancelled: { bar: 'bg-red-400',      badge: 'bg-red-50 text-red-600 border-red-200',          icon: XCircle },
  completed: { bar: 'bg-primary-500',  badge: 'bg-primary-50 text-primary-700 border-primary-200', icon: CheckCircle },
};

const PAY_STYLES = {
  pending:  'bg-orange-50 text-orange-600 border-orange-200',
  paid:     'bg-green-50 text-green-700 border-green-200',
  failed:   'bg-red-50 text-red-600 border-red-200',
  refunded: 'bg-gray-50 text-gray-500 border-gray-200',
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const calcNights = (a, b) =>
  a && b ? Math.round((new Date(b) - new Date(a)) / 86400000) : 0;

// ── Section helper ─────────────────────────────────────────────
const Sec = ({ icon: Icon, title, children, isRTL }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <Icon size={14} className="text-primary-600 flex-shrink-0" />
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</p>
    </div>
    {children}
  </div>
);

// ── InfoCell helper ────────────────────────────────────────────
const IC = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-semibold text-gray-800 mt-0.5">{value || '—'}</p>
  </div>
);

// ── Main component ─────────────────────────────────────────────
export default function MyBookings() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t   = T[language] || T.fr;
  const isRTL = language === 'ar';

  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [selected,  setSelected]  = useState(null);
  const [payLoad,   setPayLoad]   = useState(null);

  useEffect(() => { load(); }, []); // eslint-disable-line

  const load = async () => {
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
      const ids   = all.map((b) => b._id);
      all = [...all, ...guest.filter((g) => !ids.includes(g._id))];
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(all);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

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
  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t.subtitle}</p>
        </div>

        {/* Filter pills */}
        {bookings.length > 0 && (
          <div className={`flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  filter === f
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
                }`}>
                {t.status[f]}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Hotel size={24} className="text-primary-400" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">{t.noBookings}</h3>
            <p className="text-sm text-gray-400 mb-5">
              {filter === 'all' ? t.noBookingsDesc : t.noFilter}
            </p>
            {filter !== 'all' ? (
              <button onClick={() => setFilter('all')}
                className="text-primary-700 font-semibold text-sm hover:underline">
                {t.viewAll}
              </button>
            ) : (
              <button onClick={() => navigate('/hotels')}
                className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-semibold transition-colors">
                {t.searchHotels}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const sc      = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
              const SIcon   = sc.icon;
              const nights  = calcNights(booking.hotelBooking?.CheckIn, booking.hotelBooking?.CheckOut);
              const canPay  = booking.paymentMethod === 'online' && booking.paymentStatus === 'pending';

              return (
                <div key={booking._id}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all overflow-hidden">

                  {/* Status strip */}
                  <div className={`h-1 ${sc.bar}`} />

                  <div className="p-5">
                    {/* Hotel + badges */}
                    <div className={`flex items-start justify-between gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Hotel size={16} className="text-primary-600" />
                        </div>
                        <div className={`min-w-0 ${isRTL ? 'text-right' : ''}`}>
                          <p className="text-base font-bold text-gray-900 truncate">
                            {booking.hotelBooking?.Hotel || '—'}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">
                            #{booking._id?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className={`flex flex-col gap-1.5 flex-shrink-0 ${isRTL ? 'items-start' : 'items-end'}`}>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.badge}`}>
                          <SIcon size={11} />
                          {t.status[booking.status] || booking.status}
                        </span>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${PAY_STYLES[booking.paymentStatus] || PAY_STYLES.pending}`}>
                          {t.payStatus[booking.paymentStatus] || t.payStatus.pending}
                        </span>
                      </div>
                    </div>

                    {/* Stay + price */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className={`bg-gray-50 rounded-xl p-3 ${isRTL ? 'text-right' : ''}`}>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.stay}</p>
                        <p className="text-sm font-semibold text-gray-800">{fmtDate(booking.hotelBooking?.CheckIn)}</p>
                        <p className="text-xs text-gray-400 my-0.5">{t.nights(nights)}</p>
                        <p className="text-sm font-semibold text-gray-800">{fmtDate(booking.hotelBooking?.CheckOut)}</p>
                      </div>
                      <div className={`bg-gray-50 rounded-xl p-3 ${isRTL ? 'text-right' : ''}`}>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.total}</p>
                        <p className="text-lg font-extrabold text-primary-700 leading-tight">
                          {booking.totalPrice?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">{booking.currency || 'TND'}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {booking.paymentMethod === 'online' ? t.online : t.atAgency}
                        </p>
                      </div>
                    </div>

                    {/* Contact + actions */}
                    <div className={`flex items-center justify-between gap-3 pt-3 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 text-sm text-gray-500 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Mail size={12} />
                          <span className="truncate max-w-[130px]">{booking.contactEmail}</span>
                        </div>
                        <div className={`hidden sm:flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Phone size={12} />
                          <span>{booking.contactPhone}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {canPay && (
                          <button onClick={() => payNow(booking._id)}
                            disabled={payLoad === booking._id}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                            {payLoad === booking._id
                              ? <RefreshCw size={12} className="animate-spin" />
                              : <CreditCard size={12} />}
                            {payLoad === booking._id ? t.processing : t.payNow}
                          </button>
                        )}
                        <button onClick={() => setSelected(booking)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-bold transition-colors">
                          <Eye size={12} />
                          {t.viewDetails}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Details modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[92vh] overflow-y-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className={`sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className="text-base font-bold text-gray-900">{t.modalTitle}</p>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Ref + status */}
              <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-xs text-gray-400 mb-0.5">{t.refLabel}</p>
                  <p className="text-xs font-mono font-bold text-gray-700">{selected._id}</p>
                </div>
                <div className={`flex flex-col gap-1.5 ${isRTL ? 'items-start' : 'items-end'}`}>
                  {(() => {
                    const sc   = STATUS_STYLES[selected.status] || STATUS_STYLES.pending;
                    const Icon = sc.icon;
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.badge}`}>
                        <Icon size={11} /> {t.status[selected.status]}
                      </span>
                    );
                  })()}
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${PAY_STYLES[selected.paymentStatus] || PAY_STYLES.pending}`}>
                    {t.payStatus[selected.paymentStatus]}
                  </span>
                </div>
              </div>

              {/* Hotel */}
              <Sec icon={Hotel} title={t.hotelLabel} isRTL={isRTL}>
                <p className="text-base font-bold text-gray-900 mb-3">{selected.hotelBooking?.Hotel}</p>
                <div className="grid grid-cols-2 gap-3">
                  <IC label={t.checkIn} value={fmtDate(selected.hotelBooking?.CheckIn)} />
                  <IC label={t.checkOut} value={fmtDate(selected.hotelBooking?.CheckOut)} />
                  <IC label={t.stay} value={t.nights(calcNights(selected.hotelBooking?.CheckIn, selected.hotelBooking?.CheckOut))} />
                </div>
              </Sec>

              {/* Rooms */}
              {selected.hotelBooking?.Rooms?.map((room, idx) => (
                <Sec key={idx} icon={Hotel} title={`${t.roomLabel} ${idx + 1}`} isRTL={isRTL}>
                  <div className="space-y-2 text-sm">
                    <IC label={t.board} value={room.Boarding} />
                    {room.Pax?.Adult?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.adults}</p>
                        {room.Pax.Adult.map((a, i) => (
                          <p key={i} className={`text-sm text-gray-700 ${isRTL ? 'mr-3' : 'ml-3'}`}>• {a.Name} {a.Surname}</p>
                        ))}
                      </div>
                    )}
                    {room.Pax?.Child?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.children}</p>
                        {room.Pax.Child.map((c, i) => (
                          <p key={i} className={`text-sm text-gray-700 ${isRTL ? 'mr-3' : 'ml-3'}`}>• {c.Name} {c.Surname} ({c.Age} {t.years})</p>
                        ))}
                      </div>
                    )}
                  </div>
                </Sec>
              ))}

              {/* Contact */}
              <Sec icon={Mail} title={t.contactLabel} isRTL={isRTL}>
                <div className={`flex items-center gap-2 text-sm mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Mail size={13} className="text-gray-400" />
                  <span className="text-gray-700">{selected.contactEmail}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Phone size={13} className="text-gray-400" />
                  <span className="text-gray-700">{selected.contactPhone}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <IC label={t.paymentLabel}
                    value={selected.paymentMethod === 'online' ? t.online : t.atAgency} />
                </div>
              </Sec>

              {/* Notes */}
              {selected.notes && (
                <Sec icon={AlertCircle} title={t.notesLabel} isRTL={isRTL}>
                  <p className="text-sm text-gray-600 leading-relaxed">{selected.notes}</p>
                </Sec>
              )}

              {/* Total */}
              <div className="bg-primary-700 rounded-2xl p-5 text-white text-center">
                <p className="text-primary-200 text-xs mb-1">{t.totalLabel}</p>
                <p className="text-3xl font-extrabold">
                  {selected.totalPrice?.toLocaleString()}
                  <span className="text-base font-medium ml-2">{selected.currency || 'TND'}</span>
                </p>
              </div>

              <button onClick={() => setSelected(null)}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-colors border border-gray-200">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
