import React, { useState, useEffect } from 'react';
import { Users, Plus, UserX, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { API_ENDPOINTS } from '../../config/api';

export default function StaffManager() {
  const { agencyFetch } = useAgency();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [adding, setAdding]   = useState(false);
  const [msg,   setMsg]       = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res  = await agencyFetch(API_ENDPOINTS.AGENCY_USERS);
    const data = await res.json();
    if (data.status === 'success') setUsers(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setMsg({ type: 'error', text: 'Tous les champs obligatoires doivent être remplis' });
      return;
    }
    setAdding(true); setMsg(null);
    const res  = await agencyFetch(API_ENDPOINTS.AGENCY_USERS, { method: 'POST', body: JSON.stringify(form) });
    const data = await res.json();
    if (data.status === 'success') {
      setMsg({ type: 'success', text: 'Collaborateur ajouté avec succès' });
      setShowAdd(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', phone: '' });
      fetchUsers();
    } else {
      setMsg({ type: 'error', text: data.message || 'Erreur lors de la création' });
    }
    setAdding(false);
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Désactiver ce collaborateur ?')) return;
    const res  = await agencyFetch(API_ENDPOINTS.AGENCY_USER(id), { method: 'PATCH', body: JSON.stringify({ isActive: false }) });
    const data = await res.json();
    if (data.status === 'success') fetchUsers();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Mon Équipe</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Gérez les accès de vos collaborateurs.</p>
        </div>
        <button onClick={() => { setShowAdd(p => !p); setMsg(null); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#005096', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {showAdd ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Ajouter un collaborateur</>}
        </button>
      </div>

      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${msg.type === 'success' ? '#6ee7b7' : '#fca5a5'}`, borderRadius: 10, marginBottom: 16 }}>
          {msg.type === 'success' ? <CheckCircle size={14} color="#059669" /> : <AlertCircle size={14} color="#dc2626" />}
          <span style={{ fontSize: 13, color: msg.type === 'success' ? '#047857' : '#b91c1c' }}>{msg.text}</span>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Nouveau collaborateur</div>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
              {[
                { field: 'firstName', label: 'Prénom *', type: 'text' },
                { field: 'lastName',  label: 'Nom *',    type: 'text' },
                { field: 'email',     label: 'Email *',  type: 'email' },
                { field: 'password',  label: 'Mot de passe *', type: 'password' },
                { field: 'phone',     label: 'Téléphone',      type: 'tel' },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#0369a1' }}>
              Le collaborateur aura accès à la recherche et aux réservations. Il ne peut pas modifier les tarifs.
            </div>
            <button type="submit" disabled={adding} style={{ padding: '11px 24px', background: adding ? '#9ca3af' : '#005096', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer' }}>
              {adding ? 'Création...' : 'Créer le compte'}
            </button>
          </form>
        </div>
      )}

      {/* Users list */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Chargement...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            <Users size={32} style={{ opacity: 0.3, marginBottom: 8 }} /><br />Aucun collaborateur pour le moment
          </div>
        ) : users.map(u => (
          <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#005096' }}>
                {u.firstName?.[0]}{u.lastName?.[0]}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{u.firstName} {u.lastName}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: u.role === 'agency_admin' ? '#eff6ff' : '#f9fafb', color: u.role === 'agency_admin' ? '#005096' : '#6b7280', border: '1px solid #e5e7eb' }}>
                {u.role === 'agency_admin' ? 'Admin' : 'Staff'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: u.isActive ? '#ecfdf5' : '#f9fafb', color: u.isActive ? '#059669' : '#9ca3af', border: '1px solid #e5e7eb' }}>
                {u.isActive ? 'Actif' : 'Inactif'}
              </span>
              {u.isActive && (
                <button onClick={() => handleDeactivate(u._id)} title="Désactiver" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                  <UserX size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
