import React, { useState, useEffect } from 'react';
import { Building2, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { API_ENDPOINTS } from '../../config/api';

export default function AgencyProfile() {
  const { agency, agencyFetch, refreshAgency, isAgencyAdmin } = useAgency();
  const [form, setForm] = useState({ name: '', phone: '', address: { street: '', city: '', country: '', postalCode: '' }, registrationNumber: '' });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState(null);

  useEffect(() => {
    if (agency) {
      setForm({
        name:               agency.name               || '',
        phone:              agency.phone              || '',
        registrationNumber: agency.registrationNumber || '',
        address: {
          street:     agency.address?.street     || '',
          city:       agency.address?.city       || '',
          country:    agency.address?.country    || '',
          postalCode: agency.address?.postalCode || '',
        },
      });
    }
  }, [agency]);

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    const res  = await agencyFetch(API_ENDPOINTS.AGENCY_ME, { method: 'PATCH', body: JSON.stringify(form) });
    const data = await res.json();
    if (data.status === 'success') {
      setMsg({ type: 'success', text: 'Profil mis à jour' });
      refreshAgency();
    } else {
      setMsg({ type: 'error', text: data.message || 'Erreur lors de la sauvegarde' });
    }
    setSaving(false);
  };

  const Field = ({ label, value, onChange, type = 'text', readOnly }) => (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} readOnly={readOnly}
        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', background: readOnly ? '#f9fafb' : '#fff', color: readOnly ? '#9ca3af' : '#111827' }} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Mon Agence</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Informations de votre agence de voyage.</p>
      </div>

      {/* Agency code badge */}
      {agency && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 20px', marginBottom: 24 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #005096, #0077cc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{agency.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Code: <b style={{ color: '#005096' }}>{agency.code}</b> · Statut: <b style={{ color: agency.status === 'active' ? '#059669' : '#d97706' }}>{agency.status}</b></div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 24, maxWidth: 700 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <Field label="Nom de l'agence *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} readOnly={!isAgencyAdmin} />
          <Field label="Téléphone"         value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} readOnly={!isAgencyAdmin} />
          <Field label="Email" value={agency?.email || ''} readOnly />
          <Field label="Matricule fiscale" value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} readOnly={!isAgencyAdmin} />
        </div>

        {/* Address */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 12 }}>Adresse</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Rue"        value={form.address.street}     onChange={e => setForm(f => ({ ...f, address: { ...f.address, street:     e.target.value }}))} readOnly={!isAgencyAdmin} />
            <Field label="Ville"      value={form.address.city}       onChange={e => setForm(f => ({ ...f, address: { ...f.address, city:       e.target.value }}))} readOnly={!isAgencyAdmin} />
            <Field label="Pays"       value={form.address.country}    onChange={e => setForm(f => ({ ...f, address: { ...f.address, country:    e.target.value }}))} readOnly={!isAgencyAdmin} />
            <Field label="Code post." value={form.address.postalCode} onChange={e => setForm(f => ({ ...f, address: { ...f.address, postalCode: e.target.value }}))} readOnly={!isAgencyAdmin} />
          </div>
        </div>

        {msg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${msg.type === 'success' ? '#6ee7b7' : '#fca5a5'}`, borderRadius: 8, marginBottom: 16 }}>
            {msg.type === 'success' ? <CheckCircle size={14} color="#059669" /> : <AlertCircle size={14} color="#dc2626" />}
            <span style={{ fontSize: 13, color: msg.type === 'success' ? '#047857' : '#b91c1c' }}>{msg.text}</span>
          </div>
        )}

        {isAgencyAdmin && (
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: saving ? '#9ca3af' : '#005096', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sauvegarde...</> : <><Save size={14} /> Sauvegarder</>}
          </button>
        )}
        {!isAgencyAdmin && <div style={{ fontSize: 12, color: '#9ca3af' }}>Seul l'administrateur de l'agence peut modifier ces informations.</div>}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
