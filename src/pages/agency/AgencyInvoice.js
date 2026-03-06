import React, { useState } from 'react';
import { FileText, Printer, RefreshCw, AlertCircle } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { API_ENDPOINTS } from '../../config/api';

const fmt = (n) => new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3 }).format(n ?? 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-TN') : '—';

export default function AgencyInvoice() {
  const { agency, agencyFetch, isAgencyAdmin } = useAgency();
  const now = new Date();
  const [from, setFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
  const [to,   setTo]   = useState(now.toISOString().slice(0, 10));
  const [status, setStatus] = useState('confirmed');
  const [data,   setData]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleGenerate = async () => {
    setLoading(true); setError(''); setData(null);
    const params = new URLSearchParams({ from, to, status }).toString();
    const res  = await agencyFetch(`${API_ENDPOINTS.AGENCY_INVOICE}?${params}`);
    const json = await res.json();
    if (json.status === 'success') {
      setData(json.data);
    } else {
      setError(json.message || 'Erreur lors de la génération');
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Factures</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Générez vos relevés de compte pour une période donnée.</p>
      </div>

      {/* Controls */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, marginBottom: 24, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {[{ label: 'Du', val: from, set: setFrom }, { label: 'Au', val: to, set: setTo }].map(({ label, val, set }) => (
          <div key={label}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
            <input type="date" value={val} onChange={e => set(e.target.value)} style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
          </div>
        ))}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Statut</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}>
            <option value="confirmed">Confirmées</option>
            <option value="pending">En attente</option>
            <option value="">Tous</option>
          </select>
        </div>
        <button onClick={handleGenerate} disabled={loading} style={{ padding: '10px 24px', background: loading ? '#9ca3af' : '#005096', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
          {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Génération...</> : <><FileText size={14} /> Générer</>}
        </button>
        {data && (
          <button onClick={() => window.print()} style={{ padding: '10px 18px', background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Printer size={14} /> Imprimer
          </button>
        )}
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#b91c1c', display: 'flex', gap: 8 }}><AlertCircle size={14} />{error}</div>}

      {/* Invoice */}
      {data && (
        <div id="printable-invoice" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 32 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 24, borderBottom: '2px solid #005096' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#005096' }}>RELEVÉ DE COMPTE</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Période: {fmtDate(from)} → {fmtDate(to)}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Généré le {fmtDate(new Date())}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{data.agency.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{data.agency.code}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{data.agency.email}</div>
              {data.agency.address?.city && (
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{data.agency.address.city}, {data.agency.address.country}</div>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  {['Code', 'Hôtel', 'Arrivée', 'Départ', 'Coût frs.', 'Majoration', 'Prix client', isAgencyAdmin && 'Commission', isAgencyAdmin && 'Profit net', 'Statut'].filter(Boolean).map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.bookings.map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#005096', fontWeight: 700 }}>{b.confirmationCode}</td>
                    <td style={{ padding: '10px 12px', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.hotel || '—'}</td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{b.checkIn || '—'}</td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{b.checkOut || '—'}</td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{fmt(b.providerPrice)}</td>
                    <td style={{ padding: '10px 12px', color: '#10b981', whiteSpace: 'nowrap' }}>+{fmt(b.markupAmount)}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#005096', whiteSpace: 'nowrap' }}>{fmt(b.clientPrice)}</td>
                    {isAgencyAdmin && <td style={{ padding: '10px 12px', color: '#f59e0b', whiteSpace: 'nowrap' }}>-{fmt(b.commissionAmount)}</td>}
                    {isAgencyAdmin && <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(b.netProfit)}</td>}
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: b.status === 'confirmed' ? '#ecfdf5' : '#f9fafb', color: b.status === 'confirmed' ? '#059669' : '#6b7280' }}>{b.status}</span>
                    </td>
                  </tr>
                ))}
                {data.bookings.length === 0 && <tr><td colSpan={10} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Aucune réservation pour cette période</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 300, background: '#f9fafb', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 12 }}>Total période</div>
              {[
                { label: 'Coût fournisseur',  value: `${fmt(data.totals.providerCostTotal)} TND` },
                { label: 'Majorations',       value: `${fmt(data.totals.markupTotal)} TND`, color: '#10b981' },
                { label: 'Prix clients',      value: `${fmt(data.totals.clientTotalPrice)} TND`, color: '#005096', bold: true },
                ...(isAgencyAdmin ? [
                  { label: 'Commission plateforme', value: `${fmt(data.totals.commissionTotal)} TND`, color: '#f59e0b' },
                  { label: 'Profit net',           value: `${fmt(data.totals.netProfitTotal)} TND`, color: '#10b981', bold: true },
                ] : []),
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 500, color: r.color || '#111827' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          body > *:not(#printable-invoice) { display: none !important; }
          #printable-invoice { border: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
