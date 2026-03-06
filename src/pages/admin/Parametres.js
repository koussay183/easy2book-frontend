import React, { useState, useCallback, useEffect } from 'react';
import {
  Settings2, Puzzle, Trash2, AlertTriangle, RefreshCw,
  CheckCircle, XCircle, Eye, EyeOff, Save, Check, AlertCircle,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

const token = () => localStorage.getItem('adminToken');
const authHdr = () => ({ Authorization: `Bearer ${token()}` });
const jsonHdr = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

/* ─── Section wrapper ─── */
const Section = ({ icon: Icon, title, desc, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-gray-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/* ─── TripAdvisor integration ─── */
const TripAdvisorSection = () => {
  const [apiKey,   setApiKey]   = useState('');
  const [enabled,  setEnabled]  = useState(false);
  const [showKey,  setShowKey]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_SETTINGS, { headers: authHdr() });
      const data = await res.json();
      if (data.status === 'success' && data.data?.tripadvisor) {
        setApiKey(data.data.tripadvisor.apiKey || '');
        setEnabled(data.data.tripadvisor.enabled ?? false);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_SETTINGS, {
        method: 'PUT', headers: { ...jsonHdr(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripadvisor: { apiKey, enabled } }),
      });
      const data = await res.json();
      if (data.status === 'success') { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(data.message || 'Erreur de sauvegarde');
    } catch { setError('Erreur réseau'); }
    finally { setSaving(false); }
  };

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next); setError('');
    try {
      await fetch(API_ENDPOINTS.ADMIN_SETTINGS, {
        method: 'PUT', headers: { ...jsonHdr(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripadvisor: { apiKey, enabled: next } }),
      });
    } catch { setEnabled(!next); }
  };

  if (loading) return <div className="flex justify-center py-6"><RefreshCw size={18} className="animate-spin text-primary-700" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">TripAdvisor Content API</p>
          <p className="text-xs text-gray-500 mt-0.5">Avis et photos sur les fiches hôtels</p>
        </div>
        <button onClick={toggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            enabled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}>
          {enabled ? <><ToggleRight size={15} className="text-emerald-600" />Activé</> : <><ToggleLeft size={15} className="text-gray-400" />Désactivé</>}
        </button>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Clé API TripAdvisor</label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Votre clé API..."
            className="w-full pr-10 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 font-mono"
          />
          <button type="button" onClick={() => setShowKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
          <AlertCircle size={13} />{error}
        </div>
      )}
      <div className="flex items-center justify-end gap-3">
        {saved && <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium"><Check size={14} />Enregistré</span>}
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:bg-gray-200 disabled:text-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          {saving ? <><RefreshCw size={13} className="animate-spin" />Sauvegarde...</> : <><Save size={13} />Enregistrer</>}
        </button>
      </div>
    </div>
  );
};

/* ─── Danger: reset bookings ─── */
const DangerZone = () => {
  const [step,      setStep]     = useState('idle'); // idle | confirm | typing | deleting | done | error
  const [password,  setPassword] = useState('');
  const [showPw,    setShowPw]   = useState(false);
  const [result,    setResult]   = useState(null);
  const [errMsg,    setErrMsg]   = useState('');

  const handleDelete = async () => {
    if (!password) return;
    setStep('deleting');
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_DATA_RESET, {
        method: 'DELETE',
        headers: { ...jsonHdr(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResult(data.data);
        setStep('done');
      } else {
        setErrMsg(data.message || 'Erreur');
        setStep('error');
      }
    } catch {
      setErrMsg('Erreur réseau');
      setStep('error');
    }
  };

  const reset = () => { setStep('idle'); setPassword(''); setResult(null); setErrMsg(''); };

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-800">Zone de danger — action irréversible</p>
          <p className="text-xs text-red-700 mt-0.5">
            Supprimer toutes les réservations et les logs associés de la base de données. Cette action ne peut pas être annulée.
          </p>
        </div>
      </div>

      {step === 'idle' && (
        <button onClick={() => setStep('confirm')}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors">
          <Trash2 size={14} />Supprimer toutes les réservations
        </button>
      )}

      {step === 'confirm' && (
        <div className="bg-white border border-red-300 rounded-xl p-4 space-y-4">
          <p className="text-sm font-bold text-gray-900">Confirmez votre identité</p>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mot de passe administrateur</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe..."
                className="w-full pr-10 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-red-400"
                onKeyDown={e => e.key === 'Enter' && password && handleDelete()}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={reset}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors">
              Annuler
            </button>
            <button onClick={handleDelete} disabled={!password}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <Trash2 size={14} />Supprimer définitivement
            </button>
          </div>
        </div>
      )}

      {step === 'deleting' && (
        <div className="flex items-center gap-3 text-sm text-gray-600 py-2">
          <RefreshCw size={16} className="animate-spin text-red-500" />Suppression en cours...
        </div>
      )}

      {step === 'done' && result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-emerald-600" />
            <p className="text-sm font-bold text-emerald-900">Données supprimées</p>
          </div>
          <p className="text-xs text-emerald-800">
            {result.bookingsDeleted} réservation{result.bookingsDeleted !== 1 ? 's' : ''} supprimée{result.bookingsDeleted !== 1 ? 's' : ''}, {result.logsDeleted} log{result.logsDeleted !== 1 ? 's' : ''} supprimé{result.logsDeleted !== 1 ? 's' : ''}
          </p>
          <button onClick={reset} className="mt-3 text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline">Fermer</button>
        </div>
      )}

      {step === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={15} className="text-red-600" />
            <p className="text-sm font-bold text-red-900">Erreur</p>
          </div>
          <p className="text-xs text-red-700">{errMsg}</p>
          <button onClick={() => setStep('confirm')} className="mt-3 text-xs text-red-700 hover:text-red-900 font-semibold underline">Réessayer</button>
        </div>
      )}
    </div>
  );
};

/* ── Main ── */
const Parametres = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto" dir="ltr">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Paramètres</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configuration générale de la plateforme</p>
      </div>

      <Section icon={Puzzle} title="Intégrations tierces" desc="Services externes connectés à la plateforme">
        <TripAdvisorSection />
      </Section>

      <Section icon={Trash2} title="Gestion des données" desc="Actions irréversibles sur les données de la plateforme">
        <DangerZone />
      </Section>
    </div>
  );
};

export default Parametres;
