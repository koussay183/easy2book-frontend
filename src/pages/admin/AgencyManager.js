import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Plus,
  Eye,
  Building2,
  Users,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Printer,
  RefreshCw,
  Save,
  X,
  Edit2,
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

const fmt = (n) =>
  typeof n === 'number'
    ? n.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
    : '—';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatusBadge = ({ status }) => {
  const map = {
    active:    { label: 'Actif',      bg: '#dcfce7', color: '#166534' },
    pending:   { label: 'En attente', bg: '#fef9c3', color: '#854d0e' },
    suspended: { label: 'Suspendu',   bg: '#fee2e2', color: '#991b1b' },
  };
  const cfg = map[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const isAdmin = role === 'agency_admin';
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: isAdmin ? '#dbeafe' : '#f3f4f6', color: isAdmin ? '#1e40af' : '#374151' }}>
      {isAdmin ? 'Admin' : 'Staff'}
    </span>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ children, style = {} }) => (
  <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#111827', ...style }}>{children}</h3>
);

const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{children}</label>
);

const Input = ({ style = {}, ...props }) => (
  <input style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', ...style }} {...props} />
);

const Select = ({ children, style = {}, ...props }) => (
  <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', boxSizing: 'border-box', ...style }} {...props}>
    {children}
  </select>
);

const Textarea = ({ style = {}, ...props }) => (
  <textarea style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', ...style }} {...props} />
);

const PrimaryButton = ({ children, style = {}, ...props }) => (
  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#002d5f', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', ...style }} {...props}>
    {children}
  </button>
);

const GhostButton = ({ children, style = {}, ...props }) => (
  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'transparent', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', ...style }} {...props}>
    {children}
  </button>
);

const FormRow = ({ children, cols = 2 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, marginBottom: 16 }}>
    {children}
  </div>
);

const FormField = ({ children }) => <div>{children}</div>;

const Alert = ({ type, message, onClose }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8, background: isError ? '#fee2e2' : '#dcfce7', color: isError ? '#991b1b' : '#166534', marginBottom: 16, fontSize: 14 }}>
      {isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
};

const TableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const ThStyle = { textAlign: 'left', padding: '10px 12px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' };
const TdStyle = { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#374151' };

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AgencyManager() {
  const [view, setView] = useState('list');
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [detailTab, setDetailTab] = useState('info');
  const [agencyBookings, setAgencyBookings] = useState([]);
  const [agencyUsers, setAgencyUsers] = useState([]);
  const [stats, setStats] = useState(null);

  const emptyCreate = {
    name: '', email: '', phone: '', registrationNumber: '',
    street: '', city: '', country: '', postalCode: '',
    commissionRate: 10, creditLimit: 0,
    markupEnabled: false, markupType: 'percentage', markupValue: 0,
    createAdmin: false,
    adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: '',
  };
  const [createForm, setCreateForm] = useState(emptyCreate);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [statusDraft, setStatusDraft] = useState('');

  const [creditAmount, setCreditAmount] = useState('');
  const [creditType, setCreditType] = useState('credit');
  const [creditNote, setCreditNote] = useState('');
  const [creditLoading, setCreditLoading] = useState(false);

  const [invoiceFrom, setInvoiceFrom] = useState('');
  const [invoiceTo, setInvoiceTo] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotal, setBookingsTotal] = useState(0);

  const [addMemberForm, setAddMemberForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'agency_staff' });
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  // Markup inline editor (independent from main info edit mode)
  const [markupEditMode, setMarkupEditMode] = useState(false);
  const [markupForm, setMarkupForm] = useState({ enabled: false, type: 'percentage', value: 0 });

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const loadAgencies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authFetch(API_ENDPOINTS.ADMIN_AGENCIES);
      setAgencies(Array.isArray(data) ? data : (data.agencies || data.data || []));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAgencyDetail = useCallback(async (id) => {
    try {
      const data = await authFetch(API_ENDPOINTS.ADMIN_AGENCY(id));
      // Response: { status, data: { agency, users, recentBookings } }
      const agency = data.data?.agency || data.agency || data;
      setSelectedAgency(agency);
      setStatusDraft(agency.status || 'pending');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const loadStats = useCallback(async (id) => {
    try {
      const data = await authFetch(API_ENDPOINTS.ADMIN_AGENCY_STATS(id));
      // Response: { status, data: { byStatus, bookingsByMonth, creditBalance, ... } }
      setStats(data.data || data.stats || data);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const loadBookings = useCallback(async (id, page = 1) => {
    setLoading(true);
    try {
      const data = await authFetch(`${API_ENDPOINTS.ADMIN_AGENCY_BOOKINGS(id)}?page=${page}&limit=20`);
      // Response: { status, data: { bookings: [], total, page, pages } }
      setAgencyBookings(data.data?.bookings || data.bookings || []);
      setBookingsTotal(data.data?.total || data.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await authFetch(API_ENDPOINTS.ADMIN_AGENCY_USERS(id));
      setAgencyUsers(data.users || data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (view === 'list') loadAgencies();
  }, [view, loadAgencies]);

  useEffect(() => {
    if (view === 'detail' && selectedAgency?._id) {
      loadAgencyDetail(selectedAgency._id);
      setDetailTab('info');
      setEditMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    if (view !== 'detail' || !selectedAgency?._id) return;
    const id = selectedAgency._id;
    if (detailTab === 'finance')  loadStats(id);
    if (detailTab === 'bookings') loadBookings(id, 1);
    if (detailTab === 'team')     loadUsers(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailTab]);

  useEffect(() => {
    if (selectedAgency) {
      setEditForm({
        name: selectedAgency.name || '',
        email: selectedAgency.email || '',
        phone: selectedAgency.phone || '',
        registrationNumber: selectedAgency.registrationNumber || '',
        street: selectedAgency.address?.street || '',
        city: selectedAgency.address?.city || '',
        country: selectedAgency.address?.country || '',
        postalCode: selectedAgency.address?.postalCode || '',
        notes: selectedAgency.notes || '',
        commissionRate: selectedAgency.commissionRate ?? 0,
        creditLimit: selectedAgency.creditLimit ?? 0,
        markupEnabled: selectedAgency.markup?.enabled || false,
        markupType: selectedAgency.markup?.type || 'percentage',
        markupValue: selectedAgency.markup?.value || 0,
      });
      setMarkupForm({
        enabled: selectedAgency.markup?.enabled || false,
        type: selectedAgency.markup?.type || 'percentage',
        value: selectedAgency.markup?.value ?? 0,
      });
      setStatusDraft(selectedAgency.status || 'pending');
    }
  }, [selectedAgency]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const body = {
        agency: {
          name: createForm.name,
          email: createForm.email,
          phone: createForm.phone,
          registrationNumber: createForm.registrationNumber,
          address: { street: createForm.street, city: createForm.city, country: createForm.country, postalCode: createForm.postalCode },
          commissionRate: parseFloat(createForm.commissionRate) || 0,
          creditLimit: parseFloat(createForm.creditLimit) || 0,
          markup: { enabled: createForm.markupEnabled, type: createForm.markupType, value: parseFloat(createForm.markupValue) || 0 },
        },
        adminUser: createForm.createAdmin ? {
          firstName: createForm.adminFirstName,
          lastName: createForm.adminLastName,
          email: createForm.adminEmail,
          password: createForm.adminPassword,
        } : null,
      };
      await authFetch(API_ENDPOINTS.ADMIN_AGENCIES, { method: 'POST', body: JSON.stringify(body) });
      setSuccessMsg("L'agence a été créée avec succès.");
      setCreateForm(emptyCreate);
      await loadAgencies();
      setView('list');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoSave = async () => {
    setLoading(true);
    setError('');
    try {
      await authFetch(API_ENDPOINTS.ADMIN_AGENCY(selectedAgency._id), {
        method: 'PATCH',
        body: JSON.stringify({
          name: editForm.name, email: editForm.email, phone: editForm.phone,
          registrationNumber: editForm.registrationNumber,
          address: { street: editForm.street, city: editForm.city, country: editForm.country, postalCode: editForm.postalCode },
          notes: editForm.notes,
          commissionRate: parseFloat(editForm.commissionRate) || 0,
          creditLimit: parseFloat(editForm.creditLimit) || 0,
          markup: { enabled: editForm.markupEnabled, type: editForm.markupType, value: parseFloat(editForm.markupValue) || 0 },
        }),
      });
      setSuccessMsg('Informations mises à jour.');
      setEditMode(false);
      await loadAgencyDetail(selectedAgency._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      await authFetch(API_ENDPOINTS.ADMIN_AGENCY(selectedAgency._id), { method: 'PATCH', body: JSON.stringify({ status: statusDraft }) });
      setSuccessMsg('Statut mis à jour.');
      await loadAgencyDetail(selectedAgency._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditSubmit = async (e) => {
    e.preventDefault();
    setCreditLoading(true);
    setError('');
    try {
      await authFetch(API_ENDPOINTS.ADMIN_AGENCY_CREDIT(selectedAgency._id), {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(creditAmount), type: creditType, note: creditNote }),
      });
      setSuccessMsg('Crédit ajusté avec succès.');
      setCreditAmount('');
      setCreditNote('');
      await loadAgencyDetail(selectedAgency._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreditLoading(false);
    }
  };

  const handleMarkupSave = async () => {
    setLoading(true);
    setError('');
    try {
      await authFetch(API_ENDPOINTS.ADMIN_AGENCY(selectedAgency._id), {
        method: 'PATCH',
        body: JSON.stringify({
          markup: { enabled: markupForm.enabled, type: markupForm.type, value: parseFloat(markupForm.value) || 0 },
        }),
      });
      setSuccessMsg('Marge mise à jour.');
      setMarkupEditMode(false);
      await loadAgencyDetail(selectedAgency._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setInvoiceLoading(true);
    setError('');
    setInvoiceData(null);
    try {
      const params = new URLSearchParams();
      if (invoiceFrom)   params.set('from', invoiceFrom);
      if (invoiceTo)     params.set('to', invoiceTo);
      if (invoiceStatus) params.set('status', invoiceStatus);
      const data = await authFetch(`${API_ENDPOINTS.ADMIN_AGENCY_INVOICE(selectedAgency._id)}?${params.toString()}`);
      setInvoiceData(data.invoice || data.data || data);
    } catch (e) {
      setError(e.message);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddMemberLoading(true);
    setError('');
    try {
      await authFetch(API_ENDPOINTS.ADMIN_AGENCY_USERS(selectedAgency._id), { method: 'POST', body: JSON.stringify(addMemberForm) });
      setSuccessMsg('Membre ajouté avec succès.');
      setAddMemberForm({ firstName: '', lastName: '', email: '', password: '', role: 'agency_staff' });
      await loadUsers(selectedAgency._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setAddMemberLoading(false);
    }
  };

  const clearMessages = () => { setError(''); setSuccessMsg(''); };

  const navigateToDetail = (agency) => { setSelectedAgency(agency); clearMessages(); setView('detail'); };
  const navigateToList   = () => { clearMessages(); setView('list'); };
  const navigateToCreate = () => { clearMessages(); setCreateForm(emptyCreate); setView('create'); };

  // ── LIST VIEW ──────────────────────────────────────────────────────────────

  const renderList = () => {
    const totalCredit = agencies.reduce((s, a) => s + (a.creditBalance || 0), 0);
    const activeCount = agencies.filter((a) => a.status === 'active').length;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Agences partenaires</h2>
          <PrimaryButton onClick={navigateToCreate}><Plus size={16} />Créer une agence</PrimaryButton>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total agences',   value: agencies.length,           icon: <Building2 size={20} color="#002d5f" /> },
            { label: 'Agences actives', value: activeCount,               icon: <CheckCircle size={20} color="#16a34a" /> },
            { label: 'Crédit total',    value: `${fmt(totalCredit)} TND`, icon: <CreditCard size={20} color="#b45309" /> },
          ].map((s) => (
            <Card key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0f6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: 8 }}>Chargement...</p>
            </div>
          ) : agencies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#6b7280' }}>
              <Building2 size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ margin: 0, fontWeight: 500 }}>Aucune agence trouvée</p>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>Créez votre première agence partenaire.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={TableStyle}>
                <thead>
                  <tr>{['Code', 'Nom', 'Email', 'Statut', 'Crédit disponible', 'Commission', 'Actions'].map((h) => <th key={h} style={ThStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {agencies.map((a) => {
                    const available = (a.creditBalance || 0) + (a.creditLimit || 0);
                    return (
                      <tr key={a._id} onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')} onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                        <td style={{ ...TdStyle, fontFamily: 'monospace', fontWeight: 600, color: '#002d5f' }}>{a.code || a.agencyCode || '—'}</td>
                        <td style={{ ...TdStyle, fontWeight: 600 }}>{a.name}</td>
                        <td style={TdStyle}>{a.email}</td>
                        <td style={TdStyle}><StatusBadge status={a.status} /></td>
                        <td style={{ ...TdStyle, fontWeight: 600 }}>{fmt(available)} TND</td>
                        <td style={TdStyle}>{a.commissionRate ?? '—'}%</td>
                        <td style={TdStyle}>
                          <GhostButton onClick={() => navigateToDetail(a)} style={{ padding: '5px 12px', fontSize: 13 }}><Eye size={14} />Voir</GhostButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // ── CREATE VIEW ────────────────────────────────────────────────────────────

  const renderCreate = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={navigateToList} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, padding: 0 }}>
          <ArrowLeft size={16} />Agences
        </button>
        <ChevronRight size={14} color="#d1d5db" />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Créer une agence</span>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      <form onSubmit={handleCreateSubmit}>
        <Card style={{ marginBottom: 20 }}>
          <SectionTitle>Informations de l'agence</SectionTitle>
          <FormRow>
            <FormField><Label>Nom de l'agence *</Label><Input required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Nom de l'agence" /></FormField>
            <FormField><Label>Email *</Label><Input type="email" required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="email@agence.com" /></FormField>
          </FormRow>
          <FormRow>
            <FormField><Label>Téléphone</Label><Input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+216 xx xxx xxx" /></FormField>
            <FormField><Label>Numéro d'enregistrement</Label><Input value={createForm.registrationNumber} onChange={(e) => setCreateForm({ ...createForm, registrationNumber: e.target.value })} placeholder="RC / Matricule fiscal" /></FormField>
          </FormRow>
          <SectionTitle style={{ marginTop: 8 }}>Adresse</SectionTitle>
          <FormRow cols={1}><FormField><Label>Rue</Label><Input value={createForm.street} onChange={(e) => setCreateForm({ ...createForm, street: e.target.value })} placeholder="Adresse" /></FormField></FormRow>
          <FormRow cols={3}>
            <FormField><Label>Ville</Label><Input value={createForm.city} onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })} placeholder="Tunis" /></FormField>
            <FormField><Label>Pays</Label><Input value={createForm.country} onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })} placeholder="Tunisie" /></FormField>
            <FormField><Label>Code postal</Label><Input value={createForm.postalCode} onChange={(e) => setCreateForm({ ...createForm, postalCode: e.target.value })} placeholder="1000" /></FormField>
          </FormRow>
        </Card>

        <Card style={{ marginBottom: 20 }}>
          <SectionTitle>Paramètres commerciaux</SectionTitle>
          <FormRow>
            <FormField><Label>Taux de commission (%)</Label><Input type="number" min={0} max={100} value={createForm.commissionRate} onChange={(e) => setCreateForm({ ...createForm, commissionRate: e.target.value })} /></FormField>
            <FormField><Label>Limite de crédit (TND)</Label><Input type="number" min={0} value={createForm.creditLimit} onChange={(e) => setCreateForm({ ...createForm, creditLimit: e.target.value })} /></FormField>
          </FormRow>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
              <input type="checkbox" checked={createForm.markupEnabled} onChange={(e) => setCreateForm({ ...createForm, markupEnabled: e.target.checked })} />
              Activer le markup prix
            </label>
          </div>
          {createForm.markupEnabled && (
            <FormRow cols={2}>
              <FormField><Label>Type de markup</Label><Select value={createForm.markupType} onChange={(e) => setCreateForm({ ...createForm, markupType: e.target.value })}><option value="percentage">Pourcentage (%)</option><option value="fixed">Montant fixe (TND)</option></Select></FormField>
              <FormField><Label>Valeur du markup</Label><Input type="number" min={0} value={createForm.markupValue} onChange={(e) => setCreateForm({ ...createForm, markupValue: e.target.value })} /></FormField>
            </FormRow>
          )}
        </Card>

        <Card style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" checked={createForm.createAdmin} onChange={(e) => setCreateForm({ ...createForm, createAdmin: e.target.checked })} />
              Créer le compte de connexion de l'agence
            </label>
            <p style={{ margin: '6px 0 0 24px', fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
              Crée l'identifiant (email + mot de passe) que l'agence utilisera pour se connecter au portail <strong>/agency/login</strong>. Sans cela, vous devrez créer l'utilisateur séparément depuis l'onglet <em>Équipe</em>.
            </p>
          </div>
          {createForm.createAdmin && (
            <>
              <FormRow>
                <FormField><Label>Prénom *</Label><Input required={createForm.createAdmin} value={createForm.adminFirstName} onChange={(e) => setCreateForm({ ...createForm, adminFirstName: e.target.value })} /></FormField>
                <FormField><Label>Nom *</Label><Input required={createForm.createAdmin} value={createForm.adminLastName} onChange={(e) => setCreateForm({ ...createForm, adminLastName: e.target.value })} /></FormField>
              </FormRow>
              <FormRow>
                <FormField><Label>Email *</Label><Input type="email" required={createForm.createAdmin} value={createForm.adminEmail} onChange={(e) => setCreateForm({ ...createForm, adminEmail: e.target.value })} /></FormField>
                <FormField><Label>Mot de passe *</Label><Input type="password" required={createForm.createAdmin} value={createForm.adminPassword} onChange={(e) => setCreateForm({ ...createForm, adminPassword: e.target.value })} /></FormField>
              </FormRow>
            </>
          )}
        </Card>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={15} />}
            Créer l'agence
          </PrimaryButton>
          <button type="button" onClick={navigateToList} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14 }}>Annuler</button>
        </div>
      </form>
    </div>
  );

  // ── DETAIL: INFO TAB ───────────────────────────────────────────────────────

  const renderInfoTab = () => {
    const a = selectedAgency;
    if (!a) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Main info card — full width */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionTitle style={{ margin: 0 }}>Informations de l'agence</SectionTitle>
            {!editMode ? (
              <GhostButton onClick={() => setEditMode(true)} style={{ fontSize: 13 }}><Edit2 size={14} />Modifier</GhostButton>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <PrimaryButton onClick={handleInfoSave} disabled={loading} style={{ fontSize: 13, padding: '7px 14px' }}><Save size={14} />Enregistrer</PrimaryButton>
                <GhostButton onClick={() => setEditMode(false)} style={{ fontSize: 13 }}><X size={14} />Annuler</GhostButton>
              </div>
            )}
          </div>
          {editMode ? (
            <>
              <FormRow><FormField><Label>Nom</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></FormField><FormField><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></FormField></FormRow>
              <FormRow><FormField><Label>Téléphone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></FormField><FormField><Label>Numéro d'enregistrement</Label><Input value={editForm.registrationNumber} onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })} /></FormField></FormRow>
              <FormRow cols={1}><FormField><Label>Rue</Label><Input value={editForm.street} onChange={(e) => setEditForm({ ...editForm, street: e.target.value })} /></FormField></FormRow>
              <FormRow cols={3}>
                <FormField><Label>Ville</Label><Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} /></FormField>
                <FormField><Label>Pays</Label><Input value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} /></FormField>
                <FormField><Label>Code postal</Label><Input value={editForm.postalCode} onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })} /></FormField>
              </FormRow>
              <FormRow cols={1}><FormField><Label>Notes</Label><Textarea rows={3} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></FormField></FormRow>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginTop: 4 }}>
                <FormRow>
                  <FormField>
                    <Label>Commission analytique (%)</Label>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 8px' }}>Réservé à usage analytique — n'affecte pas le calcul du crédit.</p>
                    <Input type="number" min={0} max={100} step={0.1} value={editForm.commissionRate} onChange={(e) => setEditForm({ ...editForm, commissionRate: e.target.value })} />
                  </FormField>
                  <FormField>
                    <Label>Limite de crédit (TND)</Label>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 8px' }}>Crédit de confiance accordé au-delà du solde chargé.</p>
                    <Input type="number" min={0} step={1} value={editForm.creditLimit} onChange={(e) => setEditForm({ ...editForm, creditLimit: e.target.value })} />
                  </FormField>
                </FormRow>
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Nom', a.name], ['Email', a.email], ['Téléphone', a.phone],
                ['Enregistrement', a.registrationNumber],
                ['Adresse', [a.address?.street, a.address?.city, a.address?.country].filter(Boolean).join(', ')],
                ['Notes', a.notes],
                ['Commission analytique', `${a.commissionRate ?? '—'}%`],
                ['Limite crédit', `${fmt(a.creditLimit)} TND`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{v || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Statut */}
        <Card>
          <SectionTitle>Statut de l'agence</SectionTitle>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)} style={{ flex: 1 }}>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
            </Select>
            <PrimaryButton onClick={handleStatusUpdate} disabled={loading} style={{ whiteSpace: 'nowrap' }}>Mettre à jour</PrimaryButton>
          </div>
        </Card>

        {/* Solde crédit */}
        <Card>
          <SectionTitle>Solde crédit</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Solde chargé',      `${fmt(a.creditBalance)} TND`],
              ['Crédit disponible', `${fmt((a.creditBalance || 0) + (a.creditLimit || 0))} TND`],
              ['Limite accordée',   `${fmt(a.creditLimit)} TND`],
            ].map(([k, v]) => (
              <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Marge Easy2Book — dedicated full-width inline editor */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <SectionTitle style={{ margin: 0 }}>Marge Easy2Book</SectionTitle>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>
                Appliquée sur chaque réservation B2B. L'agence paie : prix fournisseur + marge. Easy2Book conserve 100% de la marge.
              </p>
            </div>
            {!markupEditMode ? (
              <GhostButton onClick={() => { setMarkupForm({ enabled: a.markup?.enabled || false, type: a.markup?.type || 'percentage', value: a.markup?.value ?? 0 }); setMarkupEditMode(true); }} style={{ fontSize: 13 }}>
                <Edit2 size={14} />Modifier la marge
              </GhostButton>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <PrimaryButton onClick={handleMarkupSave} disabled={loading} style={{ fontSize: 13, padding: '7px 14px' }}><Save size={14} />Enregistrer</PrimaryButton>
                <GhostButton onClick={() => setMarkupEditMode(false)} style={{ fontSize: 13 }}><X size={14} />Annuler</GhostButton>
              </div>
            )}
          </div>

          {markupEditMode ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'end' }}>
              <FormField>
                <Label>Statut</Label>
                <Select value={markupForm.enabled ? 'on' : 'off'} onChange={(e) => setMarkupForm({ ...markupForm, enabled: e.target.value === 'on' })}>
                  <option value="on">Activée</option>
                  <option value="off">Désactivée</option>
                </Select>
              </FormField>
              <FormField>
                <Label>Type</Label>
                <Select value={markupForm.type} onChange={(e) => setMarkupForm({ ...markupForm, type: e.target.value })} disabled={!markupForm.enabled}>
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (TND)</option>
                </Select>
              </FormField>
              <FormField>
                <Label>Valeur {markupForm.type === 'percentage' ? '(%)' : '(TND)'}</Label>
                <Input type="number" min={0} step={markupForm.type === 'percentage' ? 0.1 : 1} value={markupForm.value} onChange={(e) => setMarkupForm({ ...markupForm, value: e.target.value })} disabled={!markupForm.enabled} />
              </FormField>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch' }}>
              {/* Status pill */}
              <div style={{ background: a.markup?.enabled ? '#e6eef5' : '#f3f4f6', border: `1px solid ${a.markup?.enabled ? '#ccdcea' : '#e5e7eb'}`, borderRadius: 10, padding: '12px 20px', minWidth: 120 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Statut</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: a.markup?.enabled ? '#002d5f' : '#9ca3af' }}>
                  {a.markup?.enabled ? 'Activée' : 'Désactivée'}
                </div>
              </div>

              {a.markup?.enabled ? (
                <>
                  <div style={{ background: '#e6eef5', border: '1px solid #ccdcea', borderRadius: 10, padding: '12px 20px', minWidth: 140 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Type</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#002d5f' }}>
                      {a.markup.type === 'fixed' ? 'Montant fixe' : 'Pourcentage'}
                    </div>
                  </div>
                  <div style={{ background: '#002d5f', border: '1px solid #001d3f', borderRadius: 10, padding: '12px 20px', minWidth: 140 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Marge par réservation</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
                      {a.markup.type === 'fixed' ? `+${a.markup.value} TND` : `+${a.markup.value}%`}
                    </div>
                  </div>
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 20px', flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Exemple de calcul</div>
                    <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                      myGo <strong>200 TND</strong> + marge <strong>{a.markup.type === 'fixed' ? `${a.markup.value} TND` : `${(200 * (a.markup.value / 100)).toFixed(3)} TND (${a.markup.value}%)`}</strong>
                      <br />
                      → Débit crédit agence : <strong style={{ color: '#002d5f' }}>
                        {a.markup.type === 'fixed' ? `${(200 + (a.markup.value || 0)).toFixed(3)} TND` : `${(200 * (1 + (a.markup.value || 0) / 100)).toFixed(3)} TND`}
                      </strong>
                      <br />
                      → Bénéfice Easy2Book : <strong style={{ color: '#166534' }}>
                        {a.markup.type === 'fixed' ? `${parseFloat(a.markup.value || 0).toFixed(3)} TND` : `${(200 * (a.markup.value || 0) / 100).toFixed(3)} TND`}
                      </strong>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 20px', flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>
                    Aucune marge configurée — l'agence paie uniquement le prix fournisseur exact. Easy2Book ne perçoit pas de marge sur cette agence.
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    );
  };

  // ── DETAIL: FINANCE TAB ────────────────────────────────────────────────────

  const renderFinanceTab = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <SectionTitle>Ajustement de crédit</SectionTitle>
          <form onSubmit={handleCreditSubmit}>
            <div style={{ marginBottom: 14 }}><Label>Montant (TND)</Label><Input type="number" required min={0} value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} placeholder="0.000" /></div>
            <div style={{ marginBottom: 14 }}>
              <Label>Type</Label>
              <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
                {[{ val: 'credit', label: 'Crédit (ajouter)' }, { val: 'debit', label: 'Débit (retirer)' }].map(({ val, label }) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                    <input type="radio" name="creditType" value={val} checked={creditType === val} onChange={() => setCreditType(val)} />{label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}><Label>Note</Label><Textarea rows={2} value={creditNote} onChange={(e) => setCreditNote(e.target.value)} placeholder="Raison de l'ajustement..." /></div>
            <PrimaryButton type="submit" disabled={creditLoading}>
              {creditLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={14} />}
              Appliquer
            </PrimaryButton>
          </form>
        </Card>

        <Card>
          <SectionTitle>Statistiques</SectionTitle>
          {!stats ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: 8, fontSize: 13 }}>Chargement des statistiques...</p>
            </div>
          ) : (
            <>
              {/* Credit balance summary (always fresh from selectedAgency) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  ['Solde crédit',      `${fmt(stats.creditBalance ?? selectedAgency?.creditBalance ?? 0)} TND`],
                  ['Crédit disponible', `${fmt(stats.availableCredit ?? ((selectedAgency?.creditBalance || 0) + (selectedAgency?.creditLimit || 0)))} TND`],
                  ['Limite crédit',     `${fmt(stats.creditLimit ?? selectedAgency?.creditLimit ?? 0)} TND`],
                  ['Réservations B2B',  Object.values(stats.byStatus || {}).reduce((s, v) => s + (v.count || 0), 0)],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Bookings by status */}
              {stats.byStatus && Object.keys(stats.byStatus).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Par statut</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(stats.byStatus).map(([status, { count, revenue }]) => (
                      <div key={status} style={{ background: '#f3f4f6', borderRadius: 8, padding: '8px 12px', minWidth: 90, textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{count}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'capitalize' }}>{status}</div>
                        {revenue > 0 && <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>{fmt(revenue)} TND</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly trend */}
              {Array.isArray(stats.bookingsByMonth) && stats.bookingsByMonth.length > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Tendance mensuelle (6 derniers mois)</div>
                  <table style={{ ...TableStyle, fontSize: 12 }}>
                    <thead><tr>{['Mois', 'Réservations', 'Revenu', 'Marge'].map((h) => <th key={h} style={{ ...ThStyle, padding: '7px 10px' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {stats.bookingsByMonth.slice(-6).map((m, i) => {
                        const label = m._id || (m.year && m.month ? `${String(m.month).padStart(2, '0')}/${m.year}` : `M${i + 1}`);
                        return (
                          <tr key={i}>
                            <td style={{ ...TdStyle, padding: '7px 10px' }}>{label}</td>
                            <td style={{ ...TdStyle, padding: '7px 10px' }}>{m.count ?? m.bookings ?? '—'}</td>
                            <td style={{ ...TdStyle, padding: '7px 10px' }}>{m.revenue != null ? `${fmt(m.revenue)} TND` : '—'}</td>
                            <td style={{ ...TdStyle, padding: '7px 10px' }}>{(m.profit ?? m.margin)  != null ? `${fmt(m.profit ?? m.margin)} TND` : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </Card>
      </div>

      <Card>
        <SectionTitle>Générateur de facture</SectionTitle>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
          <div><Label>Du</Label><Input type="date" value={invoiceFrom} onChange={(e) => setInvoiceFrom(e.target.value)} style={{ width: 160 }} /></div>
          <div><Label>Au</Label><Input type="date" value={invoiceTo}   onChange={(e) => setInvoiceTo(e.target.value)}   style={{ width: 160 }} /></div>
          <div>
            <Label>Statut</Label>
            <Select value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value)} style={{ width: 160 }}>
              <option value="">Tous</option>
              <option value="confirmed">Confirmé</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
            </Select>
          </div>
          <PrimaryButton onClick={handleGenerateInvoice} disabled={invoiceLoading}>
            {invoiceLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={14} />}
            Générer la facture
          </PrimaryButton>
        </div>
        {invoiceData && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <GhostButton onClick={() => window.print()}><Printer size={14} />Imprimer</GhostButton>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={TableStyle}>
                <thead><tr>{['Code', 'Hôtel', 'Arrivée', 'Départ', 'Coût fournisseur', 'Markup', 'Prix client', 'Commission', 'Bénéfice net'].map((h) => <th key={h} style={ThStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {(Array.isArray(invoiceData) ? invoiceData : invoiceData.items || []).map((row, i) => (
                    <tr key={i}>
                      <td style={{ ...TdStyle, fontFamily: 'monospace' }}>{row.bookingCode || row.confirmationCode || '—'}</td>
                      <td style={TdStyle}>{row.hotel || row.hotelName || '—'}</td>
                      <td style={TdStyle}>{fmtDate(row.checkIn)}</td>
                      <td style={TdStyle}>{fmtDate(row.checkOut)}</td>
                      <td style={TdStyle}>{row.providerCost  != null ? `${fmt(row.providerCost)} TND`  : '—'}</td>
                      <td style={TdStyle}>{row.markup        != null ? `${fmt(row.markup)} TND`        : '—'}</td>
                      <td style={TdStyle}>{row.clientPrice   != null ? `${fmt(row.clientPrice)} TND`   : '—'}</td>
                      <td style={TdStyle}>{row.commission    != null ? `${fmt(row.commission)} TND`    : '—'}</td>
                      <td style={{ ...TdStyle, fontWeight: 600, color: '#166534' }}>{row.netProfit != null ? `${fmt(row.netProfit)} TND` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );

  // ── DETAIL: BOOKINGS TAB ───────────────────────────────────────────────────

  const renderBookingsTab = () => {
    const totalPages = Math.max(1, Math.ceil(bookingsTotal / 20));
    return (
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}><RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /></div>
        ) : agencyBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}><FileText size={32} style={{ opacity: 0.3 }} /><p style={{ marginTop: 8 }}>Aucune réservation trouvée</p></div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={TableStyle}>
                <thead><tr>{['Code confirmation', 'Hôtel', 'Arrivée', 'Départ', 'Prix total', 'Bénéfice net B2B', 'Statut', 'Date création'].map((h) => <th key={h} style={ThStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {agencyBookings.map((b) => (
                    <tr key={b._id} onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')} onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                      <td style={{ ...TdStyle, fontFamily: 'monospace', fontWeight: 600, color: '#002d5f' }}>{b.confirmationCode || '—'}</td>
                      <td style={TdStyle}>{b.hotel?.name || b.hotelName || '—'}</td>
                      <td style={TdStyle}>{fmtDate(b.checkIn)}</td>
                      <td style={TdStyle}>{fmtDate(b.checkOut)}</td>
                      <td style={{ ...TdStyle, fontWeight: 600 }}>{b.totalPrice   != null ? `${fmt(b.totalPrice)} TND`   : '—'}</td>
                      <td style={{ ...TdStyle, color: '#166534', fontWeight: 600 }}>{b.b2bNetProfit != null ? `${fmt(b.b2bNetProfit)} TND` : '—'}</td>
                      <td style={TdStyle}><StatusBadge status={b.status} /></td>
                      <td style={TdStyle}>{fmtDate(b.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '12px 16px' }}>
                <GhostButton disabled={bookingsPage === 1} onClick={() => { const p = bookingsPage - 1; setBookingsPage(p); loadBookings(selectedAgency._id, p); }} style={{ padding: '5px 12px', fontSize: 13 }}>Précédent</GhostButton>
                <span style={{ alignSelf: 'center', fontSize: 13, color: '#6b7280' }}>Page {bookingsPage} / {totalPages}</span>
                <GhostButton disabled={bookingsPage === totalPages} onClick={() => { const p = bookingsPage + 1; setBookingsPage(p); loadBookings(selectedAgency._id, p); }} style={{ padding: '5px 12px', fontSize: 13 }}>Suivant</GhostButton>
              </div>
            )}
          </>
        )}
      </Card>
    );
  };

  // ── DETAIL: TEAM TAB ───────────────────────────────────────────────────────

  const renderTeamTab = () => (
    <div>
      <Card style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <SectionTitle style={{ margin: 0 }}>Membres de l'équipe</SectionTitle>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}><RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /></div>
        ) : agencyUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}><Users size={32} style={{ opacity: 0.3 }} /><p style={{ marginTop: 8 }}>Aucun membre trouvé</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={TableStyle}>
              <thead><tr>{['Nom', 'Email', 'Rôle', 'Statut', 'Membre depuis'].map((h) => <th key={h} style={ThStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {agencyUsers.map((u) => (
                  <tr key={u._id} onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')} onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                    <td style={{ ...TdStyle, fontWeight: 600 }}>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td style={TdStyle}>{u.email}</td>
                    <td style={TdStyle}><RoleBadge role={u.role} /></td>
                    <td style={TdStyle}>
                      <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: u.isActive ? '#dcfce7' : '#f3f4f6', color: u.isActive ? '#166534' : '#6b7280' }}>
                        {u.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={TdStyle}>{fmtDate(u.createdAt || u.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>Ajouter un membre</SectionTitle>
        <form onSubmit={handleAddMember}>
          <FormRow>
            <FormField><Label>Prénom *</Label><Input required value={addMemberForm.firstName} onChange={(e) => setAddMemberForm({ ...addMemberForm, firstName: e.target.value })} /></FormField>
            <FormField><Label>Nom *</Label><Input required value={addMemberForm.lastName} onChange={(e) => setAddMemberForm({ ...addMemberForm, lastName: e.target.value })} /></FormField>
          </FormRow>
          <FormRow>
            <FormField><Label>Email *</Label><Input type="email" required value={addMemberForm.email} onChange={(e) => setAddMemberForm({ ...addMemberForm, email: e.target.value })} /></FormField>
            <FormField><Label>Mot de passe *</Label><Input type="password" required value={addMemberForm.password} onChange={(e) => setAddMemberForm({ ...addMemberForm, password: e.target.value })} /></FormField>
          </FormRow>
          <FormRow cols={2}>
            <FormField>
              <Label>Rôle</Label>
              <Select value={addMemberForm.role} onChange={(e) => setAddMemberForm({ ...addMemberForm, role: e.target.value })}>
                <option value="agency_admin">Admin</option>
                <option value="agency_staff">Staff</option>
              </Select>
            </FormField>
          </FormRow>
          <PrimaryButton type="submit" disabled={addMemberLoading}>
            {addMemberLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
            Ajouter le membre
          </PrimaryButton>
        </form>
      </Card>
    </div>
  );

  // ── DETAIL VIEW ────────────────────────────────────────────────────────────

  const renderDetail = () => {
    const a = selectedAgency;
    if (!a) return null;
    const tabs = [
      { key: 'info',     label: 'Info',        icon: <Building2 size={15} /> },
      { key: 'finance',  label: 'Finance',      icon: <CreditCard size={15} /> },
      { key: 'bookings', label: 'Réservations', icon: <FileText size={15} /> },
      { key: 'team',     label: 'Équipe',       icon: <Users size={15} /> },
    ];
    const kpis = [
      { label: 'Solde crédit',      value: `${fmt(a.creditBalance || 0)} TND` },
      { label: 'Crédit disponible', value: `${fmt((a.creditBalance || 0) + (a.creditLimit || 0))} TND` },
      { label: 'Marge',             value: a.markup?.enabled ? (a.markup.type === 'fixed' ? `+${a.markup.value} TND` : `+${a.markup.value}%`) : 'Aucune' },
    ];
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <button onClick={navigateToList} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, padding: 0, marginBottom: 12 }}>
            <ArrowLeft size={16} />Agences
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>{a.name}</h2>
                <StatusBadge status={a.status} />
              </div>
              <span style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'monospace' }}>Code: {a.code || a.agencyCode || '—'}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {kpis.map((k) => (
                <div key={k.label} style={{ background: '#e6eef5', border: '1px solid #ccdcea', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#002d5f' }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{k.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e5e7eb' }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => { clearMessages(); setDetailTab(t.key); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: detailTab === t.key ? 700 : 500, color: detailTab === t.key ? '#002d5f' : '#6b7280', borderBottom: detailTab === t.key ? '2px solid #002d5f' : '2px solid transparent', marginBottom: -1, transition: 'all 0.15s' }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {detailTab === 'info'     && renderInfoTab()}
        {detailTab === 'finance'  && renderFinanceTab()}
        {detailTab === 'bookings' && renderBookingsTab()}
        {detailTab === 'team'     && renderTeamTab()}
      </div>
    );
  };

  // ── Root render ────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media print { body * { visibility: hidden; } .invoice-print, .invoice-print * { visibility: visible; } .invoice-print { position: absolute; left: 0; top: 0; width: 100%; } }
      `}</style>
      <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
        {view === 'list'   && renderList()}
        {view === 'create' && renderCreate()}
        {view === 'detail' && renderDetail()}
      </div>
    </>
  );
}
