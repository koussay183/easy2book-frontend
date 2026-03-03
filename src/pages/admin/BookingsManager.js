import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar, Search, Filter, Check, X, Clock, DollarSign,
  Hotel, Mail, FileText, CreditCard,
  Building2, CheckCircle, RefreshCw, ArrowRight,
  ChevronRight
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';

/* ── Stat card (matches Dashboard) ── */
const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  </div>
);

const BookingsManager = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [bookings,         setBookings]         = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [searchTerm,       setSearchTerm]       = useState('');
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [filterPayment,    setFilterPayment]    = useState('all');
  const [stats,            setStats]            = useState({ total: 0, pending: 0, confirmed: 0, revenue: 0 });

  useEffect(() => { loadBookings(); }, []);
  useEffect(() => { applyFilters(); }, [searchTerm, filterStatus, filterPayment, bookings]); // eslint-disable-line

  const loadBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res  = await fetch(API_ENDPOINTS.BOOKINGS_ADMIN_ALL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') setBookings(data.data.bookings || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let f = bookings;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(b =>
        b.confirmationCode?.toLowerCase().includes(q) ||
        b.contactEmail?.toLowerCase().includes(q) ||
        b._id?.toLowerCase().includes(q) ||
        b.guestInfo?.name?.toLowerCase().includes(q)
      );
    }
    if (filterStatus  !== 'all') f = f.filter(b => b.status        === filterStatus);
    if (filterPayment !== 'all') f = f.filter(b => b.paymentStatus === filterPayment);
    setFilteredBookings(f);

    setStats({
      total:     bookings.length,
      pending:   bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      revenue:   bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => {
        const p = b.myGoResponse?.BookingCreation?.TotalPrice
          ? parseFloat(b.myGoResponse.BookingCreation.TotalPrice)
          : parseFloat(b.totalPrice || 0);
        return s + p;
      }, 0)
    });
  };

  const handleConfirm = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Confirmer cette réservation?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res  = await fetch(`${API_BASE_URL}/api/bookings/${id}/confirm`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') loadBookings();
      else alert(`Erreur: ${data.message}`);
    } catch (_) { alert('Erreur lors de la confirmation'); }
  };

  const handleCancel = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Annuler cette réservation?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res  = await fetch(`${API_BASE_URL}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' })
      });
      const data = await res.json();
      if (data.status === 'success') loadBookings();
      else alert(`Erreur: ${data.message}`);
    } catch (_) { alert("Erreur lors de l'annulation"); }
  };

  const viewDetails = (booking) =>
    navigate(`/admin/bookings/${booking._id}`, { state: { booking } });

  const statusBadge = (status) => {
    const map = {
      pending:   'bg-amber-100 text-amber-800 border-amber-300',
      confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-primary-50 text-primary-700 border-primary-100',
    };
    const labels = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée', completed: 'Terminée' };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border whitespace-nowrap ${map[status] || map.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const paymentBadge = (status) => {
    const map = {
      pending:  'bg-amber-100 text-amber-800 border-amber-300',
      paid:     'bg-emerald-100 text-emerald-800 border-emerald-300',
      failed:   'bg-red-100 text-red-800 border-red-300',
      refunded: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    const labels = { pending: 'En attente', paid: 'Payé', failed: 'Échoué', refunded: 'Remboursé' };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border whitespace-nowrap ${map[status] || map.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const nights = (ci, co) =>
    ci && co ? Math.ceil((new Date(co) - new Date(ci)) / 864e5) : 0;

  const inputCls =
    'w-full py-2.5 text-sm border border-gray-300 hover:border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-colors bg-white';

  return (
    <div className="space-y-5 max-w-6xl mx-auto" dir="ltr">

      {/* ── Header ── */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Gestion des Réservations</h1>
          <p className="text-xs text-gray-400 mt-0.5">Gérez toutes les réservations clients</p>
        </div>
        <button
          onClick={loadBookings}
          className={`flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText}    label="Total"       value={stats.total}                        sub="Réservations"           accent="bg-primary-700" />
        <StatCard icon={Clock}       label="En attente"  value={stats.pending}                      sub="Nécessitent une action" accent="bg-amber-500"   />
        <StatCard icon={CheckCircle} label="Confirmées"  value={stats.confirmed}                    sub="Réservations validées"  accent="bg-emerald-600" />
        <StatCard icon={DollarSign}  label="Revenus"     value={`${stats.revenue.toFixed(0)} TND`} sub="Paiements reçus"        accent="bg-violet-600"  />
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Code, email, ID..."
              className={`${inputCls} ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>
          <div className="relative">
            <Filter size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className={`${inputCls} appearance-none cursor-pointer ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
          <div className="relative">
            <CreditCard size={14} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <select
              value={filterPayment}
              onChange={e => setFilterPayment(e.target.value)}
              className={`${inputCls} appearance-none cursor-pointer ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            >
              <option value="all">Tous les paiements</option>
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  { label: 'Code / Date',    align: isRTL ? 'text-right' : 'text-left'  },
                  { label: 'Client',         align: isRTL ? 'text-right' : 'text-left'  },
                  { label: 'Hôtel / Séjour', align: isRTL ? 'text-right' : 'text-left'  },
                  { label: 'Statut',         align: isRTL ? 'text-right' : 'text-left'  },
                  { label: 'Paiement',       align: isRTL ? 'text-right' : 'text-left'  },
                  { label: 'Montant',        align: 'text-right'                         },
                  { label: 'Actions',        align: 'text-center'                        },
                ].map(({ label, align }) => (
                  <th key={label} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${align}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <RefreshCw size={32} className="animate-spin text-primary-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Chargement...</p>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <FileText size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">Aucune réservation</p>
                    <p className="text-xs text-gray-400">Modifiez vos filtres</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map(booking => {
                  const n    = nights(booking.hotelBooking?.CheckIn, booking.hotelBooking?.CheckOut);
                  const room = booking.hotelBooking?.Rooms?.[0];
                  const price = booking.myGoResponse?.BookingCreation?.TotalPrice
                    ? parseFloat(booking.myGoResponse.BookingCreation.TotalPrice)
                    : parseFloat(booking.totalPrice || 0);

                  return (
                    <tr
                      key={booking._id}
                      onClick={() => viewDetails(booking)}
                      className="hover:bg-gray-50 cursor-pointer group transition-colors"
                    >
                      {/* Code */}
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                            <Hotel size={15} className="text-primary-700" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[110px]">
                              {booking.confirmationCode || booking._id?.slice(-8)}
                            </p>
                            <p className="text-xs text-gray-400 whitespace-nowrap">
                              {booking.createdAt
                                ? new Date(booking.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            booking.isGuest ? 'bg-gray-100 text-gray-600' : 'bg-primary-50 text-primary-700'
                          }`}>
                            {booking.isGuest ? 'Invité' : 'Compte'}
                          </span>
                          {booking.guestInfo?.name && (
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                              {booking.guestInfo.name}
                            </p>
                          )}
                          <div className={`flex items-center gap-1 text-xs text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Mail size={10} />
                            <span className="truncate max-w-[140px]">{booking.contactEmail || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Hôtel */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                            Hôtel #{booking.hotelBooking?.Hotel || 'N/A'}
                          </p>
                          {room && (
                            <p className="text-xs text-gray-400 truncate max-w-[180px]">
                              Ch. #{room.Id} · {room.Boarding}
                            </p>
                          )}
                          <div className={`flex items-center gap-1 text-xs text-gray-400 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Calendar size={10} />
                            <span className="whitespace-nowrap">{booking.hotelBooking?.CheckIn || '—'}</span>
                            <ArrowRight size={9} className="text-gray-300" />
                            <span className="whitespace-nowrap">{booking.hotelBooking?.CheckOut || '—'}</span>
                          </div>
                          {n > 0 && (
                            <p className="text-xs text-primary-700 font-medium">
                              {n} nuit{n > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">{statusBadge(booking.status)}</td>

                      {/* Paiement */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {paymentBadge(booking.paymentStatus)}
                          <div className={`flex items-center gap-1 text-xs text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {booking.paymentMethod === 'online'
                              ? <><CreditCard size={10} /><span>En ligne{booking.paymentPlan === 'installment' ? ' (tranches)' : ''}</span></>
                              : booking.paymentMethod === 'wafacash'
                                ? <><span style={{color:'#EA6913',fontWeight:'bold',fontSize:'10px'}}>WC</span><span>Wafacash</span></>
                                : booking.paymentMethod === 'izi'
                                  ? <><span style={{color:'#6D28D9',fontWeight:'bold',fontSize:'10px'}}>izi</span><span>Izi</span></>
                                  : <><Building2 size={10} /><span>Agence</span></>
                            }
                          </div>
                        </div>
                      </td>

                      {/* Montant */}
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold text-gray-900">{price.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">
                          {booking.myGoResponse?.BookingCreation?.Currency || 'TND'}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={e => handleConfirm(booking._id, e)}
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                                title="Confirmer"
                              >
                                <Check size={13} />
                              </button>
                              <button
                                onClick={e => handleCancel(booking._id, e)}
                                className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                title="Annuler"
                              >
                                <X size={13} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); viewDetails(booking); }}
                            className="p-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredBookings.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-5 py-3">
            <div className={`flex items-center justify-between text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>
                <span className="font-semibold text-gray-900">{filteredBookings.length}</span> réservation(s)
              </span>
              <span>
                Total:{' '}
                <span className="font-semibold text-gray-900">
                  {filteredBookings.reduce((s, b) => {
                    const p = b.myGoResponse?.BookingCreation?.TotalPrice
                      ? parseFloat(b.myGoResponse.BookingCreation.TotalPrice)
                      : parseFloat(b.totalPrice || 0);
                    return s + p;
                  }, 0).toFixed(2)} TND
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsManager;
