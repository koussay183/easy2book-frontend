import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  RefreshCw, Search, X, Hotel, MapPin, Star, ChevronLeft, ChevronRight,
  Calendar, AlertCircle, CheckCircle, Clock, Ban, Users, Utensils, ExternalLink,
  Filter, Globe, User
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

/* ─── Supplier registry ─────────────────────────────────────────────────────
 *  To add a new supplier, just append to this array:
 *  { id: 'dts', label: 'DTS', available: true }
 * ─────────────────────────────────────────────────────────────────────────── */
const SUPPLIERS = [
  { id: 'mygo', label: 'myGo',  available: true },
  { id: 'dts',  label: 'DTS',   available: false },
  { id: 'gts',  label: 'GTS',   available: false },
];

const STATE_OPTIONS = [
  { value: '',           label: 'Tous les états' },
  { value: 'OnRequest',  label: 'En attente (OnRequest)' },
  { value: 'Confirmed',  label: 'Confirmée' },
  { value: 'Validated',  label: 'Validée (Voucher émis)' },
  { value: 'Cancelled',  label: 'Annulée' },
];

/* ─── Small helpers ─────────────────────────────────────────────────────────── */
const stripHtml = (html) => {
  try { return new DOMParser().parseFromString(html, 'text/html').body.textContent || ''; }
  catch { return html; }
};

const stateBadge = (state) => {
  const map = {
    Cancelled:  'bg-red-50 text-red-700 border-red-200',
    OnRequest:  'bg-amber-50 text-amber-700 border-amber-200',
    Confirmed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    Validated:  'bg-blue-50 text-blue-700 border-blue-200',
  };
  return map[state] || 'bg-gray-100 text-gray-600 border-gray-200';
};

const stateIcon = (state) => {
  if (state === 'Cancelled')  return <Ban size={11} />;
  if (state === 'OnRequest')  return <Clock size={11} />;
  if (state === 'Validated')  return <CheckCircle size={11} />;
  if (state === 'Confirmed')  return <CheckCircle size={11} />;
  return <Globe size={11} />;
};

const Stars = ({ n }) => (
  <span className="inline-flex items-center gap-0.5">
    {[...Array(n || 0)].map((_, i) => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
  </span>
);

const nights = (ci, co) => ci && co ? Math.ceil((new Date(co) - new Date(ci)) / 864e5) : 0;

/* ─── Detail modal content ──────────────────────────────────────────────────── */
const BookingDetailContent = ({ entry, onClose }) => {
  const b = entry?.Booking || entry; // BookingDetails wraps in "Booking", BookingList items are direct
  if (!b) return null;
  const n = nights(b.CheckIn, b.CheckOut);

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ExternalLink size={15} className="text-primary-700" />
          <p className="text-sm font-bold text-gray-900">Réservation #{b.Id}</p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${stateBadge(b.State)}`}>
            {stateIcon(b.State)}{b.State}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
      </div>

      <div className="overflow-y-auto flex-1 p-6 space-y-5">
        {/* Hotel */}
        {b.Hotel && (
          <div className="flex items-start gap-4">
            {b.Hotel.Image && (
              <img src={b.Hotel.Image} alt={b.Hotel.Name}
                className="w-20 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                onError={e => e.target.style.display = 'none'} />
            )}
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-900 leading-tight">{b.Hotel.Name}</p>
              <Stars n={b.Hotel.Category?.Star} />
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MapPin size={11} className="flex-shrink-0" />
                <span>{b.Hotel.City?.Name}{b.Hotel.Adress ? ` · ${b.Hotel.Adress}` : ''}</span>
              </div>
            </div>
          </div>
        )}

        {/* Price + dates */}
        <div className="bg-primary-50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Prix total</p>
            <p className="text-2xl font-bold text-primary-700">
              {parseFloat(b.TotalPrice).toFixed(3)} <span className="text-sm">{b.Currency || 'TND'}</span>
            </p>
            {b.Fee !== undefined && parseFloat(b.Fee) > 0 && (
              <p className="text-xs text-red-600 font-semibold mt-0.5">
                Frais d'annulation : {parseFloat(b.Fee).toFixed(3)} TND
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-700">
              {b.CheckIn} → {b.CheckOut}
              {n > 0 && <span className="text-primary-600 ml-1">({n} nuit{n > 1 ? 's' : ''})</span>}
            </p>
            {b.CancellationDeadline && (
              <p className="text-[10px] text-red-600 font-medium mt-1">
                Annulation avant le {b.CancellationDeadline}
              </p>
            )}
            {b.Cancelled && (
              <p className="text-[10px] text-red-600 font-medium mt-0.5">Annulé le {b.Cancelled}</p>
            )}
          </div>
        </div>

        {/* Voucher — the most important deliverable to the client */}
        {b.Voucher?.Num && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-0.5">Voucher hôtel</p>
                <p className="text-sm font-bold text-blue-900 font-mono truncate">#{b.Voucher.Num}</p>
                <p className="text-[10px] text-blue-500 mt-0.5">À envoyer au client — document de séjour</p>
              </div>
            </div>
            {b.Voucher.Url && (
              <a
                href={b.Voucher.Url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <ExternalLink size={13} />
                Ouvrir
              </a>
            )}
          </div>
        )}

        {/* Rooms */}
        {b.Rooms?.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Chambres ({b.Rooms.length})</p>
            {b.Rooms.map((r, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Hotel size={13} className="text-primary-600" />
                    <p className="text-xs font-bold text-gray-900">Ch. {i + 1} — {r.Name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                      {r.Boarding?.Code} · {r.Boarding?.Name}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{parseFloat(r.Price).toFixed(3)} TND</span>
                  </div>
                </div>
                <div className="px-4 py-2.5 flex flex-wrap gap-1">
                  {r.Pax?.Adult?.map((a, j) => (
                    <span key={j} className="inline-flex items-center gap-1 text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-700">
                      <User size={9} />{a.Civility} {a.Name} {a.Surname}{a.Holder && <span className="text-emerald-600 font-bold ml-0.5">★</span>}
                    </span>
                  ))}
                </div>
                {r.CancellationPolicy?.length > 0 && (
                  <div className="px-4 pb-3 space-y-1">
                    {r.CancellationPolicy.map((p, j) => (
                      <p key={j} className="text-[10px] text-gray-500 leading-snug">⚠ {p.Description}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Remarks */}
        {b.Remarks?.some(r => r?.trim()) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1">Remarques hôtel</p>
            {b.Remarks.map((r, i) => r?.trim() && (
              <p key={i} className="text-xs text-amber-800 leading-snug">{stripHtml(r)}</p>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Créée le</p>
            <p className="text-xs text-gray-700 mt-0.5">{b.Created || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Mise à jour</p>
            <p className="text-xs text-gray-700 mt-0.5">{b.Updated || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Source</p>
            <p className="text-xs font-mono text-gray-600 mt-0.5">{b.Source || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Option</p>
            <p className="text-xs text-gray-600 mt-0.5">{b.DateOption || '—'}</p>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Main component ─────────────────────────────────────────────────────────── */
const SupplierBookings = () => {
  const [provider,       setProvider]       = useState('mygo');
  const [bookings,       setBookings]       = useState([]);
  const [pagination,     setPagination]     = useState({ page: 1, countPage: 1, total: 0 });
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [filtersOpen,    setFiltersOpen]    = useState(false);
  const [detailLoading,  setDetailLoading]  = useState(false);
  const [detailEntry,    setDetailEntry]    = useState(null);
  const [detailOpen,     setDetailOpen]     = useState(false);
  const PER_PAGE = 20;

  const initialFilters = { booking: '', hotel: '', state: '', fromCheckIn: '', toCheckIn: '' };
  const [filters,  setFilters]  = useState(initialFilters);
  const [applied,  setApplied]  = useState(initialFilters);

  const fetchBookings = useCallback(async (page = 1, flt = applied, prov = provider) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        provider: prov,
        page: String(page),
        perPage: String(PER_PAGE),
        ...Object.fromEntries(Object.entries(flt).filter(([, v]) => v)),
      });
      const res  = await fetch(`${API_BASE_URL}/api/admin/supplier/bookings?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBookings(data.data.BookingList || []);
        setPagination({
          page:      parseInt(data.data.Page || page, 10),
          countPage: data.data.CountPage || 1,
          total:     data.data.CountResults || 0,
        });
      } else {
        setError(data.message || 'Erreur serveur');
      }
    } catch {
      setError('Erreur réseau — vérifiez la connexion');
    } finally {
      setLoading(false);
    }
  }, [applied, provider]);

  useEffect(() => { fetchBookings(1, applied, provider); }, [provider]); // eslint-disable-line

  const handleSearch = () => {
    setApplied(filters);
    fetchBookings(1, filters, provider);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setApplied(initialFilters);
    fetchBookings(1, initialFilters, provider);
  };

  const handlePage = (p) => fetchBookings(p);

  const openDetail = async (bookingId) => {
    setDetailOpen(true);
    setDetailEntry(null);
    setDetailLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/supplier/bookings/${bookingId}?provider=${provider}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const data = await res.json();
      if (data.status === 'success') setDetailEntry(data.data);
      else setDetailEntry({ _error: data.message });
    } catch {
      setDetailEntry({ _error: 'Erreur réseau' });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-5" dir="ltr">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Réservations Fournisseur</h2>
          <p className="text-xs text-gray-500 mt-0.5">Consultez les réservations directement chez le fournisseur</p>
        </div>
        <button onClick={() => fetchBookings(pagination.page)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-xs font-medium transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Provider tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {SUPPLIERS.map(s => (
          <button
            key={s.id}
            onClick={() => s.available && setProvider(s.id)}
            disabled={!s.available}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              s.id === provider && s.available
                ? 'bg-white text-primary-700 shadow-sm'
                : s.available
                  ? 'text-gray-600 hover:text-gray-900'
                  : 'text-gray-400 cursor-not-allowed line-through'
            }`}
          >
            {s.label}
            {!s.available && <span className="ml-1.5 text-[9px] normal-case no-underline">(bientôt)</span>}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setFiltersOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2"><Filter size={14} />Filtres</span>
          <ChevronRight size={14} className={`transition-transform ${filtersOpen ? 'rotate-90' : ''}`} />
        </button>
        {filtersOpen && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">ID Réservation</label>
                <input
                  type="text" placeholder="381575"
                  value={filters.booking}
                  onChange={e => setFilters(f => ({ ...f, booking: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">ID Hôtel</label>
                <input
                  type="text" placeholder="43"
                  value={filters.hotel}
                  onChange={e => setFilters(f => ({ ...f, hotel: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">État</label>
                <select
                  value={filters.state}
                  onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 bg-white"
                >
                  {STATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check-in (début)</label>
                <input
                  type="date" value={filters.fromCheckIn}
                  onChange={e => setFilters(f => ({ ...f, fromCheckIn: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Check-in (fin)</label>
                <input
                  type="date" value={filters.toCheckIn}
                  onChange={e => setFilters(f => ({ ...f, toCheckIn: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={handleSearch}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-xs font-semibold transition-colors">
                <Search size={13} />Rechercher
              </button>
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:border-gray-300 rounded-lg text-xs font-semibold transition-colors">
                <X size={13} />Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500">
            {loading ? 'Chargement...' : `${pagination.total} réservations — page ${pagination.page}/${pagination.countPage}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-b border-red-100">
            <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={24} className="animate-spin text-primary-700" />
          </div>
        )}

        {/* Empty */}
        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-16">
            <Calendar size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucune réservation trouvée</p>
          </div>
        )}

        {/* Table */}
        {!loading && bookings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['ID', 'Hôtel', 'Ville', 'Check-in', 'Check-out', 'Nuit(s)', 'Ch.', 'Prix', 'État', ''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => {
                  const n = nights(b.CheckIn, b.CheckOut);
                  return (
                    <tr key={b.Id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-gray-900 whitespace-nowrap">#{b.Id}</td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <p className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[160px]">{b.Hotel?.Name}</p>
                        {b.Hotel?.Category?.Star > 0 && <Stars n={b.Hotel.Category.Star} />}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{b.Hotel?.City?.Name || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap font-medium">{b.CheckIn}</td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap font-medium">{b.CheckOut}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 text-center">{n || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 text-center">{b.Rooms?.length || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-900">{parseFloat(b.TotalPrice).toFixed(3)}</span>
                        <span className="text-[10px] text-gray-400 ml-1">{b.Currency}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${stateBadge(b.State)}`}>
                          {stateIcon(b.State)}{b.State}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(b.Id)}
                          className="text-xs font-semibold text-primary-700 hover:text-primary-900 transition-colors whitespace-nowrap flex items-center gap-1"
                        >
                          <ExternalLink size={12} />Détails
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.countPage > 1 && !loading && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => handlePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-300 transition-colors"
            >
              <ChevronLeft size={14} />Précédent
            </button>
            <p className="text-xs text-gray-500">
              Page <strong>{pagination.page}</strong> / {pagination.countPage}
            </p>
            <button
              onClick={() => handlePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.countPage}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-300 transition-colors"
            >
              Suivant<ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="ltr">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDetailOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {detailLoading && (
              <div className="p-14 flex flex-col items-center gap-4">
                <RefreshCw size={32} className="animate-spin text-primary-700" />
                <p className="text-sm text-gray-500">Chargement des détails...</p>
              </div>
            )}
            {!detailLoading && detailEntry?._error && (
              <div className="p-8 text-center">
                <AlertCircle size={32} className="text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-600">{detailEntry._error}</p>
                <button onClick={() => setDetailOpen(false)}
                  className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                  Fermer
                </button>
              </div>
            )}
            {!detailLoading && detailEntry && !detailEntry._error && (
              <>
                <BookingDetailContent entry={detailEntry} onClose={() => setDetailOpen(false)} />
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                  <button onClick={() => setDetailOpen(false)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierBookings;
