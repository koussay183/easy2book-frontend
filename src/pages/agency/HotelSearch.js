import React, { useState } from 'react';
import { Search, Calendar, Users, Tag, AlertCircle, Loader, Hotel } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { API_ENDPOINTS } from '../../config/api';

const fmt = (n) => new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 0 }).format(n ?? 0);

export default function HotelSearch() {
  const { agency, agencyFetch } = useAgency();

  const today    = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    City: '', CheckIn: today, CheckOut: tomorrow, Adults: 2, Children: 0,
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!form.City) { setError('Veuillez entrer un code de ville'); return; }
    setLoading(true); setError(''); setResults(null);
    const params = new URLSearchParams(form).toString();
    const res  = await agencyFetch(`${API_ENDPOINTS.AGENCY_HOTELS_SEARCH}?${params}`);
    const data = await res.json();
    if (data.status === 'success') {
      setResults(data.data);
    } else {
      setError(data.message || 'Erreur lors de la recherche');
    }
    setLoading(false);
  };

  const markup = agency?.markup;
  const markupLabel = markup?.enabled
    ? markup.type === 'percentage'
      ? `+${markup.value}% majoration appliquée`
      : `+${markup.value} TND majoration appliquée`
    : 'Aucune majoration configurée';

  // Extract hotels from various possible myGo response structures
  const hotels = results?.HotelSearch || results?.Hotels || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Recherche Hôtels</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
          Recherchez des disponibilités. Les prix affichés incluent votre majoration.
        </p>
      </div>

      {/* Markup info banner */}
      <div style={{ background: markup?.enabled ? '#eff6ff' : '#f9fafb', border: `1px solid ${markup?.enabled ? '#bfdbfe' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tag size={14} color={markup?.enabled ? '#005096' : '#9ca3af'} />
        <span style={{ fontSize: 12, color: markup?.enabled ? '#005096' : '#6b7280', fontWeight: 500 }}>{markupLabel}</span>
      </div>

      {/* Search form */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Code Ville</label>
              <input value={form.City} onChange={e => setForm(f => ({ ...f, City: e.target.value }))} placeholder="Ex: 1 (Tunis)" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Arrivée</label>
              <input type="date" value={form.CheckIn} onChange={e => setForm(f => ({ ...f, CheckIn: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Départ</label>
              <input type="date" value={form.CheckOut} onChange={e => setForm(f => ({ ...f, CheckOut: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Adultes</label>
              <input type="number" min={1} max={9} value={form.Adults} onChange={e => setForm(f => ({ ...f, Adults: parseInt(e.target.value) || 1 }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={14} color="#ef4444" />
              <span style={{ fontSize: 12, color: '#b91c1c' }}>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ padding: '12px 28px', background: loading ? '#9ca3af' : '#005096', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Recherche...</> : <><Search size={14} /> Rechercher</>}
          </button>
        </form>
      </div>

      {/* Results */}
      {hotels.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{hotels.length} hôtel{hotels.length > 1 ? 's' : ''} trouvé{hotels.length > 1 ? 's' : ''}</div>
          {hotels.slice(0, 20).map((hotel, idx) => {
            const rooms = hotel.Rooms || [];
            const minRoom = rooms.reduce((m, r) => {
              const p = parseFloat(r._clientPrice || r.Price || 0);
              return p < m.price ? { price: p, supplierPrice: parseFloat(r._supplierPrice || r.Price || 0), markup: parseFloat(r._markupAmount || 0) } : m;
            }, { price: Infinity, supplierPrice: 0, markup: 0 });

            return (
              <div key={idx} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{hotel.HotelName || `Hôtel #${hotel.Hotel}`}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{hotel.CategoryName || ''} {hotel.City || ''}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{rooms.length} option{rooms.length > 1 ? 's' : ''} disponible{rooms.length > 1 ? 's' : ''}</div>
                  </div>
                  {minRoom.price < Infinity && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {markup?.enabled && minRoom.markup > 0 && (
                        <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>{fmt(minRoom.supplierPrice)} TND</div>
                      )}
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#005096' }}>À partir de {fmt(minRoom.price)} TND</div>
                      {markup?.enabled && minRoom.markup > 0 && (
                        <div style={{ fontSize: 11, background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginTop: 2 }}>
                          +{fmt(minRoom.markup)} TND marge
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {results && hotels.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
          <Hotel size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600 }}>Aucun hôtel disponible</div>
          <div style={{ fontSize: 13 }}>Essayez d'autres dates ou une autre ville</div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
