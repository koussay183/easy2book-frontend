import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, Calendar, FileText, Tag, Users,
  Building2, LogOut, Menu, X, ChevronRight, CreditCard,
  TrendingUp, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAgency } from '../../context/AgencyContext';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';

// Lazy-imported sub-pages (inline for simplicity)
import HotelSearch     from './HotelSearch';
import AgencyBookings  from './AgencyBookings';
import MarkupSettings  from './MarkupSettings';
import AgencyInvoice   from './AgencyInvoice';
import StaffManager    from './StaffManager';
import AgencyProfile   from './AgencyProfile';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'search',    label: 'Recherche Hôtels', icon: Search },
  { id: 'bookings',  label: 'Réservations',     icon: Calendar },
  { id: 'invoice',   label: 'Factures',          icon: FileText },
  { id: 'markup',    label: 'Mes Tarifs',        icon: Tag,      adminOnly: true },
  { id: 'staff',     label: 'Mon Équipe',        icon: Users,    adminOnly: true },
  { id: 'profile',   label: 'Mon Agence',        icon: Building2 },
];

const STATUS_BADGE_STYLE = {
  pending:   { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' },
  confirmed: { background: '#ecfdf5', color: '#059669', border: '1px solid #6ee7b7' },
  cancelled: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' },
  completed: { background: '#eff6ff', color: '#2563eb', border: '1px solid #93c5fd' },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE_STYLE[status] || STATUS_BADGE_STYLE.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, ...s, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = '#005096' }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function OverviewTab() {
  const { agency, agencyFetch, isAgencyAdmin } = useAgency();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agencyFetch(API_ENDPOINTS.AGENCY_DASHBOARD)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setStats(d.data);
          setRecent(d.data.recentBookings || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 0 }).format(n ?? 0);

  if (loading) return <div style={{ color: '#9ca3af', padding: 32, textAlign: 'center' }}>Chargement...</div>;

  // Credit bar
  const available = stats?.availableCredit || 0;
  const limit = stats?.creditLimit || 0;
  const balance = stats?.creditBalance || 0;
  const usedPct = limit > 0 ? Math.max(0, Math.min(100, ((limit - available) / limit) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon={CreditCard}   label="Crédit disponible"   value={`${fmt(available)} TND`}  sub={`Limite: ${fmt(limit)} TND`}     color="#005096" />
        <StatCard icon={Calendar}     label="Ce mois"             value={fmt(stats?.monthBookings)} sub="réservations"                    color="#8b5cf6" />
        <StatCard icon={TrendingUp}   label="CA du mois"          value={`${fmt(stats?.monthRevenue)} TND`} sub="chiffre d'affaires"      color="#10b981" />
        {isAgencyAdmin && <StatCard icon={TrendingUp} label="Profit net du mois" value={`${fmt(stats?.monthNetProfit)} TND`} sub="après commission" color="#f59e0b" />}
        <StatCard icon={Calendar}     label="En attente"          value={fmt(stats?.pendingBookings)}   sub="réservations"               color="#f59e0b" />
        <StatCard icon={Calendar}     label="Confirmées (total)"  value={fmt(stats?.confirmedBookings)} sub="réservations"               color="#10b981" />
      </div>

      {/* Credit bar */}
      {limit > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Utilisation du crédit</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{fmt(available)} TND disponibles sur {fmt(limit)} TND</span>
          </div>
          <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ width: `${usedPct}%`, height: '100%', borderRadius: 6, background: usedPct > 80 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : '#10b981', transition: 'width 0.6s ease' }} />
          </div>
          {balance < 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#ef4444', fontSize: 12 }}>
              <AlertCircle size={14} /> Solde négatif: {fmt(balance)} TND — Veuillez régulariser votre compte
            </div>
          )}
        </div>
      )}

      {/* Recent bookings */}
      {recent.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 20, background: '#005096', borderRadius: 4 }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Réservations récentes</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Code', 'Hôtel', 'Check-in', 'Prix client', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(b => (
                  <tr key={b._id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#005096', fontWeight: 600 }}>{b.confirmationCode}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.hotelBooking?.HotelName || b.hotelBooking?.Hotel || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{b.hotelBooking?.CheckIn || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(b.totalPrice)} TND</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={b.status} /></td>
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

export default function AgencyDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const { agency, loading: agLoading, isAgencyAdmin } = useAgency();
  const navigate   = useNavigate();
  const [tab, setTab]           = useState('overview');
  const [sidebarOpen, setSidebar] = useState(false);

  // Guard: must be agency user
  useEffect(() => {
    if (!authLoading && !agLoading) {
      if (!user) { navigate('/agency/login'); return; }
      if (!['agency_admin', 'agency_staff'].includes(user.role)) { navigate('/agency/login'); }
    }
  }, [user, authLoading, agLoading, navigate]);

  const handleLogout = async () => { await logout(); navigate('/agency/login'); };

  const visibleNav = NAV_ITEMS.filter(n => !n.adminOnly || isAgencyAdmin);

  const TabContent = {
    overview:  <OverviewTab />,
    search:    <HotelSearch />,
    bookings:  <AgencyBookings />,
    invoice:   <AgencyInvoice />,
    markup:    isAgencyAdmin ? <MarkupSettings /> : null,
    staff:     isAgencyAdmin ? <StaffManager />   : null,
    profile:   <AgencyProfile />,
  };

  if (authLoading || agLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ fontSize: 14, color: '#6b7280' }}>Chargement...</div>
    </div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f9fafb', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />}

      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease',
      }}>
        {/* Agency header */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #005096, #0077cc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agency?.name || 'Agence'}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{agency?.code || ''}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {visibleNav.map(item => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSidebar(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, textAlign: 'left',
                  background: active ? '#eff6ff' : 'transparent',
                  color: active ? '#005096' : '#374151',
                  fontWeight: active ? 700 : 500, fontSize: 13,
                }}
              >
                <item.icon size={17} />
                {item.label}
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#005096' }} />}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 12, color: '#374151', fontWeight: 600, marginBottom: 2 }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={() => setSidebar(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Crédit disponible:</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#005096' }}>
              {agency ? `${new Intl.NumberFormat('fr-TN').format(agency.creditBalance + agency.creditLimit)} TND` : '—'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {TabContent[tab] || null}
          </div>
        </main>
      </div>
    </div>
  );
}
