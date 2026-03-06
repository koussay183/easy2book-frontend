import React, { useState, useEffect, useCallback } from 'react';
import {
  Plug, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle,
  Edit3, X, Eye, EyeOff, ChevronUp, ChevronDown,
  Activity, Star, Shield, ToggleLeft, ToggleRight
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

const authHdr = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const testBadge = (s) =>
  s === 'ok'     ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
  s === 'failed' ? 'bg-red-100 text-red-800 border-red-300' :
                   'bg-gray-100 text-gray-600 border-gray-300';

const testIcon = (s) =>
  s === 'ok'     ? <CheckCircle size={11} /> :
  s === 'failed' ? <XCircle size={11} /> :
                   <Clock size={11} />;

const testLabel = (s) =>
  s === 'ok' ? 'Connecté' : s === 'failed' ? 'Erreur' : 'Non testé';

const fmtMs = (ms) => ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;

const durCls = (ms) =>
  ms > 3000 ? 'text-red-600 font-bold' :
  ms > 1000 ? 'text-amber-600 font-semibold' :
              'text-emerald-700 font-semibold';

/* ── Credential Modal ── */
const CredentialModal = ({ config, onSave, onClose }) => {
  const [form, setForm]     = useState({
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary-700" />
            <p className="text-sm font-bold text-gray-900">Identifiants — {config.label}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'apiUrl',   label: "URL de l'API",       type: 'text',     placeholder: 'https://api.supplier.com/', mono: true },
            { key: 'login',    label: 'Identifiant (Login)', type: 'text',     placeholder: '' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 ${f.mono ? 'font-mono' : ''}`}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-primary-400"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 leading-relaxed">
            Les identifiants sont stockés en base de données. Ils ne remplacent pas les variables d'environnement du serveur.
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:bg-primary-300 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {saving && <RefreshCw size={13} className="animate-spin" />}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main ── */
const SupplierManager = () => {
  const [configs,      setConfigs]     = useState([]);
  const [logs,         setLogs]        = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [testing,      setTesting]     = useState({});
  const [testResult,   setTestResult]  = useState({});
  const [saving,       setSaving]      = useState({});
  const [settingPrim,  setSettingPrim] = useState({});
  const [editModal,    setEditModal]   = useState(null);

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(API_ENDPOINTS.SUPPLIER_CONFIGS, { headers: authHdr() });
      const data = await res.json();
      if (data.status === 'success') setConfigs(data.data.sort((a, b) => a.priority - b.priority));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const res  = await fetch(`${API_ENDPOINTS.SUPPLIER_CONFIG_LOGS}?perPage=20`, { headers: authHdr() });
      const data = await res.json();
      if (data.status === 'success') setLogs(data.data.logs || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadConfigs(); loadLogs(); }, [loadConfigs, loadLogs]);

  const updateConfig = async (supplierId, update) => {
    setSaving(s => ({ ...s, [supplierId]: true }));
    try {
      const res  = await fetch(API_ENDPOINTS.SUPPLIER_CONFIG_UPDATE(supplierId), {
        method: 'PUT', headers: authHdr(), body: JSON.stringify(update),
      });
      const data = await res.json();
      if (data.status === 'success')
        setConfigs(prev => prev.map(c => c.supplierId === supplierId ? data.data : c));
    } catch { /* silent */ }
    finally { setSaving(s => ({ ...s, [supplierId]: false })); }
  };

  const setPrimarySupplier = async (supplierId) => {
    setSettingPrim(s => ({ ...s, [supplierId]: true }));
    try {
      const res  = await fetch(API_ENDPOINTS.SUPPLIER_CONFIG_SET_PRIMARY(supplierId), {
        method: 'POST', headers: authHdr(),
      });
      const data = await res.json();
      if (data.status === 'success') await loadConfigs();
    } catch { /* silent */ }
    finally { setSettingPrim(s => ({ ...s, [supplierId]: false })); }
  };

  const testConnection = async (supplierId) => {
    setTesting(s => ({ ...s, [supplierId]: true }));
    setTestResult(s => ({ ...s, [supplierId]: null }));
    try {
      const res  = await fetch(API_ENDPOINTS.SUPPLIER_CONFIG_TEST(supplierId), {
        method: 'POST', headers: authHdr(),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTestResult(s => ({ ...s, [supplierId]: data.data }));
        setConfigs(prev => prev.map(c =>
          c.supplierId === supplierId
            ? { ...c, lastTestStatus: data.data.testStatus, lastTestMs: data.data.durationMs, lastTestedAt: new Date().toISOString() }
            : c
        ));
        loadLogs();
      }
    } catch { /* silent */ }
    finally { setTesting(s => ({ ...s, [supplierId]: false })); }
  };

  const changePriority = async (supplierId, delta) => {
    const cfg = configs.find(c => c.supplierId === supplierId);
    if (!cfg) return;
    await updateConfig(supplierId, { priority: Math.max(1, cfg.priority + delta) });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw size={28} className="animate-spin text-primary-700" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="ltr">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestion des Fournisseurs</h2>
          <p className="text-sm text-gray-500 mt-0.5">Activez, configurez et priorisez les intégrations fournisseurs.</p>
        </div>
        <button onClick={() => { loadConfigs(); loadLogs(); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors">
          <RefreshCw size={13} />Actualiser
        </button>
      </div>

      {/* Supplier cards */}
      <div className="space-y-4">
        {configs.map(cfg => {
          const succRate = cfg.totalCalls > 0
            ? Math.round((cfg.successCalls / cfg.totalCalls) * 100)
            : null;
          const live = testResult[cfg.supplierId];
          const isDisabled = !cfg.enabled;

          return (
            <div key={cfg.supplierId}
              className={`rounded-2xl border-2 transition-all ${
                isDisabled
                  ? 'border-gray-200 bg-gray-50/60'
                  : cfg.isPrimary
                    ? 'border-primary-300 bg-white shadow-sm'
                    : 'border-emerald-200 bg-white'
              }`}>

              {/* Header */}
              <div className={`flex items-center justify-between px-5 py-4 border-b ${isDisabled ? 'border-gray-200' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isDisabled ? 'bg-gray-100' : cfg.isPrimary ? 'bg-primary-100' : 'bg-emerald-50'
                  }`}>
                    <Plug size={18} className={isDisabled ? 'text-gray-400' : cfg.isPrimary ? 'text-primary-700' : 'text-emerald-700'} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-bold ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>{cfg.label}</p>
                      {cfg.isPrimary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-800 border border-primary-300 rounded-full text-[10px] font-bold">
                          <Star size={9} className="fill-primary-600 text-primary-600" />Source B2C
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${testBadge(cfg.lastTestStatus)}`}>
                        {testIcon(cfg.lastTestStatus)}{testLabel(cfg.lastTestStatus)}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>{cfg.description || cfg.supplierId}</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                  {/* Priority */}
                  <div className="flex flex-col items-center">
                    <button onClick={() => changePriority(cfg.supplierId, -1)}
                      className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors"><ChevronUp size={14} /></button>
                    <span className="text-xs font-bold text-gray-700 w-5 text-center">{cfg.priority}</span>
                    <button onClick={() => changePriority(cfg.supplierId, 1)}
                      className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors"><ChevronDown size={14} /></button>
                  </div>

                  {/* Enable toggle */}
                  <button
                    onClick={() => updateConfig(cfg.supplierId, { enabled: !cfg.enabled })}
                    disabled={saving[cfg.supplierId]}
                    className="flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {cfg.enabled
                      ? <><ToggleRight size={24} className="text-emerald-500" /><span className="text-emerald-700">Actif</span></>
                      : <><ToggleLeft  size={24} className="text-gray-300"    /><span className="text-gray-500">Inactif</span></>
                    }
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Réponse moy.</p>
                  <p className={`text-lg font-bold ${cfg.avgResponseMs > 0 ? durCls(cfg.avgResponseMs) : 'text-gray-400'}`}>
                    {cfg.avgResponseMs > 0 ? fmtMs(cfg.avgResponseMs) : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Taux succès</p>
                  <p className={`text-lg font-bold ${
                    succRate === null ? 'text-gray-400' :
                    succRate >= 90   ? 'text-emerald-700' :
                    succRate >= 70   ? 'text-amber-600' : 'text-red-600'
                  }`}>{succRate !== null ? `${succRate}%` : '—'}</p>
                  {cfg.totalCalls > 0 && (
                    <p className="text-[10px] text-gray-400">{cfg.successCalls}/{cfg.totalCalls} appels</p>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Dernier test</p>
                  {cfg.lastTestedAt ? (
                    <>
                      <p className="text-xs font-semibold text-gray-800">
                        {new Date(cfg.lastTestedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      {cfg.lastTestMs > 0 && (
                        <p className={`text-[10px] font-bold ${durCls(cfg.lastTestMs)}`}>{fmtMs(cfg.lastTestMs)}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">Jamais testé</p>
                  )}
                  {live && (
                    <p className={`text-xs font-bold mt-1 ${live.testStatus === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {live.testStatus === 'ok' ? `✓ OK — ${fmtMs(live.durationMs)}` : `✗ Échec`}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Source B2C</p>
                  {cfg.isPrimary ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-700">
                      <Star size={12} className="fill-primary-600 text-primary-600" />Source active
                    </span>
                  ) : (
                    <button
                      onClick={() => setPrimarySupplier(cfg.supplierId)}
                      disabled={settingPrim[cfg.supplierId]}
                      className="text-xs text-gray-500 hover:text-primary-700 font-semibold transition-colors disabled:opacity-50 text-left"
                    >
                      {settingPrim[cfg.supplierId]
                        ? <><RefreshCw size={10} className="inline animate-spin mr-1" />En cours...</>
                        : 'Définir comme source'
                      }
                    </button>
                  )}
                </div>
              </div>

              {/* Actions footer */}
              <div className={`px-5 py-3 border-t rounded-b-2xl flex items-center gap-3 flex-wrap ${isDisabled ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50'}`}>
                <button
                  onClick={() => testConnection(cfg.supplierId)}
                  disabled={testing[cfg.supplierId]}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-primary-300 hover:text-primary-700 text-gray-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  {testing[cfg.supplierId]
                    ? <><RefreshCw size={12} className="animate-spin" />Test en cours...</>
                    : <><Activity size={12} />Tester la connexion</>
                  }
                </button>
                <button
                  onClick={() => setEditModal(cfg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-primary-300 hover:text-primary-700 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Edit3 size={12} />Identifiants
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
            <p className="text-xs text-gray-400">20 derniers appels</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {['Fournisseur', 'Endpoint', 'Durée', 'Statut', 'Date'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log, i) => (
                  <tr key={log._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5"><span className="text-xs font-bold text-gray-900 uppercase">{log.supplier}</span></td>
                    <td className="px-4 py-2.5"><span className="text-xs font-mono text-gray-600">{log.endpoint}</span></td>
                    <td className="px-4 py-2.5"><span className={`text-xs font-bold ${durCls(log.durationMs)}`}>{fmtMs(log.durationMs)}</span></td>
                    <td className="px-4 py-2.5">
                      {log.success
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle size={9} />OK</span>
                        : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"><XCircle size={9} />Échec</span>
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

      {editModal && (
        <CredentialModal
          config={editModal}
          onSave={async (update) => { await updateConfig(editModal.supplierId, update); setEditModal(null); }}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
};

export default SupplierManager;
