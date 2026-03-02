import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, UserPlus, Edit, Trash2,
  Mail, Phone, X, RefreshCw
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';

const UsersManager = () => {
  const [users,          setUsers]          = useState([]);
  const [filteredUsers,  setFilteredUsers]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterRole,     setFilterRole]     = useState('all');
  const [showModal,      setShowModal]      = useState(false);
  const [selectedUser,   setSelectedUser]   = useState(null);
  const [formData,       setFormData]       = useState({
    firstName: '', lastName: '', email: '', phone: '', role: 'user'
  });

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { applyFilters(); }, [searchTerm, filterRole, users]); // eslint-disable-line

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_USERS, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.status === 'success') setUsers(data.data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let f = users;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(u =>
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    if (filterRole !== 'all') f = f.filter(u => u.role === filterRole);
    setFilteredUsers(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_USERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        loadUsers();
        closeModal();
      } else {
        alert(data.message || "Erreur lors de l'ajout");
      }
    } catch (_) {
      alert("Erreur lors de l'ajout de l'utilisateur");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Supprimer cet utilisateur?')) return;
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.status === 'success') loadUsers();
      else alert(data.message || 'Erreur lors de la suppression');
    } catch (_) {
      alert('Erreur lors de la suppression');
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName:  user.lastName  || '',
      email:     user.email     || '',
      phone:     user.phone     || '',
      role:      user.role      || 'user'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'user' });
  };

  const roleBadge = (role) => {
    const map = {
      admin: 'bg-red-100 text-red-700',
      agent: 'bg-primary-50 text-primary-700',
      user:  'bg-gray-100 text-gray-600',
    };
    const labels = { admin: 'Administrateur', agent: 'Agent', user: 'Utilisateur' };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[role] || map.user}`}>
        {labels[role] || role}
      </span>
    );
  };

  const initials = (u) =>
    [(u.firstName?.[0] || ''), (u.lastName?.[0] || '')].join('').toUpperCase() || '?';

  const inputCls =
    'w-full px-3 py-2.5 text-sm border border-gray-300 hover:border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600 transition-colors bg-white';

  return (
    <div dir="ltr" className="space-y-5 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-xs text-gray-400 mt-0.5">{filteredUsers.length} utilisateur(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <UserPlus size={14} />
            Ajouter
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Nom, email..."
              className={`${inputCls} pl-9 pr-3`}
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className={`${inputCls} pl-9 pr-3 appearance-none cursor-pointer`}
            >
              <option value="all">Tous les rôles</option>
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
              <option value="agent">Agent</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Utilisateur', 'Contact', 'Rôle', "Date d'inscription", 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <RefreshCw size={32} className="animate-spin text-primary-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Chargement...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <Users size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">Aucun utilisateur</p>
                    <p className="text-xs text-gray-400">Modifiez vos filtres</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">

                    {/* Utilisateur */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                          {initials(user)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-400">ID: {(user._id || user.id)?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Mail size={11} className="flex-shrink-0 text-gray-400" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Phone size={11} className="flex-shrink-0 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Rôle */}
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id || user.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {selectedUser ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
                </h3>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Rôle *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className={inputCls}
                >
                  <option value="user">Utilisateur</option>
                  <option value="agent">Agent</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {selectedUser ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
