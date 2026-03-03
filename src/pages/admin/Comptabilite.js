import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Building2, CreditCard, Save, RefreshCw, TrendingUp,
  DollarSign, Clock, CheckCircle2, AlertCircle,
  Banknote, ChevronDown, ChevronUp,
  BarChart3, Receipt, Search, Download, Printer,
  XCircle, Check, FileText
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

/* ─── tiny helpers ──────────────────────────────────────────────────── */
const token = () => localStorage.getItem('adminToken');

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
const bookingStatusColor = {
  pending:   'text-yellow-600',
  confirmed: 'text-green-600',
  cancelled: 'text-red-500',
  completed: 'text-blue-600',
};

const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const fmtMoney = (v) => parseFloat(v || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

/* ─── Channel card (RIB settings) ──────────────────────────────────── */
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

/* ─── Monthly chart bar ─────────────────────────────────────────────── */
const MonthlyChart = ({ months }) => {
  if (!months || months.length === 0) return (
    <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
      <BarChart3 size={20} className="mr-2 opacity-30" /> Données insuffisantes
    </div>
  );
  const maxVal = Math.max(...months.map(m => m.total), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 px-1">
      {months.map((m, i) => {
        const heightPct = Math.max((m.total / maxVal) * 100, 3);
        const paidPct   = m.total > 0 ? (m.paid / m.total) * heightPct : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
              <div className="font-bold">{MONTH_NAMES[m._id.month - 1]} {m._id.year}</div>
              <div>{fmtMoney(m.total)} TND · {m.count} rés.</div>
              <div className="text-green-300">{fmtMoney(m.paid)} payé</div>
            </div>

            <div className="w-full relative rounded overflow-hidden bg-gray-100" style={{ height: '100px' }}>
              {/* total bar */}
              <div
                className="absolute bottom-0 w-full bg-primary-200 rounded transition-all"
                style={{ height: `${heightPct}%` }}
              />
              {/* paid portion */}
              <div
                className="absolute bottom-0 w-full bg-primary-600 rounded transition-all"
                style={{ height: `${paidPct}%` }}
              />
            </div>
            <span className="text-[9px] text-gray-400">{MONTH_NAMES[m._id.month - 1]}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Facture generator ──────────────────────────────────────────────── */
const generateFacture = (booking) => {
  const fmtD = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
  const amount = parseFloat(booking.totalPrice || 0).toFixed(2);
  const currency = booking.currency || 'TND';
  const code = booking.confirmationCode || '—';
  const mLabel = methodLabel[booking.paymentMethod] || booking.paymentMethod || '—';
  const today = new Date().toLocaleDateString('fr-FR');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture ${code}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; background: white; padding: 32px; max-width: 700px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e40af; padding-bottom: 18px; margin-bottom: 24px; }
  .logo { font-size: 26px; font-weight: 900; color: #1e40af; letter-spacing: -0.5px; }
  .logo small { display: block; font-size: 11px; color: #6b7280; font-weight: 400; margin-top: 2px; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #374151; }
  .invoice-title .num { font-size: 13px; color: #6b7280; margin-top: 4px; }
  .invoice-title .date { font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .code-box { background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 8px; padding: 14px 20px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; }
  .code-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #3b82f6; font-weight: 700; margin-bottom: 4px; }
  .code-value { font-size: 28px; font-weight: 900; font-family: 'Courier New', monospace; letter-spacing: 4px; color: #1e3a8a; }
  .status-badge { background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #374151; padding-left: 10px; border-left: 3px solid #1e40af; margin: 18px 0 10px; }
  table.details { width: 100%; border-collapse: collapse; font-size: 13px; }
  table.details td { padding: 8px 10px; }
  table.details tr:nth-child(even) { background: #f9fafb; }
  table.details td:first-child { color: #6b7280; font-weight: 600; width: 40%; }
  table.details td:last-child { color: #111827; font-weight: 700; }
  .total-box { display: flex; justify-content: flex-end; margin-top: 22px; }
  .total-inner { background: #1e3a8a; color: white; border-radius: 10px; padding: 14px 28px; text-align: right; }
  .total-label { font-size: 10px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .total-value { font-size: 28px; font-weight: 900; font-family: 'Courier New', monospace; }
  .method-badge { display: inline-block; padding: 3px 10px; border-radius: 5px; font-size: 11px; font-weight: 700; background: #ede9fe; color: #5b21b6; }
  .footer { border-top: 1px solid #e5e7eb; padding-top: 14px; margin-top: 28px; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }
  @media print { @page { margin: 14mm 12mm; size: A4; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">Easy2Book <small>easy2book.tn</small></div>
    <div class="invoice-title">
      <h1>Facture / Reçu</h1>
      <div class="num">N° ${code}</div>
      <div class="date">Émis le ${today}</div>
    </div>
  </div>

  <div class="code-box">
    <div>
      <div class="code-label">Code de réservation</div>
      <div class="code-value">${code}</div>
    </div>
    <div class="status-badge">${booking.status || 'créée'}</div>
  </div>

  <div class="section-title">Détails de la prestation</div>
  <table class="details">
    <tbody>
      <tr><td>Méthode de paiement</td><td><span class="method-badge">${mLabel}</span></td></tr>
      <tr><td>Statut du paiement</td><td>${booking.paymentStatus || '—'}</td></tr>
      ${booking.paymentPlan ? `<tr><td>Plan de paiement</td><td>${booking.paymentPlan === 'installment' ? 'En tranches' : 'Intégral'}</td></tr>` : ''}
      ${booking.contactEmail ? `<tr><td>Client (email)</td><td>${booking.contactEmail}</td></tr>` : ''}
      ${booking.contactPhone ? `<tr><td>Téléphone</td><td>${booking.contactPhone}</td></tr>` : ''}
      <tr><td>Date de création</td><td>${fmtD(booking.createdAt)}</td></tr>
    </tbody>
  </table>

  <div class="section-title">Montant</div>
  <table class="details">
    <tbody>
      <tr><td>Montant total</td><td>${amount} ${currency}</td></tr>
      <tr><td>Devise</td><td>${currency}</td></tr>
    </tbody>
  </table>

  <div class="total-box">
    <div class="total-inner">
      <div class="total-label">Total à régler</div>
      <div class="total-value">${amount} <span style="font-size:14px;opacity:.7">${currency}</span></div>
    </div>
  </div>

  <div class="footer">
    <span>Easy2Book — easy2book.tn</span>
    <span>Document généré le ${today} — Non contractuel avant confirmation de l'hôtel.</span>
  </div>

  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=720,height=900');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

/* ══════════════════════════════════════════════════ MAIN ══════════════ */
const Comptabilite = () => {
  const [activeTab,   setActiveTab]   = useState('settings');
  const [summary,     setSummary]     = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [loadingSum,  setLoadingSum]  = useState(false);
  const [loadingTx,   setLoadingTx]   = useState(false);
  const [loadingMo,   setLoadingMo]   = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');
  const [transactions, setTransactions] = useState([]);
  const [monthlyData,  setMonthlyData]  = useState([]);
  const [markingPaid,  setMarkingPaid]  = useState(null);
  const [filter,       setFilter]       = useState({ method: 'all', status: 'all', search: '' });
  const [invoiceFilter, setInvoiceFilter] = useState({ method: 'all', status: 'all', search: '' });

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

  /* ── fetch transactions list ── */
  const loadTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res  = await fetch(`${API_ENDPOINTS.BOOKINGS_ADMIN_ALL}?limit=200`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      const list = data.data?.bookings || [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch { /* silent */ } finally { setLoadingTx(false); }
  }, []);

  /* ── fetch monthly chart data ── */
  const loadMonthly = useCallback(async () => {
    setLoadingMo(true);
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_ACCOUNTING_MONTHLY, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (data.status === 'success') setMonthlyData(data.data.months || []);
    } catch { /* silent */ } finally { setLoadingMo(false); }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);
  useEffect(() => {
    if (activeTab === 'finance') {
      loadSummary();
      loadTransactions();
      loadMonthly();
    } else if (activeTab === 'invoices') {
      loadTransactions();
    }
  }, [activeTab, loadSummary, loadTransactions, loadMonthly]);

  /* ── save settings ── */
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

  /* ── mark as paid ── */
  const markPaid = async (id) => {
    setMarkingPaid(id);
    try {
      const res  = await fetch(`${API_ENDPOINTS.BOOKINGS_ADMIN_PAYMENT}/${id}/payment`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ paymentStatus: 'paid' }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTransactions(prev => prev.map(b => b._id === id ? { ...b, paymentStatus: 'paid' } : b));
        loadSummary();
      }
    } catch { /* silent */ } finally { setMarkingPaid(null); }
  };

  /* ── export CSV ── */
  const exportCSV = () => {
    window.open(`${API_ENDPOINTS.BOOKINGS_ADMIN_EXPORT_CSV}?token=${token()}`, '_blank');
  };

  /* ── derived KPI ── */
  const totalRevenue  = summary?.byMethod?.reduce((s, m) => s + m.total,   0) || 0;
  const totalPending  = summary?.byMethod?.reduce((s, m) => s + m.pending, 0) || 0;
  const totalPaid     = summary?.byMethod?.reduce((s, m) => s + m.paid,    0) || 0;
  const totalCount    = summary?.byMethod?.reduce((s, m) => s + m.count,   0) || 0;
  const totalFailed   = totalRevenue - totalPaid - totalPending;

  /* ── filtered transactions ── */
  const filtered = useMemo(() => transactions.filter(b => {
    if (filter.method !== 'all' && b.paymentMethod !== filter.method) return false;
    if (filter.status !== 'all' && b.paymentStatus !== filter.status) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!b.confirmationCode?.toLowerCase().includes(q) && !b.contactEmail?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [transactions, filter]);

  /* ── totals for filtered set ── */
  const filteredTotal   = filtered.reduce((s, b) => s + parseFloat(b.totalPrice || 0), 0);
  const filteredPaid    = filtered.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + parseFloat(b.totalPrice || 0), 0);
  const filteredPending = filtered.filter(b => b.paymentStatus === 'pending').reduce((s, b) => s + parseFloat(b.totalPrice || 0), 0);

  const isFiltered = filter.method !== 'all' || filter.status !== 'all' || filter.search !== '';

  /* ── filtered invoices (dedicated tab) ── */
  const filteredInvoices = useMemo(() => transactions.filter(b => {
    if (invoiceFilter.method !== 'all' && b.paymentMethod !== invoiceFilter.method) return false;
    if (invoiceFilter.status !== 'all' && b.paymentStatus !== invoiceFilter.status) return false;
    if (invoiceFilter.search) {
      const q = invoiceFilter.search.toLowerCase();
      if (!b.confirmationCode?.toLowerCase().includes(q) && !b.contactEmail?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [transactions, invoiceFilter]);

  const invoicePaidCount    = transactions.filter(b => b.paymentStatus === 'paid').length;
  const invoicePendingCount = transactions.filter(b => b.paymentStatus === 'pending').length;
  const isInvoiceFiltered   = invoiceFilter.method !== 'all' || invoiceFilter.status !== 'all' || invoiceFilter.search !== '';

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Comptabilité</h1>
          <p className="text-sm text-gray-500 mt-0.5">Paramètres de paiement & gestion financière</p>
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
          <button onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'invoices' ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            <span className="flex items-center gap-1.5"><FileText size={14} /> Factures</span>
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
                <Field label="Instructions pour le client" multiline value={wafacash.instructions} onChange={v => setWafacash(s => ({ ...s, instructions: v }))} placeholder="Effectuez le virement Wafacash avec votre code de confirmation en référence..." />
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
                <Field label="Instructions pour le client" multiline value={izi.instructions} onChange={v => setIzi(s => ({ ...s, instructions: v }))} placeholder="Transférez le montant via Izi en indiquant votre code de confirmation..." />
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
                <Field label="Instructions supplémentaires" multiline value={agency.instructions} onChange={v => setAgency(s => ({ ...s, instructions: v }))} placeholder="Présentez-vous avec votre code de confirmation..." />
              </div>
            </div>
          </ChannelCard>

          {/* Online */}
          <ChannelCard title="Paiement en ligne" color="bg-blue-50 text-blue-700 border-blue-200" icon={CreditCard}>
            <div className="mt-4">
              <Field label="Instructions pour le client" multiline value={online.instructions} onChange={v => setOnline(s => ({ ...s, instructions: v }))} placeholder="Votre paiement sera traité de manière sécurisée. Vous recevrez une confirmation..." />
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
          {loadingSum && loadingTx ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <RefreshCw size={18} className="animate-spin" /> Chargement des données financières...
            </div>
          ) : (
            <>
              {/* ─ KPI cards ─ */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Revenus totaux',  value: fmtMoney(totalRevenue), sub: `${totalCount} rés.`,  icon: TrendingUp,    color: 'text-primary-600', bg: 'bg-primary-50'  },
                  { label: 'Payé',            value: fmtMoney(totalPaid),    sub: `${((totalPaid/Math.max(totalRevenue,1))*100).toFixed(0)}% du total`, icon: CheckCircle2,  color: 'text-green-600',   bg: 'bg-green-50'    },
                  { label: 'En attente',      value: fmtMoney(totalPending), sub: 'à encaisser',          icon: Clock,         color: 'text-yellow-600',  bg: 'bg-yellow-50'   },
                  { label: 'Écart',           value: fmtMoney(Math.max(totalFailed,0)), sub: 'annulé/échoué', icon: XCircle,   color: 'text-red-500',     bg: 'bg-red-50'      },
                ].map(({ label, value, sub, icon: Ic, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Ic size={15} className={color} />
                      </div>
                      <p className="text-xs font-medium text-gray-500 leading-tight">{label}</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900" dir="ltr">{value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{sub} · TND</p>
                  </div>
                ))}
              </div>

              {/* ─ Chart + Method breakdown ─ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Monthly chart */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart3 size={14} className="text-primary-600" /> Revenus mensuels
                    </h3>
                    {loadingMo && <RefreshCw size={12} className="text-gray-400 animate-spin" />}
                  </div>
                  <MonthlyChart months={monthlyData} />
                  <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-primary-600 inline-block" /> Payé</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-primary-200 inline-block" /> En attente</span>
                  </div>
                </div>

                {/* By method */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      <DollarSign size={14} className="text-primary-600" /> Par méthode de paiement
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {(summary?.byMethod || []).map(m => {
                      const pct = totalRevenue > 0 ? Math.round((m.total / totalRevenue) * 100) : 0;
                      return (
                        <div key={m._id} className="px-5 py-3.5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${methodColor[m._id] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {methodLabel[m._id] || m._id}
                              </span>
                              <span className="text-xs text-gray-500">{m.count} rés.</span>
                            </div>
                            <div className="text-right" dir="ltr">
                              <p className="text-sm font-bold text-gray-900">{fmtMoney(m.total)} TND</p>
                              <p className="text-[10px] text-gray-400">{pct}%</p>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-primary-600 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {!summary?.byMethod?.length && (
                      <div className="px-5 py-8 text-center text-xs text-gray-400">Aucune donnée</div>
                    )}
                  </div>
                </div>
              </div>

              {/* ─ Filter bar + Transaction table ─ */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 flex-1 min-w-0">
                    <Receipt size={14} className="text-primary-600 flex-shrink-0" />
                    Transactions
                    <span className="text-xs font-normal text-gray-400 ml-1">{filtered.length} / {transactions.length}</span>
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Code ou email…"
                        value={filter.search}
                        onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                        className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary-400 w-36"
                      />
                    </div>

                    {/* Method filter */}
                    <select
                      value={filter.method}
                      onChange={e => setFilter(f => ({ ...f, method: e.target.value }))}
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-400 bg-white"
                    >
                      <option value="all">Toutes méthodes</option>
                      {Object.entries(methodLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>

                    {/* Status filter */}
                    <select
                      value={filter.status}
                      onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-400 bg-white"
                    >
                      <option value="all">Tous statuts</option>
                      <option value="pending">En attente</option>
                      <option value="paid">Payé</option>
                      <option value="failed">Échoué</option>
                      <option value="refunded">Remboursé</option>
                    </select>

                    {isFiltered && (
                      <button onClick={() => setFilter({ method: 'all', status: 'all', search: '' })}
                        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                        <XCircle size={13} /> Effacer
                      </button>
                    )}

                    <button onClick={() => { loadTransactions(); loadSummary(); loadMonthly(); }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-gray-300 transition-colors">
                      <RefreshCw size={12} className={loadingTx ? 'animate-spin' : ''} /> Sync
                    </button>

                    <button onClick={exportCSV}
                      className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                      <Download size={12} /> CSV
                    </button>
                  </div>
                </div>

                {/* Filtered totals bar */}
                {isFiltered && filtered.length > 0 && (
                  <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-6 text-xs">
                    <span className="text-gray-500">Sélection :</span>
                    <span><strong className="text-gray-900">{fmtMoney(filteredTotal)} TND</strong> total</span>
                    <span className="text-green-600"><strong>{fmtMoney(filteredPaid)} TND</strong> payé</span>
                    <span className="text-yellow-600"><strong>{fmtMoney(filteredPending)} TND</strong> en attente</span>
                  </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                  {loadingTx ? (
                    <div className="flex items-center justify-center py-12 text-gray-400 gap-2 text-sm">
                      <RefreshCw size={16} className="animate-spin" /> Chargement...
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <Receipt size={28} className="mb-2 opacity-20" />
                      <p className="text-sm">Aucune transaction{isFiltered ? ' correspondant aux filtres' : ''}.</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-[11px] text-gray-400 uppercase tracking-wide">
                        <tr>
                          <th className="px-5 py-3 text-left font-medium">Code</th>
                          <th className="px-4 py-3 text-left font-medium">Méthode</th>
                          <th className="px-4 py-3 text-left font-medium">Paiement</th>
                          <th className="px-4 py-3 text-left font-medium">Statut</th>
                          <th className="px-4 py-3 text-right font-medium">Montant</th>
                          <th className="px-5 py-3 text-left font-medium">Date</th>
                          <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map(b => (
                          <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 font-mono text-xs text-gray-700 font-semibold">{b.confirmationCode || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${methodColor[b.paymentMethod] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {methodLabel[b.paymentMethod] || b.paymentMethod}
                                {b.paymentPlan === 'installment' && <span className="ml-1 opacity-60 text-[10px]">(tr)</span>}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${statusColor[b.paymentStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {b.paymentStatus || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium ${bookingStatusColor[b.status] || 'text-gray-500'}`}>
                                {b.status || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm tabular-nums" dir="ltr">
                              {fmtMoney(b.totalPrice)} <span className="text-[10px] font-normal text-gray-400">{b.currency || 'TND'}</span>
                            </td>
                            <td className="px-5 py-3 text-xs text-gray-400">{fmtDate(b.createdAt)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Mark as paid */}
                                {b.paymentStatus !== 'paid' && (
                                  <button
                                    onClick={() => markPaid(b._id)}
                                    disabled={markingPaid === b._id}
                                    title="Marquer comme payé"
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors disabled:opacity-50"
                                  >
                                    {markingPaid === b._id
                                      ? <RefreshCw size={11} className="animate-spin" />
                                      : <Check size={12} />
                                    }
                                  </button>
                                )}
                                {b.paymentStatus === 'paid' && (
                                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-500">
                                    <CheckCircle2 size={12} />
                                  </div>
                                )}
                                {/* Generate facture */}
                                <button
                                  onClick={() => generateFacture(b)}
                                  title="Générer facture"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors"
                                >
                                  <Printer size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      )}

      {/* ──────────── INVOICES TAB ──────────── */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">

          {/* Summary pills */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total factures', value: transactions.length,    color: 'bg-primary-50 text-primary-700 border-primary-200', icon: FileText },
              { label: 'Payées',         value: invoicePaidCount,        color: 'bg-green-50 text-green-700 border-green-200',       icon: CheckCircle2 },
              { label: 'En attente',     value: invoicePendingCount,     color: 'bg-yellow-50 text-yellow-700 border-yellow-200',    icon: Clock },
            ].map(({ label, value, color, icon: Ic }) => (
              <div key={label} className={`rounded-2xl border px-5 py-4 flex items-center gap-3 ${color}`}>
                <Ic size={18} className="flex-shrink-0 opacity-70" />
                <div>
                  <p className="text-2xl font-bold leading-none">{value}</p>
                  <p className="text-xs font-medium opacity-70 mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Invoice table card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 flex-1 min-w-0">
                <FileText size={14} className="text-primary-600 flex-shrink-0" />
                Gestionnaire de factures
                <span className="text-xs font-normal text-gray-400 ml-1">{filteredInvoices.length} / {transactions.length}</span>
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Code ou email…" value={invoiceFilter.search}
                    onChange={e => setInvoiceFilter(f => ({ ...f, search: e.target.value }))}
                    className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary-400 w-36"
                  />
                </div>
                <select value={invoiceFilter.method}
                  onChange={e => setInvoiceFilter(f => ({ ...f, method: e.target.value }))}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-400 bg-white">
                  <option value="all">Toutes méthodes</option>
                  {Object.entries(methodLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={invoiceFilter.status}
                  onChange={e => setInvoiceFilter(f => ({ ...f, status: e.target.value }))}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-400 bg-white">
                  <option value="all">Tous statuts</option>
                  <option value="pending">En attente</option>
                  <option value="paid">Payé</option>
                  <option value="failed">Échoué</option>
                  <option value="refunded">Remboursé</option>
                </select>
                {isInvoiceFiltered && (
                  <button onClick={() => setInvoiceFilter({ method: 'all', status: 'all', search: '' })}
                    className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <XCircle size={13} /> Effacer
                  </button>
                )}
                <button onClick={loadTransactions}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-gray-300 transition-colors">
                  <RefreshCw size={12} className={loadingTx ? 'animate-spin' : ''} /> Sync
                </button>
                {filteredInvoices.filter(b => b.paymentStatus === 'paid').length > 0 && (
                  <button
                    onClick={() => filteredInvoices.filter(b => b.paymentStatus === 'paid').forEach(b => generateFacture(b))}
                    className="flex items-center gap-1.5 text-xs bg-primary-700 hover:bg-primary-800 text-white rounded-lg px-2.5 py-1.5 transition-colors font-medium">
                    <Printer size={12} /> Tout imprimer ({filteredInvoices.filter(b => b.paymentStatus === 'paid').length})
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loadingTx ? (
                <div className="flex items-center justify-center py-12 text-gray-400 gap-2 text-sm">
                  <RefreshCw size={16} className="animate-spin" /> Chargement des factures...
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                  <FileText size={30} className="mb-2 opacity-20" />
                  <p className="text-sm font-medium">Aucune facture{isInvoiceFiltered ? ' correspondant aux filtres' : ''}.</p>
                  {isInvoiceFiltered && (
                    <button onClick={() => setInvoiceFilter({ method: 'all', status: 'all', search: '' })}
                      className="mt-3 text-xs text-primary-600 hover:underline">Effacer les filtres</button>
                  )}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-[11px] text-gray-400 uppercase tracking-wide">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">N° Facture</th>
                      <th className="px-4 py-3 text-left font-medium">Client</th>
                      <th className="px-4 py-3 text-left font-medium">Méthode</th>
                      <th className="px-4 py-3 text-left font-medium">Paiement</th>
                      <th className="px-4 py-3 text-left font-medium">Statut rés.</th>
                      <th className="px-4 py-3 text-right font-medium">Montant</th>
                      <th className="px-5 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredInvoices.map((b, idx) => (
                      <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs font-bold text-primary-700 tracking-wide">
                            FAC-{b.confirmationCode || String(idx + 1).padStart(4, '0')}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {b.paymentPlan === 'installment' ? 'En tranches' : 'Intégral'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-800 truncate max-w-[140px]">{b.contactEmail || '—'}</p>
                          {b.contactPhone && <p className="text-[10px] text-gray-400" dir="ltr">{b.contactPhone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${methodColor[b.paymentMethod] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {methodLabel[b.paymentMethod] || b.paymentMethod || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${statusColor[b.paymentStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {b.paymentStatus || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${bookingStatusColor[b.status] || 'text-gray-500'}`}>{b.status || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums" dir="ltr">
                          {fmtMoney(b.totalPrice)}<span className="text-[10px] font-normal text-gray-400 ml-1">{b.currency || 'TND'}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(b.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {b.paymentStatus !== 'paid' && (
                              <button onClick={() => markPaid(b._id)} disabled={markingPaid === b._id}
                                title="Marquer comme payé"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors disabled:opacity-50">
                                {markingPaid === b._id ? <RefreshCw size={11} className="animate-spin" /> : <Check size={12} />}
                              </button>
                            )}
                            {b.paymentStatus === 'paid' && (
                              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-500" title="Payé">
                                <CheckCircle2 size={12} />
                              </div>
                            )}
                            <button onClick={() => generateFacture(b)} title="Générer & imprimer la facture"
                              className="flex items-center gap-1 px-2.5 h-7 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 transition-colors text-[11px] font-semibold">
                              <Printer size={11} /> Facture
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Comptabilite;
