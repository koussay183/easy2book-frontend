import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, LogOut,
  Menu, X, Bell, Plane, ChevronRight, TrendingUp,
  Clock, CheckCircle2, DollarSign, RefreshCw, Wifi, WifiOff,
  Monitor, Globe, Eye, Banknote, Building2, Plug, Settings2, Terminal, BarChart3
} from 'lucide-react';
import UsersManager from './UsersManager';
import BookingsManager from './BookingsManager';
import OmraManager from './OmraManager';
import Comptabilite from './Comptabilite';
import Integrations from './Integrations';
import Rapports from './Rapports';
import Parametres from './Parametres';
import SupplierManager from './SupplierManager';
import SystemLogs from './SystemLogs';
import { API_ENDPOINTS } from '../../config/api';
import useAdminSocket from '../../hooks/useAdminSocket';

/* ── Country flag from ISO-2 code ── */
const countryFlag = (code) => {
  if (!code || code.length !== 2) return '🌍';
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('');
};

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, sub, accent, live }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        {live && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  </div>
);

/* ── Quick-action card ── */
const ActionCard = ({ icon: Icon, title, desc, onClick }) => (
  <button onClick={onClick}
    className="w-full text-left bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50/40 rounded-xl p-5 transition-all group"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary-50 group-hover:bg-primary-100 rounded-lg flex items-center justify-center transition-colors">
          <Icon size={18} className="text-primary-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
    </div>
  </button>
);

/* ── Notification color map ── */
const notifColors = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  amber:   'bg-amber-100 text-amber-700 border-amber-200',
  sky:     'bg-sky-100 text-sky-700 border-sky-200',
  gray:    'bg-gray-100 text-gray-600 border-gray-200'
};

/** Render text for any notification event */
const NotifBody = ({ n }) => {
  if (n.event === 'new_booking') return (
    <><span className="font-semibold">{n.data.confirmationCode}</span>
    {n.data.guestName ? ` — ${n.data.guestName}` : ''}
    {n.data.totalPrice
      ? <span className="text-gray-500"> · {parseFloat(n.data.totalPrice).toFixed(0)} TND</span>
      : null}</>
  );
  if (n.event === 'booking_confirmed') return (
    <><span className="font-semibold">{n.data.confirmationCode}</span>
    {n.data.myGoBookingId
      ? <span className="text-gray-500"> · myGo #{n.data.myGoBookingId}</span>
      : null}</>
  );
  if (n.event === 'booking_status_changed') return (
    <><span className="font-semibold">{n.data.confirmationCode}</span>
    <span className="text-gray-500"> → {n.data.status}</span></>
  );
  if (n.event === 'user_login') return (
    <><span className="font-semibold">{n.data.email}</span>
    {(n.data.country || n.data.city)
      ? <span className="text-gray-500"> · {countryFlag(n.data.countryCode)} {n.data.city || n.data.country}</span>
      : null}</>
  );
  return null;
};

/* ══════════════════════════════════════════════════ */

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab,          setActiveTab]          = useState('overview');
  const [sidebarOpen,        setSidebarOpen]        = useState(true);
  const [stats,              setStats]              = useState(null);
  const [statsLoading,       setStatsLoading]       = useState(true);
  const [logins,             setLogins]             = useState([]);
  const [loginsLoading,      setLoginsLoading]      = useState(true);
  const [showNotifications,  setShowNotifications]  = useState(false);
  const notifPanelRef = useRef(null);

  /* ── Real-time socket ── */
  const { notifications, unreadCount, isConnected, activeVisitors, markAllRead, clearAll } = useAdminSocket();

  const adminUser = (() => {
    try { return JSON.parse(localStorage.getItem('adminUser') || '{}'); } catch { return {}; }
  })();
  const initials = [adminUser.firstName?.[0], adminUser.lastName?.[0]].filter(Boolean).join('') || 'A';

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_STATS, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.status === 'success') setStats(data.data);
    } catch (_) {}
    finally { setStatsLoading(false); }
  }, []);

  const loadLogins = useCallback(async () => {
    setLoginsLoading(true);
    try {
      const res  = await fetch(`${API_ENDPOINTS.ADMIN_LOGINS}?limit=30`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.status === 'success') setLogins(data.data.logins || []);
    } catch (_) {}
    finally { setLoginsLoading(false); }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/admin/login'); return; }
    loadStats();
    loadLogins();
  }, [navigate]); // eslint-disable-line

  /* ── Auto-refresh stats on new booking ── */
  useEffect(() => {
    const latest = notifications[0];
    if (latest?.event === 'new_booking') loadStats();
  }, [notifications]); // eslint-disable-line

  /* ── Prepend live login events to logins list ── */
  useEffect(() => {
    const latest = notifications[0];
    if (latest?.event === 'user_login') {
      setLogins(prev => [{ ...latest.data }, ...prev].slice(0, 50));
    }
  }, [notifications]); // eslint-disable-line

  /* ── Close notification panel on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target))
        setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(v => {
      if (!v) markAllRead();
      return !v;
    });
  };

  const navItems = [
    { id: 'overview',   label: 'Dashboard',        icon: LayoutDashboard },
    { id: 'bookings',   label: 'Réservations',     icon: Calendar },
    { id: 'clients',    label: 'Clients',           icon: Users },
    { id: 'b2b',        label: 'B2B Agences',       icon: Building2,  disabled: true },
    { id: 'suppliers',  label: 'Fournisseurs',      icon: Plug },
    { id: 'finance',    label: 'Finance',           icon: Banknote },
    { id: 'rapports',   label: 'Rapports',          icon: BarChart3 },
    { id: 'settings',   label: 'Paramètres',        icon: Settings2 },
    { id: 'logs',       label: 'Logs',              icon: Terminal },
  ];

  const currentLabel = navItems.find(n => n.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex" dir="ltr">

      {/* ══ Sidebar ══ */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-[68px]'} bg-primary-900 text-white transition-all duration-200 flex flex-col flex-shrink-0`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen && <span className="text-sm font-bold tracking-wide truncate">Easy2Book Admin</span>}
          <button onClick={() => setSidebarOpen(v => !v)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon, disabled }) => (
            <button
              key={id}
              onClick={() => !disabled && setActiveTab(id)}
              disabled={disabled}
              title={!sidebarOpen ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                disabled
                  ? 'text-white/25 cursor-not-allowed'
                  : activeTab === id
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && (
                <span className="truncate flex-1 text-left">{label}</span>
              )}
              {sidebarOpen && disabled && (
                <span className="text-[9px] bg-white/10 text-white/40 rounded px-1 py-0.5 flex-shrink-0">bientôt</span>
              )}
            </button>
          ))}
        </nav>

        {/* Status widgets */}
        {sidebarOpen && (
          <div className="px-4 pb-2 space-y-1.5">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium ${
              isConnected ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/30 text-red-400'
            }`}>
              {isConnected ? <><Wifi size={11} /> Temps réel actif</> : <><WifiOff size={11} /> Reconnexion...</>}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-white/8 text-white/70">
              <Eye size={11} />
              <span>{activeVisitors.count} visiteur{activeVisitors.count !== 1 ? 's' : ''} en ligne</span>
            </div>
          </div>
        )}

        <div className="p-2 border-t border-white/10">
          <button onClick={handleLogout} title={!sidebarOpen ? 'Déconnexion' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-red-600/30 hover:text-white transition-all">
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ══ Main ══ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 justify-between flex-shrink-0">
          <h1 className="text-sm font-semibold text-gray-900">{currentLabel}</h1>
          <div className="flex items-center gap-3">

            {/* Bell */}
            <div className="relative" ref={notifPanelRef}>
              <button onClick={toggleNotifications} className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={17} className="text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-900">Notifications</p>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-[10px] text-gray-400 hover:text-gray-700 transition-colors">Effacer</button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell size={24} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Aucune notification</p>
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${notifColors[n.color] || notifColors.gray}`}>
                            {n.label}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-700"><NotifBody n={n} /></p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(n.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {adminUser.firstName ? `${adminUser.firstName} ${adminUser.lastName || ''}` : 'Admin'}
                </p>
                <p className="text-[10px] text-gray-400">Administrateur</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">

          {activeTab === 'overview' && (
            <div className="space-y-5 max-w-5xl mx-auto">

              {/* Refresh row */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <button onClick={loadStats} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                  <RefreshCw size={13} className={statsLoading ? 'animate-spin' : ''} />
                  Actualiser
                </button>
              </div>

              {/* Top stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Calendar} label="Total réservations"
                  value={statsLoading ? '—' : stats?.totalBookings ?? 0}
                  sub={stats?.todayBookings > 0 ? `+${stats.todayBookings} aujourd'hui` : undefined}
                  accent="bg-primary-700" />
                <StatCard icon={Clock} label="En attente"
                  value={statsLoading ? '—' : stats?.pendingBookings ?? 0}
                  sub="Nécessitent une action" accent="bg-amber-500" />
                <StatCard icon={CheckCircle2} label="Confirmées"
                  value={statsLoading ? '—' : stats?.confirmedBookings ?? 0}
                  sub="Réservations validées" accent="bg-emerald-600" />
                <StatCard icon={DollarSign} label="Revenu total"
                  value={statsLoading ? '—' : `${(stats?.totalRevenue ?? 0).toFixed(0)} TND`}
                  sub="Paiements reçus" accent="bg-violet-600" />
              </div>

              {/* Second row */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={Users} label="Utilisateurs"
                  value={statsLoading ? '—' : stats?.totalUsers ?? 0}
                  sub={stats?.recentUsers > 0 ? `+${stats.recentUsers} cette semaine` : 'Comptes enregistrés'}
                  accent="bg-sky-600" />
                <StatCard icon={TrendingUp} label="Terminées"
                  value={statsLoading ? '—' : stats?.completedBookings ?? 0}
                  sub={`${stats?.cancelledBookings ?? 0} annulée${(stats?.cancelledBookings ?? 0) !== 1 ? 's' : ''}`}
                  accent="bg-primary-600" />
                <StatCard icon={Eye} label="Visiteurs actifs"
                  value={activeVisitors.count}
                  sub="Sur le site en ce moment"
                  accent="bg-rose-500"
                  live />
              </div>

              {/* Active visitors breakdown */}
              {activeVisitors.count > 0 && (
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    <p className="text-sm font-semibold text-gray-900">
                      Visiteurs actifs — {activeVisitors.count}
                    </p>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {activeVisitors.visitors.map((v, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-700">
                        <Globe size={11} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[160px]">{v.page || '/'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Actions rapides</p>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ActionCard icon={Calendar} title="Gérer les réservations"
                    desc={`${stats?.pendingBookings ?? 0} en attente`} onClick={() => setActiveTab('bookings')} />
                  <ActionCard icon={Users} title="Gérer les utilisateurs"
                    desc={`${stats?.totalUsers ?? 0} comptes`} onClick={() => setActiveTab('users')} />
                  <ActionCard icon={Plane} title="Omra"
                    desc="Offres et réservations" onClick={() => setActiveTab('omra')} />
                </div>
              </div>

              {/* Live activity feed */}
              {notifications.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-sm font-semibold text-gray-900">Activité en temps réel</p>
                    </div>
                    <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Effacer</button>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                    {notifications.slice(0, 10).map(n => (
                      <div key={n.id} className="px-5 py-3 flex items-center gap-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${notifColors[n.color] || notifColors.gray}`}>
                          {n.label}
                        </span>
                        <p className="text-xs text-gray-700 flex-1 min-w-0 truncate"><NotifBody n={n} /></p>
                        <p className="text-[10px] text-gray-400 flex-shrink-0">
                          {new Date(n.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent logins */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor size={15} className="text-primary-700" />
                    <p className="text-sm font-semibold text-gray-900">Connexions récentes</p>
                  </div>
                  <button onClick={loadLogins} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                    <RefreshCw size={11} className={loginsLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Utilisateur', 'Localisation', 'Appareil', 'Heure'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loginsLoading ? (
                        <tr><td colSpan="4" className="py-8 text-center">
                          <RefreshCw size={20} className="animate-spin text-primary-700 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">Chargement...</p>
                        </td></tr>
                      ) : logins.length === 0 ? (
                        <tr><td colSpan="4" className="py-8 text-center text-xs text-gray-400">
                          Aucune connexion enregistrée
                        </td></tr>
                      ) : logins.map((l, i) => (
                        <tr key={l._id || i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-gray-900 truncate max-w-[160px]">{l.email}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              l.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                            }`}>{l.role}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-700">
                              {l.countryCode && (
                                <span className="text-base leading-none">{countryFlag(l.countryCode)}</span>
                              )}
                              <div>
                                {l.city && <p className="font-medium">{l.city}</p>}
                                <p className="text-[10px] text-gray-400">{l.country || l.ip || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            <p>{l.browser || '—'}</p>
                            <p className="text-[10px] text-gray-400">{l.os} · {l.deviceType}</p>
                          </td>
                          <td className="px-4 py-3 text-[10px] text-gray-400 whitespace-nowrap">
                            {l.createdAt
                              ? new Date(l.createdAt).toLocaleString('fr-FR', {
                                  day: '2-digit', month: '2-digit',
                                  hour: '2-digit', minute: '2-digit'
                                })
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'bookings'   && <BookingsManager />}
          {activeTab === 'clients'    && <UsersManager />}
          {activeTab === 'omra'       && <OmraManager />}
          {activeTab === 'finance'    && <Comptabilite />}
          {activeTab === 'suppliers'  && <SupplierManager />}
          {activeTab === 'settings'   && <Parametres />}
          {activeTab === 'rapports'   && <Rapports />}
          {activeTab === 'logs'       && <SystemLogs />}

          {/* Placeholder tabs (coming soon) */}
          {activeTab === 'b2b' && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 size={28} />
              </div>
              <p className="text-sm font-semibold text-gray-500">
                B2B Agences — Bientôt disponible
              </p>
              <p className="text-xs text-gray-400 max-w-xs text-center">
                Gestion des agences partenaires et accès B2B
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
