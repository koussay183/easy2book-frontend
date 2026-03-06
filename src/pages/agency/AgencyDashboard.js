import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, Calendar, FileText, Tag, Users,
  Building2, LogOut, Menu, X, ChevronRight, ChevronLeft,
  CreditCard, TrendingUp, AlertCircle, Bell,
} from 'lucide-react';
import { useAuth }     from '../../context/AuthContext';
import { useAgency }   from '../../context/AgencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_ENDPOINTS } from '../../config/api';

import HotelSearch    from './HotelSearch';
import AgencyBookings from './AgencyBookings';
import MarkupSettings from './MarkupSettings';
import AgencyInvoice  from './AgencyInvoice';
import StaffManager   from './StaffManager';
import AgencyProfile  from './AgencyProfile';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Tableau de bord',  icon: LayoutDashboard },
  { id: 'search',    label: 'Recherche Hôtels', icon: Search },
  { id: 'bookings',  label: 'Réservations',     icon: Calendar },
  { id: 'invoice',   label: 'Factures',         icon: FileText },
  { id: 'markup',    label: 'Mes Tarifs',       icon: Tag,      adminOnly: true },
  { id: 'staff',     label: 'Mon Équipe',       icon: Users,    adminOnly: true },
  { id: 'profile',   label: 'Mon Agence',       icon: Building2 },
];

const STATUS_STYLE = {
  pending:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  confirmed: { bg: '#ecfdf5', color: '#059669', border: '#6ee7b7' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  completed: { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = '#005096', highlight }) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${color}08, ${color}15)` : '#fff',
      border: `1px solid ${highlight ? color + '30' : '#e5e7eb'}`,
      borderRadius: 14, padding: '20px 22px',
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 3 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>}
    </div>
  );
}

function OverviewTab() {
  const { agency, agencyFetch, isAgencyAdmin } = useAgency();
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agencyFetch(API_ENDPOINTS.AGENCY_DASHBOARD)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') { setStats(d.data); setRecent(d.data.recentBookings || []); }
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = n => new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 0 }).format(n ?? 0);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 100, background: '#f3f4f6', borderRadius: 14, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  );

  const available = stats?.availableCredit || 0;
  const limit     = stats?.creditLimit     || 0;
  const balance   = stats?.creditBalance   || 0;
  const usedPct   = limit > 0 ? Math.max(0, Math.min(100, ((limit - available) / limit) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard highlight icon={CreditCard}   label="Crédit disponible"    value={`${fmt(available)} TND`}             sub={`Limite: ${fmt(limit)} TND`}        color="#005096" />
        <StatCard          icon={Calendar}      label="Réservations ce mois" value={fmt(stats?.monthBookings)}            sub="réservations"                       color="#8b5cf6" />
        <StatCard          icon={TrendingUp}    label="CA du mois"            value={`${fmt(stats?.monthRevenue)} TND`}   sub="chiffre d'affaires"                 color="#10b981" />
        {isAgencyAdmin && <StatCard icon={TrendingUp} label="Profit net"     value={`${fmt(stats?.monthNetProfit)} TND`} sub="après commission ce mois"           color="#f59e0b" />}
        <StatCard          icon={Calendar}      label="En attente"            value={fmt(stats?.pendingBookings)}         sub="à confirmer"                        color="#f59e0b" />
        <StatCard          icon={Calendar}      label="Total confirmées"      value={fmt(stats?.confirmedBookings)}       sub="réservations"                       color="#10b981" />
      </div>

      {/* Credit bar */}
      {limit > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 4, height: 18, background: '#005096', borderRadius: 4 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Utilisation du crédit</span>
            </div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              <strong style={{ color: '#111827' }}>{fmt(available)} TND</strong> disponibles sur {fmt(limit)} TND
            </span>
          </div>
          <div style={{ height: 8, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              width: `${usedPct}%`, height: '100%', borderRadius: 6, transition: 'width 0.7s ease',
              background: usedPct > 80 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : '#10b981',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#9ca3af' }}>
            <span>0 TND</span>
            <span style={{ color: usedPct > 80 ? '#ef4444' : '#9ca3af', fontWeight: usedPct > 80 ? 600 : 400 }}>
              {usedPct.toFixed(0)}% utilisé
            </span>
            <span>{fmt(limit)} TND</span>
          </div>
          {balance < 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#ef4444', fontSize: 12, fontWeight: 500 }}>
              <AlertCircle size={14} /> Solde négatif: {fmt(balance)} TND — Veuillez régulariser votre compte
            </div>
          )}
        </div>
      )}

      {/* Recent bookings */}
      {recent.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 20, background: '#005096', borderRadius: 4 }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Réservations récentes</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Code', 'Hôtel', 'Check-in', 'Nuits', 'Prix client', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(b => (
                  <tr key={b._id} style={{ borderTop: '1px solid #f3f4f6', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background='#f9fafb'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontSize: 12, color: '#005096', fontWeight: 700 }}>{b.confirmationCode || '—'}</td>
                    <td style={{ padding: '12px 18px', color: '#374151', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.hotelBooking?.HotelName || b.hotelBooking?.Hotel || '—'}</td>
                    <td style={{ padding: '12px 18px', color: '#6b7280', whiteSpace: 'nowrap' }}>{b.hotelBooking?.CheckIn || '—'}</td>
                    <td style={{ padding: '12px 18px', color: '#6b7280', textAlign: 'center' }}>{b.nights || '—'}</td>
                    <td style={{ padding: '12px 18px', color: '#111827', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(b.totalPrice)} <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>TND</span></td>
                    <td style={{ padding: '12px 18px' }}><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function AgencyDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const { agency, loading: agLoading, isAgencyAdmin } = useAgency();
  const { language } = useLanguage();
  const isRTL  = language === 'ar';
  const navigate = useNavigate();
  const [tab,         setTab]    = useState('overview');
  const [sidebarOpen, setSidebar] = useState(false);

  useEffect(() => {
    if (!authLoading && !agLoading) {
      if (!user) { navigate('/agency/login'); return; }
      if (!['agency_admin', 'agency_staff'].includes(user.role)) navigate('/agency/login');
    }
  }, [user, authLoading, agLoading, navigate]);

  const handleLogout = async () => { await logout(); navigate('/agency/login'); };
  const visibleNav   = NAV_ITEMS.filter(n => !n.adminOnly || isAgencyAdmin);

  const TabContent = {
    overview:  <OverviewTab />,
    search:    <HotelSearch />,
    bookings:  <AgencyBookings />,
    invoice:   <AgencyInvoice />,
    markup:    isAgencyAdmin ? <MarkupSettings /> : null,
    staff:     isAgencyAdmin ? <StaffManager   /> : null,
    profile:   <AgencyProfile />,
  };

  const activeLabel = visibleNav.find(n => n.id === tab)?.label || '';

  if (authLoading || agLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#005096', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#9ca3af' }}>Chargement du portail…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const sideW = 256;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', overflow: 'hidden', direction: isRTL ? 'rtl' : 'ltr', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebar(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside style={{
        width: sideW,
        background: '#fff',
        borderRight: isRTL ? 'none' : '1px solid #e5e7eb',
        borderLeft:  isRTL ? '1px solid #e5e7eb' : 'none',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, [isRTL ? 'right' : 'left']: 0,
        height: '100vh', zIndex: 50,
        transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.12)' : 'none',
      }}>

        {/* Logo + Agency */}
        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f0f4f8' }}>
          {/* Agency identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: 'linear-gradient(135deg, #005096 0%, #0077cc 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,80,150,0.25)',
            }}>
              <Building2 size={18} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {agency?.name || 'Agence'}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                {agency?.code || ''} · {isAgencyAdmin ? 'Administrateur' : 'Collaborateur'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
          {visibleNav.map(item => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSidebar(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: 10, padding: '9px 12px',
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  marginBottom: 2, fontFamily: 'inherit',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  textAlign: isRTL ? 'right' : 'left',
                  background: active ? 'linear-gradient(90deg, #eff6ff 0%, #e0f0ff 100%)' : 'transparent',
                  color: active ? '#005096' : '#64748b',
                  fontWeight: active ? 700 : 500, fontSize: 13,
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  outline: 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Active indicator bar */}
                {active && (
                  <div style={{
                    position: 'absolute', [isRTL ? 'right' : 'left']: 0, top: 6, bottom: 6,
                    width: 3, borderRadius: 4, background: '#005096',
                  }} />
                )}
                <item.icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && (
                  isRTL
                    ? <ChevronLeft  size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
                    : <ChevronRight size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f4f8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#005096',
            }}>
              {(user?.firstName?.[0] || '?').toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, width: '100%', fontFamily: 'inherit', fontWeight: 500, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────── */}
      <div style={{ [isRTL ? 'marginRight' : 'marginLeft']: sideW, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebar(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#64748b', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13 }}>
              <span>Portail Agence</span>
              <ChevronRight size={14} style={{ opacity: 0.5 }} />
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{activeLabel}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Credit indicator */}
            {agency && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
                <CreditCard size={13} color="#0284c7" />
                <span style={{ fontSize: 12, color: '#0284c7', fontWeight: 700 }}>
                  {new Intl.NumberFormat('fr-TN').format((agency.creditBalance || 0) + (agency.creditLimit || 0))} TND
                </span>
                <span style={{ fontSize: 11, color: '#7dd3fc' }}>disponible</span>
              </div>
            )}
            <button
              onClick={() => setTab('bookings')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#64748b', display: 'flex', alignItems: 'center', position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            {TabContent[tab] || null}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes pulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
