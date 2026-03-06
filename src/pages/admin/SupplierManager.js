import React, { useState, useEffect, useCallback } from 'react';
import {
  Plug, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle,
  Edit3, X, Eye, EyeOff, ChevronUp, ChevronDown, Wifi, WifiOff,
  Activity, BarChart3, ExternalLink, Shield, Globe, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const statusBadge = (status) => {
  if (status === 'ok')      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'failed')  return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
};

const statusIcon = (status) => {
  if (status === 'ok')      return <CheckCircle size={12} />;
  if (status === 'failed')  return <XCircle size={12} />;
  return <Clock size={12} />;
};

const fmtMs = (ms) => ms >= 1000 ? `${(ms/1000).toFixed(1)}s` : `${ms}ms`;

const durationColor = (ms) =>
  ms > 3000 ? 'text-red-600 font-bold' :
  ms > 1000 ? 'text-amber-600 font-semibold' :
  'text-emerald-600';

/* ── Credential modal ────────────────────────────────────────────────────────── */
const CredentialModal = ({ config, onSave, onClose }) => {
  const [form, setForm]   = useState({
    apiUrl:   config.credentials?.apiUrl   || '',
    login:    config.credentials?.login    || '',
    password: config.credentials?.password || '',
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ credentials: form });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary-700" />
            <p className="text-sm font-bold text-gray-900">Identifiants — {config.label}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">URL de l'API</label>
            <input
              type="text"
              value={form.apiUrl}
              onChange={e => setForm(f => ({ ...f, apiUrl: e.target.value }))}
              placeholder="https://api.supplier.com/"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Identifiant (Login)</label>
            <input
              type="text"
              value={form.login}
              onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-primary-400"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 leading-snug">
            Les identifiants sont stockés en base de données. Les changements ici ne modifient pas les variables d'environnement du serveur.
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:bg-primary-400 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving && <RefreshCw size={13} className="animate-spin" />}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium">Annuler</button>
        </div>
      </div>
    </div>
  );
};

/* ── Main component ──────────────────────────────────────────────────────────── */
const SupplierManager = () => {
  const navigate = useNavigate();
  const [configs,    setConfigs]    = useState([]);
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [testing,    setTesting]    = useState({});   // { [supplierId]: boolean }
  const [testResult, setTestResult] = useState({});   // { [supplierId]: { ms, status } }
  const [editModal,  setEditModal]  = useState(null); // config to edit, or null
  const [saving,     setSaving]     = useState({});

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(API_ENDPOINTS.SUPPLIER_CONFIGS, { headers: authHeaders() });
      const data = await res.json();
      if (data.status === 'success') setConfigs(data.data);
    } catch { /* ignore */ }
    finally  { setLoading(false); }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const res  = await fetch(`${API_ENDPOINTS.SUPPLIER_CONFIG_LOGS}?perPage=20`, { headers: authHeaders() });
      const data = await res.json();
      if (data.status === 'success') setLogs(data.data.logs || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadConfigs();
    loadLogs();
  }, [loadConfigs, loadLogs]);

  const updateConfig = async (supplierId, update) => {
    setSaving(s => ({ ...s, [supplierId]: true }));
    try {
      const res  = await fetch(API_ENDPOINTS.SUPPLIER_CONFIG_UPDATE(supplierId), {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(update),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setConfigs(prev => prev.map(c => c.supplierId === supplierId ? data.data : c));
      }
    } catch { /* ignore */ }
    finally  { setSaving(s => ({ ...s, [supplierId]: false })); }
  };

  const testConnection = async (supplierId) => {
    setTesting(s => ({ ...s, [supplierId]: true }));
    setTestResult(s => ({ ...s, [supplierId]: null }));
    try {
      const res  = await fetch(API_ENDPOINTS.SUPPLIER_CONFIG_TEST(supplierId), {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTestResult(s => ({ ...s, [supplierId]: data.data }));
        setConfigs(prev => prev.map(c =>
          c.supplierId === supplierId
            ? { ...c, lastTestStatus: data.data.testStatus, lastTestMs: data.data.durationMs, lastTestedAt: new Date().toISOString() }
            : c
        ));
        loadLogs(); // refresh recent logs
      }
    } catch { /* ignore */ }
    finally  { setTesting(s => ({ ...s, [supplierId]: false })); }
  };

  const changePriority = async (supplierId, delta) => {
    const cfg = configs.find(c => c.supplierId === supplierId);
    if (!cfg) return;
    const newPriority = Math.max(1, cfg.priority + delta);
    await updateConfig(supplierId, { priority: newPriority });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw size={28} className="animate-spin text-primary-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="ltr">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestion des Fournisseurs</h2>
          <p className="text-xs text-gray-500 mt-0.5">Gérez les intégrations, identifiants et priorités de chaque fournisseur</p>
        </div>
        <button onClick={() => { loadConfigs(); loadLogs(); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-xs font-medium transition-colors">
          <RefreshCw size={13} />Actualiser
        </button>
      </div>

      {/* Supplier cards */}
      <div className="space-y-4">
        {configs.map(cfg => {
          const successRate = cfg.totalCalls > 0
            ? Math.round((cfg.successCalls / cfg.totalCalls) * 100)
            : null;
          const live = testResult[cfg.supplierId];

          return (
            <div key={cfg.supplierId}
              className={`bg-white rounded-2xl border-2 transition-all ${cfg.enabled ? 'border-primary-100' : 'border-gray-100'}`}>

              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.enabled ? 'bg-primary-50' : 'bg-gray-100'}`}>
                    <Plug size={18} className={cfg.enabled ? 'text-primary-700' : 'text-gray-400'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{cfg.label}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(cfg.lastTestStatus)}`}>
                        {statusIcon(cfg.lastTestStatus)}{cfg.lastTestStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{cfg.description || cfg.supplierId}</p>
                  </div>
                </div>

                {/* Priority + enable toggle */}
                <div className="flex items-center gap-3">
                  {/* Priority */}
                  <div className="flex flex-col items-center">
                    <button onClick={() => changePriority(cfg.supplierId, -1)}
                      className="p-0.5 text-gray-400 hover:text-gray-700"><ChevronUp size={14} /></button>
                    <span className="text-xs font-bold text-gray-700 w-5 text-center">{cfg.priority}</span>
                    <button onClick={() => changePriority(cfg.supplierId, 1)}
                      className="p-0.5 text-gray-400 hover:text-gray-700"><ChevronDown size={14} /></button>
                  </div>

                  {/* Enable toggle */}
                  <button
                    onClick={() => updateConfig(cfg.supplierId, { enabled: !cfg.enabled })}
                    disabled={saving[cfg.supplierId]}
                    className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    title={cfg.enabled ? 'Désactiver' : 'Activer'}
                  >
                    {cfg.enabled
                      ? <><ToggleRight size={22} className="text-emerald-500" /><span className="text-emerald-700">Actif</span></>
                      : <><ToggleLeft size={22} className="text-gray-400" /><span className="text-gray-500">Inactif</span></>
                    }
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Avg response time */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Temps de réponse moyen</p>
                  <p className={`text-lg font-bold ${cfg.avgResponseMs > 0 ? durationColor(cfg.avgResponseMs) : 'text-gray-400'}`}>
                    {cfg.avgResponseMs > 0 ? fmtMs(cfg.avgResponseMs) : '—'}
                  </p>
                </div>

                {/* Success rate */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Taux de succès</p>
                  <p className={`text-lg font-bold ${successRate === null ? 'text-gray-400' : successRate >= 90 ? 'text-emerald-600' : successRate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                    {successRate !== null ? `${successRate}%` : '—'}
                  </p>
                  {cfg.totalCalls > 0 && <p className="text-[10px] text-gray-400">{cfg.successCalls}/{cfg.totalCalls} appels</p>}
                </div>

                {/* Last test */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Dernier test</p>
                  {cfg.lastTestedAt ? (
                    <>
                      <p className="text-xs font-semibold text-gray-700">
                        {new Date(cfg.lastTestedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      {cfg.lastTestMs > 0 && <p className={`text-[10px] font-bold ${durationColor(cfg.lastTestMs)}`}>{fmtMs(cfg.lastTestMs)}</p>}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">Jamais testé</p>
                  )}
                  {live && (
                    <p className={`text-xs font-bold mt-1 ${live.testStatus === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {live.testStatus === 'ok' ? `✓ OK — ${fmtMs(live.durationMs)}` : `✗ Échec — ${live.durationMs}ms`}
                    </p>
                  )}
                </div>

                {/* B2C visibility */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Visible B2C</p>
                  <button
                    onClick={() => updateConfig(cfg.supplierId, { b2cVisible: !cfg.b2cVisible })}
                    className="flex items-center gap-1.5 text-xs font-semibold mt-1"
                  >
                    {cfg.b2cVisible
                      ? <><Globe size={14} className="text-blue-500" /><span className="text-blue-700">Affiché aux clients</span></>
                      : <><Globe size={14} className="text-gray-400" /><span className="text-gray-500">Masqué B2C</span></>
                    }
                  </button>
                </div>
              </div>

              {/* Card actions */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex items-center gap-3 flex-wrap">
                {/* Test connection */}
                <button
                  onClick={() => testConnection(cfg.supplierId)}
                  disabled={testing[cfg.supplierId]}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-primary-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  {testing[cfg.supplierId]
                    ? <><RefreshCw size={12} className="animate-spin" />Test en cours...</>
                    : <><Activity size={12} />Tester la connexion</>
                  }
                </button>

                {/* Edit credentials */}
                <button
                  onClick={() => setEditModal(cfg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-primary-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Edit3 size={12} />Modifier les identifiants
                </button>

                {/* View all logs */}
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-primary-700 hover:text-primary-900 text-xs font-semibold transition-colors ml-auto"
                >
                  Voir les logs <ExternalLink size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent API logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-gray-500" />
              <p className="text-sm font-bold text-gray-900">Logs récents</p>
            </div>
            <p className="text-xs text-gray-400">20 derniers appels API</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Fournisseur', 'Endpoint', 'Durée', 'Statut', 'Réservation', 'Date'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-bold text-gray-800">{log.supplier}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-mono text-gray-600">{log.endpoint}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-bold ${durationColor(log.durationMs)}`}>{fmtMs(log.durationMs)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {log.success
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle size={10} />OK</span>
                        : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"><XCircle size={10} />Échec</span>
                      }
                    </td>
                    <td className="px-4 py-2.5">
                      {log.bookingId
                        ? <a href={`/admin/bookings/${log.bookingId}`} className="text-xs font-mono text-primary-700 hover:underline">
                            {String(log.bookingId).slice(-8)}
                          </a>
                        : <span className="text-xs text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Credential edit modal */}
      {editModal && (
        <CredentialModal
          config={editModal}
          onSave={async (update) => {
            await updateConfig(editModal.supplierId, update);
            setEditModal(null);
          }}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
};

export default SupplierManager;
