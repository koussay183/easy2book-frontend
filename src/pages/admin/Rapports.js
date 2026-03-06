import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar,
  Users, Hotel, Zap, RefreshCw, Download, ChevronDown,
  ArrowUpRight, ArrowDownRight, Minus, Filter, Activity,
  CheckCircle, XCircle, Clock, Star
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n, dec = 0) =>
  new Intl.NumberFormat('fr-TN', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n ?? 0);

const fmtTND = (n) => `${fmt(n, 0)} TND`;

const STATUS_META = {
  pending:   { label: 'En attente',  color: '#f59e0b', bg: '#fffbeb' },
  confirmed: { label: 'Confirmée',   color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Annulée',     color: '#ef4444', bg: '#fef2f2' },
  completed: { label: 'Terminée',    color: '#3b82f6', bg: '#eff6ff' },
};

const METHOD_META = {
  agency:    { label: 'Agence',      color: '#8b5cf6' },
  wafacash:  { label: 'Wafacash',    color: '#ec4899' },
  izi:       { label: 'IZI',         color: '#f97316' },
  online:    { label: 'En ligne',    color: '#06b6d4' },
};

const PRESETS = [
  { label: 'Aujourd\'hui',    days: 0   },
  { label: '7 derniers jours', days: 7  },
  { label: '30 derniers jours', days: 30 },
  { label: 'Ce mois',         days: -1  },
  { label: '3 mois',          days: 90  },
  { label: '6 mois',          days: 180 },
  { label: 'Cette année',     days: -2  },
];

function calcPreset(preset) {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  if (preset.days === -1) {
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    return { from, to };
  }
  if (preset.days === -2) {
    const from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
    return { from, to };
  }
  if (preset.days === 0) {
    const t = new Date(); t.setHours(0,0,0,0);
    return { from: t.toISOString().slice(0,10), to };
  }
  const from = new Date(now - preset.days * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

const token = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
const authHdr = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

const apiFetch = (url) => fetch(url, { headers: authHdr() }).then(r => r.json());

// ─── sub-components ───────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, subtitle, changePct, color = '#005096', loading }) {
  const up = changePct > 0;
  const down = changePct < 0;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      {loading ? (
        <div style={{ height: 32, background: '#f3f4f6', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
      )}
      {subtitle && <div style={{ fontSize: 12, color: '#9ca3af' }}>{subtitle}</div>}
      {changePct !== null && changePct !== undefined && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: up ? '#10b981' : down ? '#ef4444' : '#6b7280' }}>
          {up ? <ArrowUpRight size={14} /> : down ? <ArrowDownRight size={14} /> : <Minus size={14} />}
          {Math.abs(changePct)}% vs période précédente
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 4, height: 24, background: '#005096', borderRadius: 4 }} />
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={16} color="#005096" /> {title}
        </div>
        {subtitle && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function BarRow({ label, value, max, color, extra }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 120, fontSize: 13, color: '#374151', fontWeight: 500, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ fontSize: 13, color: '#111827', fontWeight: 600, minWidth: 40, textAlign: 'right' }}>{value}</div>
      {extra && <div style={{ fontSize: 12, color: '#6b7280', minWidth: 80, textAlign: 'right' }}>{extra}</div>}
    </div>
  );
}

function RevenueChart({ data, loading }) {
  if (loading) return <div style={{ height: 180, background: '#f9fafb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Chargement...</div>;
  if (!data?.length) return <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>Aucune donnée pour cette période</div>;

  const maxRev = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, minWidth: Math.max(400, data.length * 44), height: 180, padding: '0 4px' }}>
        {data.map((d, i) => {
          const h = Math.max(4, Math.round((d.revenue / maxRev) * 160));
          return (
            <div key={d._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 36 }}>
              <div style={{ fontSize: 10, color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtTND(d.revenue)}</div>
              <div
                title={`${d._id}\n${d.count} résas — ${fmtTND(d.revenue)}`}
                style={{ width: '80%', height: h, background: 'linear-gradient(180deg,#005096,#0077cc)', borderRadius: '4px 4px 0 0', cursor: 'default', transition: 'height 0.4s ease' }}
              />
              <div style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', transform: 'rotate(-30deg)', transformOrigin: 'top center', marginTop: 4 }}>{d._id}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FunnelChart({ steps }) {
  const maxCount = steps?.[0]?.count || 1;
  const colors = { total: '#6b7280', confirmed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', completed: '#3b82f6' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(steps || []).map(step => {
        const pct = Math.round((step.count / maxCount) * 100);
        const c = colors[step.key] || '#8b5cf6';
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 90, fontSize: 12, color: '#374151', fontWeight: 500, flexShrink: 0, textTransform: 'capitalize' }}>{STATUS_META[step.key]?.label || step.label}</div>
            <div style={{ flex: 1, height: 24, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 6, transition: 'width 0.6s ease', opacity: 0.85 }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: 12, fontWeight: 600, color: '#111827' }}>{step.count}</div>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', minWidth: 40, textAlign: 'right' }}>{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

function SupplierRow({ cfg, stats }) {
  const successRate = stats?.totalCalls ? Math.round((stats.successCalls / stats.totalCalls) * 100) : null;
  const latency = stats?.avgDuration ? Math.round(stats.avgDuration) : null;
  const latencyColor = !latency ? '#9ca3af' : latency < 1000 ? '#10b981' : latency < 3000 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.enabled ? (cfg.isPrimary ? '#005096' : '#10b981') : '#d1d5db', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
          {cfg.label || cfg.supplierId}
          {cfg.isPrimary && <span style={{ fontSize: 10, fontWeight: 600, background: '#eff6ff', color: '#005096', padding: '2px 6px', borderRadius: 4 }}>SOURCE B2C</span>}
          {!cfg.enabled && <span style={{ fontSize: 10, color: '#9ca3af' }}>Désactivé</span>}
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>{cfg.supplierId}</div>
      </div>
      {stats ? (
        <>
          <div style={{ textAlign: 'center', minWidth: 60 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{fmt(stats.totalCalls)}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>appels</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 70 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: successRate >= 95 ? '#10b981' : successRate >= 80 ? '#f59e0b' : '#ef4444' }}>{successRate ?? 'N/A'}%</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>succès</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 70 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: latencyColor }}>{latency ? `${latency}ms` : 'N/A'}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>latence moy.</div>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: '#d1d5db' }}>Aucune donnée</div>
      )}
    </div>
  );
}

// ─── TABS ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',   label: 'Vue d\'ensemble', icon: BarChart3 },
  { id: 'revenue',    label: 'Revenus',          icon: DollarSign },
  { id: 'hotels',     label: 'Hôtels',           icon: Hotel },
  { id: 'suppliers',  label: 'Fournisseurs',     icon: Zap },
  { id: 'funnel',     label: 'Entonnoir',        icon: Activity },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Rapports() {
  const today = new Date().toISOString().slice(0, 10);
  const [tab, setTab]           = useState('overview');
  const [from, setFrom]         = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10);
  });
  const [to, setTo]             = useState(today);
  const [groupBy, setGroupBy]   = useState('month');
  const [activePreset, setPreset] = useState(2); // "30 derniers jours"
  const [loading, setLoading]   = useState({});
  const [data, setData]         = useState({});
  const [error, setError]       = useState(null);

  const load = useCallback(async (tabId, f = from, t = to) => {
    const endpoints = {
      overview:  () => `${API_BASE_URL}/api/admin/reports/overview?from=${f}&to=${t}`,
      revenue:   () => `${API_BASE_URL}/api/admin/reports/revenue?from=${f}&to=${t}&groupBy=${groupBy}`,
      hotels:    () => `${API_BASE_URL}/api/admin/reports/hotels?from=${f}&to=${t}&limit=10`,
      suppliers: () => `${API_BASE_URL}/api/admin/reports/suppliers?from=${f}&to=${t}`,
      funnel:    () => `${API_BASE_URL}/api/admin/reports/funnel?from=${f}&to=${t}`,
    };
    const url = endpoints[tabId]?.();
    if (!url) return;
    setLoading(l => ({ ...l, [tabId]: true }));
    setError(null);
    try {
      const resp = await apiFetch(url);
      if (resp.status === 'success') {
        setData(d => ({ ...d, [tabId]: resp.data }));
      } else {
        setError(resp.message || 'Erreur serveur');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(l => ({ ...l, [tabId]: false }));
    }
  }, [from, to, groupBy]);

  useEffect(() => { load(tab); }, [tab, from, to, groupBy]);

  function applyPreset(idx) {
    setPreset(idx);
    const { from: f, to: t } = calcPreset(PRESETS[idx]);
    setFrom(f); setTo(t);
  }

  const isLoading = !!loading[tab];
  const d = data[tab] || {};

  // ── TAB: OVERVIEW ───────────────────────────────────────────────────────────
  function renderOverview() {
    const k = d.kpis || {};
    const totalStatusCount = (d.statusBreakdown || []).reduce((s, i) => s + i.count, 0);
    const totalMethodCount = (d.paymentMethodBreakdown || []).reduce((s, i) => s + i.count, 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard icon={Calendar}   label="Total réservations" value={fmt(k.totalCount?.value)}   loading={isLoading} color="#005096" />
          <KpiCard icon={TrendingUp} label="Période sélectionnée" value={fmt(k.periodCount?.value)} changePct={k.periodCount?.changePct} loading={isLoading} color="#8b5cf6" />
          <KpiCard icon={DollarSign} label="Revenus période"   value={fmtTND(k.periodRevenue?.value)} changePct={k.periodRevenue?.changePct} loading={isLoading} color="#10b981" />
          <KpiCard icon={DollarSign} label="Revenus totaux"    value={fmtTND(k.totalRevenue?.value)}  loading={isLoading} color="#f59e0b" />
          <KpiCard icon={BarChart3}  label="Valeur moy. résas" value={fmtTND(k.avgBookingValue?.value)} loading={isLoading} color="#ec4899" />
          <KpiCard icon={CheckCircle} label="Taux de conversion" value={`${k.conversionRate?.value ?? 0}%`} loading={isLoading} color="#10b981" />
          <KpiCard icon={XCircle}    label="Taux d'annulation"  value={`${k.cancellationRate?.value ?? 0}%`} loading={isLoading} color="#ef4444" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Status breakdown */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <SectionHeader icon={Activity} title="Répartition par statut" />
            {isLoading ? <div style={{ color: '#9ca3af', fontSize: 13 }}>Chargement...</div> :
              (d.statusBreakdown || []).map(s => (
                <BarRow
                  key={s._id}
                  label={STATUS_META[s._id]?.label || s._id}
                  value={s.count}
                  max={totalStatusCount}
                  color={STATUS_META[s._id]?.color || '#6b7280'}
                  extra={fmtTND(s.revenue)}
                />
              ))
            }
          </div>

          {/* Payment method */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <SectionHeader icon={DollarSign} title="Mode de paiement" />
            {isLoading ? <div style={{ color: '#9ca3af', fontSize: 13 }}>Chargement...</div> :
              (d.paymentMethodBreakdown || []).map(s => (
                <BarRow
                  key={s._id}
                  label={METHOD_META[s._id]?.label || s._id || 'Inconnu'}
                  value={s.count}
                  max={totalMethodCount}
                  color={METHOD_META[s._id]?.color || '#6b7280'}
                />
              ))
            }
          </div>
        </div>
      </div>
    );
  }

  // ── TAB: REVENUE ────────────────────────────────────────────────────────────
  function renderRevenue() {
    const totalRev = (d.byStatus || []).reduce((s, i) => s + i.revenue, 0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <SectionHeader icon={TrendingUp} title="Évolution du chiffre d'affaires" />
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
              style={{ fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', color: '#374151' }}
            >
              <option value="day">Par jour</option>
              <option value="week">Par semaine</option>
              <option value="month">Par mois</option>
            </select>
          </div>
          <RevenueChart data={d.timeline} loading={isLoading} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <SectionHeader icon={Activity} title="Revenus par statut" />
            {(d.byStatus || []).map(s => (
              <BarRow
                key={s._id}
                label={STATUS_META[s._id]?.label || s._id}
                value={fmtTND(s.revenue)}
                max={totalRev}
                color={STATUS_META[s._id]?.color || '#6b7280'}
                extra={`${s.count} résas`}
              />
            ))}
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <SectionHeader icon={DollarSign} title="Revenus par mode de paiement" />
            {(d.byMethod || []).map(s => (
              <BarRow
                key={s._id}
                label={METHOD_META[s._id]?.label || s._id || 'Inconnu'}
                value={fmtTND(s.revenue)}
                max={Math.max(...(d.byMethod || []).map(x => x.revenue), 1)}
                color={METHOD_META[s._id]?.color || '#6b7280'}
                extra={`${s.count} résas`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── TAB: HOTELS ─────────────────────────────────────────────────────────────
  function renderHotels() {
    const avgs = d.averages || {};
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard icon={Hotel}   label="Nuits moy. par résa"   value={fmt(avgs.avgNights, 1)} loading={isLoading} color="#005096" />
          <KpiCard icon={Users}   label="Pax moyen par résa"    value={fmt(avgs.avgPax, 1)}   loading={isLoading} color="#8b5cf6" />
          <KpiCard icon={BarChart3} label="Top hôtels analysés" value={fmt((d.topByBookings || []).length)} loading={isLoading} color="#f59e0b" />
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <SectionHeader icon={Hotel} title="Top hôtels par nombre de réservations" />
          {isLoading ? <div style={{ color: '#9ca3af', fontSize: 13 }}>Chargement...</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    {['#', 'Hôtel', 'Résas', 'Confirmées', 'Annulées', 'Conv.', 'CA total', 'Prix moy.'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(d.topByBookings || []).map((h, i) => (
                    <tr key={h._id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '10px 12px', color: '#9ca3af', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name || `Hôtel #${h._id}`}</td>
                      <td style={{ padding: '10px 12px', color: '#374151', fontWeight: 500 }}>{h.count}</td>
                      <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 500 }}>{h.confirmed}</td>
                      <td style={{ padding: '10px 12px', color: '#ef4444', fontWeight: 500 }}>{h.cancelled}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: '#ecfdf5', color: '#10b981', padding: '2px 8px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                          {h.conversionRate}%
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#005096', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtTND(h.revenue)}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtTND(h.avgPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── TAB: SUPPLIERS ──────────────────────────────────────────────────────────
  function renderSuppliers() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <SectionHeader icon={Zap} title="Performance des fournisseurs" subtitle="Statistiques basées sur les appels API pour la période sélectionnée" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', padding: '6px 0', borderBottom: '2px solid #f3f4f6' }}>FOURNISSEUR</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', padding: '6px 16px', textAlign: 'center', borderBottom: '2px solid #f3f4f6' }}>APPELS</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', padding: '6px 16px', textAlign: 'center', borderBottom: '2px solid #f3f4f6' }}>SUCCÈS</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', padding: '6px 16px', textAlign: 'center', borderBottom: '2px solid #f3f4f6' }}>LATENCE</div>
          </div>
          {isLoading ? <div style={{ color: '#9ca3af', fontSize: 13, padding: '16px 0' }}>Chargement...</div> :
            (d.suppliers || []).map(s => (
              <SupplierRow key={s.supplierId} cfg={s} stats={s.periodStats} />
            ))
          }
        </div>

        {/* Overall stats cards */}
        {!isLoading && (d.suppliers || []).some(s => s.periodStats) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {(d.suppliers || []).filter(s => s.periodStats).map(s => {
              const ps = s.periodStats;
              const rate = ps?.totalCalls ? Math.round((ps.successCalls / ps.totalCalls) * 100) : 0;
              return (
                <KpiCard
                  key={s.supplierId}
                  icon={Zap}
                  label={`${s.label} — Total appels`}
                  value={fmt(ps?.totalCalls)}
                  subtitle={`${rate}% de succès · ${Math.round(ps?.avgDuration || 0)}ms moy.`}
                  color={rate >= 95 ? '#10b981' : rate >= 80 ? '#f59e0b' : '#ef4444'}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── TAB: FUNNEL ─────────────────────────────────────────────────────────────
  function renderFunnel() {
    const ttc = d.timeToConfirm;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {ttc && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            <KpiCard icon={Clock}   label="Délai moy. confirmation" value={`${fmt(ttc.avgHoursToConfirm, 1)}h`} subtitle={`sur ${fmt(ttc.count)} résas confirmées`} loading={isLoading} color="#005096" />
          </div>
        )}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <SectionHeader icon={Activity} title="Entonnoir de conversion" subtitle="Proportion de chaque statut sur le total des réservations créées" />
          {isLoading ? <div style={{ color: '#9ca3af', fontSize: 13 }}>Chargement...</div> : <FunnelChart steps={d.funnelSteps} />}
        </div>
        {(d.dailyCancellations || []).length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <SectionHeader icon={XCircle} title="Annulations quotidiennes" />
            <RevenueChart
              data={(d.dailyCancellations || []).map(c => ({ _id: c._id, revenue: c.count, count: c.count }))}
              loading={isLoading}
            />
          </div>
        )}
      </div>
    );
  }

  const tabContent = { overview: renderOverview, revenue: renderRevenue, hotels: renderHotels, suppliers: renderSuppliers, funnel: renderFunnel };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Rapports & Analytiques</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Performance des réservations, revenus et fournisseurs</p>
        </div>
        <button
          onClick={() => load(tab)}
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}
        >
          <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          Actualiser
        </button>
      </div>

      {/* Date range controls */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Filter size={16} color="#6b7280" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(i)}
              style={{
                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid',
                borderColor: activePreset === i ? '#005096' : '#e5e7eb',
                background: activePreset === i ? '#eff6ff' : '#fff',
                color: activePreset === i ? '#005096' : '#374151',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPreset(null); }}
            style={{ fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', color: '#374151' }} />
          <span style={{ color: '#9ca3af', fontSize: 13 }}>→</span>
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPreset(null); }}
            style={{ fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', color: '#374151' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #f3f4f6', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 13, fontWeight: active ? 600 : 500,
                background: 'transparent', border: 'none', borderBottom: active ? '2px solid #005096' : '2px solid transparent',
                marginBottom: -2, color: active ? '#005096' : '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <t.icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Tab content */}
      {tabContent[tab]?.()}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  );
}
