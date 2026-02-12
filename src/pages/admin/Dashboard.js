import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Hotel, TrendingUp, 
  DollarSign, LogOut, Menu, X, Settings, Bell, Search
} from 'lucide-react';
import UsersManager from './UsersManager';
import BookingsManager from './BookingsManager';
import { API_ENDPOINTS } from '../../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeHotels: 0,
    pendingBookings: 0,
    todayBookings: 0
  });

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    // Load dashboard stats
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_STATS, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Réservations', icon: Calendar },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'hotels', label: 'Hôtels', icon: Hotel },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="ltr">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-bold">Easy2Book Admin</h1>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-800 text-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-all text-gray-300 hover:text-white"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Admin</p>
                  <p className="text-xs text-gray-500">Administrateur</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Calendar size={24} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.totalBookings}</h3>
                  <p className="text-sm text-gray-600 mt-1">Total Réservations</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users size={24} className="text-purple-600" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+8%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
                  <p className="text-sm text-gray-600 mt-1">Utilisateurs</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DollarSign size={24} className="text-green-600" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+18%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.totalRevenue} TND</h3>
                  <p className="text-sm text-gray-600 mt-1">Revenu Total</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Hotel size={24} className="text-orange-600" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Active</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.activeHotels}</h3>
                  <p className="text-sm text-gray-600 mt-1">Hôtels Actifs</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Actions Rapides</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-all text-left"
                  >
                    <Calendar className="text-blue-600 mb-2" size={24} />
                    <p className="font-semibold text-gray-800">Gérer les réservations</p>
                    <p className="text-sm text-gray-500 mt-1">{stats.pendingBookings} en attente</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-all text-left"
                  >
                    <Users className="text-purple-600 mb-2" size={24} />
                    <p className="font-semibold text-gray-800">Gérer les utilisateurs</p>
                    <p className="text-sm text-gray-500 mt-1">{stats.totalUsers} utilisateurs</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('hotels')}
                    className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-all text-left"
                  >
                    <Hotel className="text-orange-600 mb-2" size={24} />
                    <p className="font-semibold text-gray-800">Gérer les hôtels</p>
                    <p className="text-sm text-gray-500 mt-1">{stats.activeHotels} hôtels</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Activité Récente</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <p className="text-sm text-gray-700">Nouvelle réservation pour <span className="font-semibold">Hôtel Paradis</span></p>
                    <span className="text-xs text-gray-500 ml-auto">Il y a 2 min</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <p className="text-sm text-gray-700">Nouveau utilisateur inscrit</p>
                    <span className="text-xs text-gray-500 ml-auto">Il y a 15 min</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <p className="text-sm text-gray-700">Paiement confirmé - 1,200 TND</p>
                    <span className="text-xs text-gray-500 ml-auto">Il y a 1 heure</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && <BookingsManager />}

          {activeTab === 'users' && <UsersManager />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
