import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Filter, Calendar, ChevronLeft, ChevronRight, X, DollarSign, AlertCircle } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { API_ENDPOINTS } from '../../config/api';

const fmt = (n) => new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 0 }).format(n ?? 0);

const STATUS_STYLE = {
  pending:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  confirmed: { bg: '#ecfdf5', color: '#059669', border: '#6ee7b7' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  completed: { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: 'capitalize' }}>{status}</span>;
}

function BookingDrawer({ booking, onClose, onCancel, cancelling }) {
  const { isAgencyAdmin } = useAgency();
  if (!booking) return null;
  const hb = booking.hotelBooking || {};
  const b2b = booking.b2bCommission || {};

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 480, height: '100%', overflowY: 'auto', borderLeft: '1px solid #e5e7eb', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', padding: 24 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Détail de la réservation</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Code + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge status={booking.status} />
            <code style={{ fontSize: 13, background: '#f3f4f6', padding: '3px 8px', borderRadius: 6, color: '#005096', fontWeight: 700 }}>{booking.confirmationCode}</code>
          </div>

          {/* Hotel info */}
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}>{hb.HotelName || `Hôtel #${hb.Hotel}`}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Arrivée: <b>{hb.CheckIn}</b> — Départ: <b>{hb.CheckOut}</b></div>
          </div>

          {/* Pricing breakdown */}
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 10, textTransform: 'uppercase' }}>Détail financier</div>
            {[
              { label: 'Coût fournisseur', value: `${fmt(booking.providerPrice)} TND`, color: '#374151' },
              { label: 'Majoration',        value: `+${fmt(booking.margin)} TND`,       color: '#10b981' },
              { label: 'Prix client',       value: `${fmt(booking.totalPrice)} TND`,    color: '#005096', bold: true },
              ...(isAgencyAdmin ? [
                { label: 'Commission plateforme', value: `-${fmt(b2b.amount)} TND (${b2b.rate}%)`, color: '#f59e0b' },
                { label: 'Profit net',           value: `${fmt(booking.b2bNetProfit)} TND`,       color: '#10b981', bold: true },
              ] : []),
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 500, color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Cancel button */}
          {['pending', 'confirmed'].includes(booking.status) && (
            <button
              onClick={() => onCancel(booking._id)}
              disabled={cancelling}
              style={{ padding: '12px', background: cancelling ? '#f9fafb' : '#fef2f2', color: cancelling ? '#9ca3af' : '#dc2626', border: '1px solid #fca5a5', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: cancelling ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {cancelling ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Annulation...</> : 'Annuler la réservation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgencyBookings() {
  const { agencyFetch, isAgencyAdmin } = useAgency();
  const [bookings,   setBookings]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [statusFilter, setStatus]   = useState('');
  const [search,       setSearch]   = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (statusFilter) params.set('status', statusFilter);
    if (search)       params.set('search', search);
    const res  = await agencyFetch(`${API_ENDPOINTS.AGENCY_BOOKINGS}?${params}`);
    const data = await res.json();
    if (data.status === 'success') {
      setBookings(data.data.bookings || []);
      setTotal(data.data.total || 0);
    }
    setLoading(false);
  }, [page, statusFilter, search, agencyFetch]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    setCancelling(true);
    const res  = await agencyFetch(API_ENDPOINTS.AGENCY_BOOKING_CANCEL(id), { method: 'PATCH', body: JSON.stringify({}) });
    const data = await res.json();
    if (data.status === 'success') {
      setSelected(null);
      fetchBookings();
    } else {
      alert(data.message || 'Erreur lors de l\'annulation');
    }
    setCancelling(false);
  };

  const pages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Réservations</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{total} réservation{total !== 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={fetchBookings} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Actualiser
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} color="#6b7280" />
        <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', color: '#374151' }}>
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="cancelled">Annulées</option>
          <option value="completed">Terminées</option>
        </select>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Code confirmation..."
          style={{ fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', color: '#374151', width: 180 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #f3f4f6' }}>
                {['Code', 'Hôtel', 'Check-in', 'Coût fournisseur', 'Prix client', isAgencyAdmin && 'Profit net', 'Statut', ''].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Chargement...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Aucune réservation trouvée</td></tr>
              ) : bookings.map(b => (
                <tr key={b._id} style={{ borderTop: '1px solid #f9fafb', cursor: 'pointer' }} onClick={() => setSelected(b)}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#005096', fontWeight: 700 }}>{b.confirmationCode}</td>
                  <td style={{ padding: '12px 16px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151', fontWeight: 500 }}>{b.hotelBooking?.HotelName || b.hotelBooking?.Hotel || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{b.hotelBooking?.CheckIn || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmt(b.providerPrice)} TND</td>
                  <td style={{ padding: '12px 16px', color: '#005096', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(b.totalPrice)} TND</td>
                  {isAgencyAdmin && <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(b.b2bNetProfit)} TND</td>}
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={b.status} /></td>
                  <td style={{ padding: '12px 16px' }}><ChevronRight size={14} color="#9ca3af" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#9ca3af' : '#374151', fontSize: 12 }}>
              <ChevronLeft size={14} /> Préc.
            </button>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Page {page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: page === pages ? 'not-allowed' : 'pointer', color: page === pages ? '#9ca3af' : '#374151', fontSize: 12 }}>
              Suiv. <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {selected && <BookingDrawer booking={selected} onClose={() => setSelected(null)} onCancel={handleCancel} cancelling={cancelling} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
