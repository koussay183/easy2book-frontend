import React, { useState, useEffect } from 'react';
import { Tag, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { API_ENDPOINTS } from '../../config/api';

const fmt = (n) => new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 2 }).format(n ?? 0);

export default function MarkupSettings() {
  const { agency, agencyFetch, refreshAgency } = useAgency();

  const [form, setForm]     = useState({ enabled: false, type: 'percentage', value: 0 });
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null); // { type: 'success'|'error', text }

  useEffect(() => {
    if (agency?.markup) {
      setForm({
        enabled: agency.markup.enabled ?? false,
        type:    agency.markup.type    ?? 'percentage',
        value:   agency.markup.value   ?? 0,
      });
    }
  }, [agency]);

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    const res  = await agencyFetch(API_ENDPOINTS.AGENCY_MARKUP, {
      method: 'PATCH',
      body:   JSON.stringify(form),
    });
    const data = await res.json();
    if (data.status === 'success') {
      setMsg({ type: 'success', text: 'Tarifs mis à jour avec succès' });
      refreshAgency();
    } else {
      setMsg({ type: 'error', text: data.message || 'Erreur lors de la sauvegarde' });
    }
    setSaving(false);
  };

  // Live preview calculation
  const samplePrice = 100;
  const markupAmount = form.enabled
    ? form.type === 'percentage'
      ? samplePrice * (form.value / 100)
      : form.value
    : 0;
  const clientPrice       = samplePrice + markupAmount;
  const commissionRate    = agency?.commissionRate || 0;
  const commissionAmount  = markupAmount * (commissionRate / 100);
  const netProfit         = markupAmount - commissionAmount;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Mes Tarifs</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
          Configurez la majoration appliquée à vos prix hôteliers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start', maxWidth: 900 }}>
        {/* Settings card */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 24 }}>
          {/* Enable toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f3f4f6', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Activer la majoration</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Ajouter un supplément aux prix fournisseur</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 48, height: 26, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute', inset: 0, borderRadius: 13, background: form.enabled ? '#005096' : '#d1d5db',
                transition: 'background 0.3s',
              }}>
                <span style={{
                  position: 'absolute', top: 3, left: form.enabled ? 25 : 3, width: 20, height: 20,
                  borderRadius: '50%', background: '#fff', transition: 'left 0.3s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </span>
            </label>
          </div>

          {/* Type selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Type de majoration</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ value: 'percentage', label: 'Pourcentage (%)', desc: 'Ex: +10% sur le prix' }, { value: 'fixed', label: 'Montant fixe (TND)', desc: 'Ex: +20 TND par réservation' }].map(opt => (
                <label key={opt.value} style={{ flex: 1, cursor: 'pointer' }}>
                  <input type="radio" name="type" value={opt.value} checked={form.type === opt.value} onChange={() => setForm(f => ({ ...f, type: opt.value }))} style={{ display: 'none' }} />
                  <div style={{ border: `2px solid ${form.type === opt.value ? '#005096' : '#e5e7eb'}`, background: form.type === opt.value ? '#eff6ff' : '#fff', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.type === opt.value ? '#005096' : '#374151' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Value input */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Valeur de la majoration {form.type === 'percentage' ? '(%)' : '(TND)'}
            </label>
            <div style={{ position: 'relative', maxWidth: 200 }}>
              <input
                type="number"
                min={0}
                step={form.type === 'percentage' ? 0.5 : 1}
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '12px 40px 12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 16, fontWeight: 700, color: '#111827', boxSizing: 'border-box', outline: 'none' }}
              />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
                {form.type === 'percentage' ? '%' : 'TND'}
              </span>
            </div>
          </div>

          {/* Message */}
          {msg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${msg.type === 'success' ? '#6ee7b7' : '#fca5a5'}`, borderRadius: 8, marginBottom: 16 }}>
              {msg.type === 'success' ? <CheckCircle size={14} color="#059669" /> : <AlertCircle size={14} color="#dc2626" />}
              <span style={{ fontSize: 13, color: msg.type === 'success' ? '#047857' : '#b91c1c' }}>{msg.text}</span>
            </div>
          )}

          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: saving ? '#9ca3af' : '#005096', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sauvegarde...</> : <><Save size={14} /> Sauvegarder</>}
          </button>
        </div>

        {/* Live preview */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 24, minWidth: 260 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu en direct</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>Pour un hôtel à 100 TND :</div>
          {[
            { label: 'Prix fournisseur',  value: `${fmt(samplePrice)} TND`,        color: '#6b7280' },
            { label: 'Majoration',        value: `+${fmt(markupAmount)} TND`,      color: '#10b981' },
            { label: 'Prix client',       value: `${fmt(clientPrice)} TND`,        color: '#005096', bold: true },
            { label: `Commission (${commissionRate}%)`, value: `-${fmt(commissionAmount)} TND`, color: '#f59e0b' },
            { label: 'Votre profit net',  value: `${fmt(netProfit)} TND`,          color: '#10b981', bold: true },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 500, color: r.color }}>{r.value}</span>
            </div>
          ))}
          {!form.enabled && (
            <div style={{ marginTop: 16, padding: '10px 12px', background: '#fafafa', borderRadius: 8, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
              Activez la majoration pour voir l'impact
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
