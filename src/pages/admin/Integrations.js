import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Save, CheckCircle2, AlertCircle,
  Eye, EyeOff, ToggleLeft, ToggleRight, Check, Puzzle
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

const token = () => localStorage.getItem('adminToken');

const Integrations = () => {
  const [taApiKey,     setTaApiKey]     = useState('');
  const [taEnabled,    setTaEnabled]    = useState(false);
  const [taSaving,     setTaSaving]     = useState(false);
  const [taSaved,      setTaSaved]      = useState(false);
  const [taError,      setTaError]      = useState('');
  const [taKeyVisible, setTaKeyVisible] = useState(false);
  const [loading,      setLoading]      = useState(true);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_SETTINGS, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.status === 'success' && data.data?.tripadvisor) {
        setTaApiKey(data.data.tripadvisor.apiKey || '');
        setTaEnabled(data.data.tripadvisor.enabled ?? false);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSaveTA = async () => {
    setTaSaving(true); setTaError(''); setTaSaved(false);
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_SETTINGS, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ tripadvisor: { apiKey: taApiKey, enabled: taEnabled } }),
      });
      const data = await res.json();
      if (data.status === 'success') { setTaSaved(true); setTimeout(() => setTaSaved(false), 3000); }
      else setTaError(data.message || 'Erreur de sauvegarde');
    } catch { setTaError('Erreur réseau'); } finally { setTaSaving(false); }
  };

  const toggleTAEnabled = async () => {
    const next = !taEnabled;
    setTaEnabled(next); setTaError('');
    try {
      const res  = await fetch(API_ENDPOINTS.ADMIN_SETTINGS, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ tripadvisor: { apiKey: taApiKey, enabled: next } }),
      });
      const data = await res.json();
      if (data.status === 'success') { setTaSaved(true); setTimeout(() => setTaSaved(false), 2000); }
      else { setTaEnabled(!next); setTaError(data.message || 'Erreur de sauvegarde'); }
    } catch { setTaEnabled(!next); setTaError('Erreur réseau'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <RefreshCw size={20} className="animate-spin text-primary-700" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
          <Puzzle size={18} className="text-primary-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Intégrations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configurez des services tiers pour enrichir les fiches hôtels.</p>
        </div>
      </div>

      {/* TripAdvisor card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#34E0A1"/>
                <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial,sans-serif">TA</text>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">TripAdvisor Content API</p>
              <p className="text-xs text-gray-400">Notes, avis & photos depuis TripAdvisor</p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTAEnabled}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              taEnabled
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            {taEnabled
              ? <><ToggleRight size={16} className="text-green-600" /> Activé</>
              : <><ToggleLeft  size={16} className="text-gray-400"  /> Désactivé</>
            }
          </button>
        </div>

        {/* Card body */}
        <div className="px-6 py-5 space-y-4">

          {/* Status indicator */}
          <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
            taEnabled
              ? 'bg-green-50 border border-green-100 text-green-700'
              : 'bg-gray-50 border border-gray-100 text-gray-500'
          }`}>
            {taEnabled
              ? <><CheckCircle2 size={14} className="text-green-600 flex-shrink-0" /> TripAdvisor est activé — les notes et avis seront affichés sur les fiches hôtels.</>
              : <><AlertCircle  size={14} className="text-gray-400  flex-shrink-0" /> TripAdvisor est désactivé. Activez-le et enregistrez pour afficher les données sur le site.</>
            }
          </div>

          {/* API key input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Clé API TripAdvisor Content API
            </label>
            <div className="relative">
              <input
                type={taKeyVisible ? 'text' : 'password'}
                value={taApiKey}
                onChange={e => setTaApiKey(e.target.value)}
                placeholder="Votre clé API TripAdvisor…"
                className="w-full pr-10 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setTaKeyVisible(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {taKeyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Obtenez votre clé sur{' '}
              <span className="text-primary-600 font-medium">developers.tripadvisor.com</span>
            </p>
          </div>

          {/* What it shows */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">Ce qui sera affiché :</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              {[
                'Note globale (bulle verte)',
                "Nombre d'avis",
                'Classement local',
                '5 derniers avis',
                '5 photos TripAdvisor',
                'Lien vers la page TA',
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <Check size={11} className="text-green-500 flex-shrink-0" />{item}
                </span>
              ))}
            </div>
          </div>

          {/* Error */}
          {taError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertCircle size={14} /> {taError}
            </div>
          )}

          {/* Save */}
          <div className="flex items-center justify-end gap-3 pt-1">
            {taSaved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 size={14} /> Enregistré
              </span>
            )}
            <button
              onClick={handleSaveTA}
              disabled={taSaving}
              className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:bg-gray-200 disabled:text-gray-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              {taSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {taSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
