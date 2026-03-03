import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, CreditCard, Save, RefreshCw, TrendingUp,
  DollarSign, Clock, CheckCircle2, XCircle, AlertCircle,
  Banknote, Phone, Mail, MapPin, FileText, ChevronDown, ChevronUp,
  BarChart3, Receipt
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

/* ─── tiny helpers ──────────────────────────────────────────────────── */
const token = () => localStorage.getItem('accessToken');

const Field = ({ label, value, onChange, placeholder, multiline }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    {multiline
      ? <textarea
          rows={2}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none resize-none transition-colors"
        />
      : <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-colors"
        />
    }
  </div>
);

const methodLabel  = { agency: 'Agence Easy2Book', wafacash: 'Wafacash', izi: 'Izi', online: 'En ligne' };
const methodColor  = {
  agency:   'bg-primary-50 text-primary-700 border-primary-200',
  wafacash: 'bg-orange-50  text-orange-700  border-orange-200',
  izi:      'bg-violet-50  text-violet-700  border-violet-200',
  online:   'bg-blue-50    text-blue-700    border-blue-200',
};
const statusColor  = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid:      'bg-green-50  text-green-700  border-green-200',
  failed:    'bg-red-50    text-red-700    border-red-200',
  refunded:  'bg-gray-100  text-gray-600   border-gray-200',
};

/* ─── Channel card ──────────────────────────────────────────────────── */
const ChannelCard = ({ title, color, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-white rounded-2xl border ${color.replace('text-', 'border-').split(' ')[2]} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color.split(' ').slice(0,2).join(' ')}`}>
            <Icon size={18} />
          </div>
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );
};

/* ══════════════════════════════════════════════════ MAIN ══════════════ */
const Comptabilite = () => {
  const [activeTab,   setActiveTab]   = useState('settings');
  const [settings,    setSettings]    = useState(null);
  const [summary,     setSummary]     = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [loadingSum,  setLoadingSum]  = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');

  /* ── local draft state ── */
  const [wafacash, setWafacash] = useState({ rib:'', accountName:'', bankName:'', phone:'', instructions:'' });
  const [izi,      setIzi]      = useState({ rib:'', accountName:'', bankName:'', phone:'', instructions:'' });
  const [agency,   setAgency]   = useState({ name:'', address:'', phone:'', email:'', hours:'', instructions:'' });
  const [online,   setOnline]   = useState({ instructions:'' });

  /* ── fetch settings ── */
  const loadSettings = useCallback(async () => {
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_SETTINGS, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (data.status === 'success') {
        const s = data.data;
        setSettings(s);
        if (s.wafacash) setWafacash({ rib:'', accountName:'', bankName:'', phone:'', instructions:'', ...s.wafacash });
        if (s.izi)      setIzi(     { rib:'', accountName:'', bankName:'', phone:'', instructions:'', ...s.izi });
        if (s.agency)   setAgency(  { name:'Easy2Book', address:'', phone:'', email:'', hours:'', instructions:'', ...s.agency });
        if (s.online)   setOnline(  { instructions:'', ...s.online });
      }
    } catch { setError('Erreur de chargement des paramètres'); }
  }, []);

  /* ── fetch accounting summary ── */
  const loadSummary = useCallback(async () => {
    setLoadingSum(true);
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_ACCOUNTING, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (data.status === 'success') setSummary(data.data);
    } catch { /* silent */ } finally { setLoadingSum(false); }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);
  useEffect(() => { if (activeTab === 'finance') loadSummary(); }, [activeTab, loadSummary]);

  /* ── save ── */
  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_SETTINGS, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ wafacash, izi, agency, online }),
      });
      const data = await res.json();
      if (data.status === 'success') { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(data.message || 'Erreur de sauvegarde');
    } catch { setError('Erreur réseau'); } finally { setSaving(false); }
  };

  const fmtMoney = (v) => parseFloat(v || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ── summary cards ── */
  const totalRevenue = summary?.byMethod?.reduce((s, m) => s + m.total, 0) || 0;
  const totalPending = summary?.byMethod?.reduce((s, m) => s + m.pending, 0) || 0;
  const totalPaid    = summary?.byMethod?.reduce((s, m) => s + m.paid, 0) || 0;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Comptabilité</h1>
          <p className="text-sm text-gray-500 mt-0.5">Paramètres de paiement & suivi financier</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            <span className="flex items-center gap-1.5"><Banknote size={14} /> Paramètres RIB</span>
          </button>
          <button onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'finance' ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            <span className="flex items-center gap-1.5"><BarChart3 size={14} /> Finance</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* ──────────── SETTINGS TAB ──────────── */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            Ces informations sont affichées aux clients sur la page de confirmation selon leur mode de paiement.
          </p>

          {/* Wafacash */}
          <ChannelCard title="Wafacash" color="bg-orange-50 text-orange-700 border-orange-200" icon={() => (
            <svg viewBox="0 0 40 40" width="18" height="18"><rect width="40" height="40" rx="4" fill="#EA6913"/><text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial,sans-serif">WC</text></svg>
          )} defaultOpen>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <Field label="RIB / Numéro de compte" value={wafacash.rib} onChange={v => setWafacash(s => ({ ...s, rib: v }))} placeholder="XX XXX XXXX XXXXXXXXXXXX XX" />
              <Field label="Nom du titulaire" value={wafacash.accountName} onChange={v => setWafacash(s => ({ ...s, accountName: v }))} placeholder="Easy2Book SARL" />
              <Field label="Nom de la banque" value={wafacash.bankName} onChange={v => setWafacash(s => ({ ...s, bankName: v }))} placeholder="Wafacash" />
              <Field label="Téléphone Wafacash" value={wafacash.phone} onChange={v => setWafacash(s => ({ ...s, phone: v }))} placeholder="+216 XX XXX XXX" />
              <div className="sm:col-span-2">
                <Field label="Instructions pour le client" multiline value={wafacash.instructions} onChange={v => setWafacash(s => ({ ...s, instructions: v }))} placeholder="Ex: Effectuez le virement Wafacash avec votre code de confirmation en référence..." />
              </div>
            </div>
          </ChannelCard>

          {/* Izi */}
          <ChannelCard title="Izi" color="bg-violet-50 text-violet-700 border-violet-200" icon={() => (
            <svg viewBox="0 0 40 40" width="18" height="18"><rect width="40" height="40" rx="4" fill="#6D28D9"/><text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial,sans-serif">izi</text></svg>
          )}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <Field label="RIB / Numéro de compte" value={izi.rib} onChange={v => setIzi(s => ({ ...s, rib: v }))} placeholder="XX XXX XXXX XXXXXXXXXXXX XX" />
              <Field label="Nom du titulaire" value={izi.accountName} onChange={v => setIzi(s => ({ ...s, accountName: v }))} placeholder="Easy2Book SARL" />
              <Field label="Nom de la banque / plateforme" value={izi.bankName} onChange={v => setIzi(s => ({ ...s, bankName: v }))} placeholder="Izi" />
              <Field label="Téléphone / Référence Izi" value={izi.phone} onChange={v => setIzi(s => ({ ...s, phone: v }))} placeholder="+216 XX XXX XXX" />
              <div className="sm:col-span-2">
                <Field label="Instructions pour le client" multiline value={izi.instructions} onChange={v => setIzi(s => ({ ...s, instructions: v }))} placeholder="Ex: Transférez le montant via Izi en indiquant votre code de confirmation..." />
              </div>
            </div>
          </ChannelCard>

          {/* Agency */}
          <ChannelCard title="Agence Easy2Book" color="bg-primary-50 text-primary-700 border-primary-200" icon={Building2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <Field label="Nom de l'agence" value={agency.name} onChange={v => setAgency(s => ({ ...s, name: v }))} placeholder="Easy2Book" />
              <Field label="Téléphone" value={agency.phone} onChange={v => setAgency(s => ({ ...s, phone: v }))} placeholder="+216 XX XXX XXX" />
              <Field label="Email" value={agency.email} onChange={v => setAgency(s => ({ ...s, email: v }))} placeholder="contact@easy2book.tn" />
              <Field label="Horaires d'ouverture" value={agency.hours} onChange={v => setAgency(s => ({ ...s, hours: v }))} placeholder="Lun–Sam 09h–18h" />
              <div className="sm:col-span-2">
                <Field label="Adresse complète" value={agency.address} onChange={v => setAgency(s => ({ ...s, address: v }))} placeholder="Rue X, Tunis, Tunisie" />
              </div>
              <div className="sm:col-span-2">
                <Field label="Instructions supplémentaires" multiline value={agency.instructions} onChange={v => setAgency(s => ({ ...s, instructions: v }))} placeholder="Ex: Présentez-vous avec votre code de confirmation..." />
              </div>
            </div>
          </ChannelCard>

          {/* Online */}
          <ChannelCard title="Paiement en ligne" color="bg-blue-50 text-blue-700 border-blue-200" icon={CreditCard}>
            <div className="mt-4">
              <Field label="Instructions pour le client" multiline value={online.instructions} onChange={v => setOnline(s => ({ ...s, instructions: v }))} placeholder="Ex: Votre paiement sera traité de manière sécurisée. Vous recevrez une confirmation..." />
            </div>
          </ChannelCard>

          {/* Save */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 size={14} /> Enregistré
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:bg-gray-200 disabled:text-gray-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        </div>
      )}

      {/* ──────────── FINANCE TAB ──────────── */}
      {activeTab === 'finance' && (
        <div className="space-y-5">
          {loadingSum ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <RefreshCw size={18} className="animate-spin" /> Chargement...
            </div>
          ) : (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Revenus totaux',  value: fmtMoney(totalRevenue), icon: TrendingUp,   color: 'text-primary-600', bg: 'bg-primary-50' },
                  { label: 'En attente',      value: fmtMoney(totalPending), icon: Clock,         color: 'text-yellow-600',  bg: 'bg-yellow-50' },
                  { label: 'Payé',            value: fmtMoney(totalPaid),    icon: CheckCircle2,  color: 'text-green-600',   bg: 'bg-green-50'  },
                ].map(({ label, value, icon: Ic, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
                        <Ic size={16} className={color} />
                      </div>
                      <p className="text-xs font-medium text-gray-500">{label}</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900" dir="ltr">{value} <span className="text-sm font-medium text-gray-400">TND</span></p>
                  </div>
                ))}
              </div>

              {/* By payment method */}
              {summary?.byMethod?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      <DollarSign size={15} className="text-primary-600" /> Par méthode de paiement
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {summary.byMethod.map(m => (
                      <div key={m._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${methodColor[m._id] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {methodLabel[m._id] || m._id}
                          </span>
                          <span className="text-sm text-gray-600">{m.count} réservation{m.count > 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-right" dir="ltr">
                          <p className="text-sm font-bold text-gray-900">{fmtMoney(m.total)} TND</p>
                          <p className="text-xs text-gray-400">
                            {fmtMoney(m.paid)} payé · {fmtMoney(m.pending)} en attente
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent transactions */}
              {summary?.recentBookings?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      <Receipt size={15} className="text-primary-600" /> Transactions récentes
                    </h3>
                    <button onClick={loadSummary} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                      <RefreshCw size={12} /> Actualiser
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                        <tr>
                          <th className="px-5 py-3 text-left font-medium">Code</th>
                          <th className="px-4 py-3 text-left font-medium">Méthode</th>
                          <th className="px-4 py-3 text-left font-medium">Paiement</th>
                          <th className="px-4 py-3 text-left font-medium">Statut</th>
                          <th className="px-4 py-3 text-right font-medium">Montant</th>
                          <th className="px-5 py-3 text-left font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {summary.recentBookings.map(b => (
                          <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 font-mono text-xs text-gray-700">{b.confirmationCode || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${methodColor[b.paymentMethod] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {methodLabel[b.paymentMethod] || b.paymentMethod}
                                {b.paymentPlan === 'installment' && <span className="ml-1 opacity-70">(tr)</span>}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${statusColor[b.paymentStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {b.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-gray-500">{b.status}</span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900" dir="ltr">
                              {fmtMoney(b.totalPrice)} <span className="text-xs font-normal text-gray-400">{b.currency}</span>
                            </td>
                            <td className="px-5 py-3 text-xs text-gray-400">
                              {b.createdAt ? new Date(b.createdAt).toLocaleDateString('fr-FR') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(!summary?.byMethod?.length && !summary?.recentBookings?.length) && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                  <BarChart3 size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucune donnée financière disponible.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Comptabilite;
