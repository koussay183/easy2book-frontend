import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Calendar, DollarSign, Users, BarChart3, Hotel, CreditCard, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

const authHdr = () => ({ Authorization: `Bearer ${localStorage.getItem('adminToken')}` });

const statusLabels  = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée', completed: 'Terminée' };
const statusColors  = { pending: 'bg-amber-500', confirmed: 'bg-emerald-500', cancelled: 'bg-red-500', completed: 'bg-primary-600' };
const statusTextCls = { pending: 'text-amber-700 bg-amber-50 border-amber-200', confirmed: 'text-emerald-700 bg-emerald-50 border-emerald-200', cancelled: 'text-red-700 bg-red-50 border-red-200', completed: 'text-primary-700 bg-primary-50 border-primary-200' };
const methodLabels  = { online: 'En ligne', agency: 'Agence', wafacash: 'Wafacash', izi: 'Izi', cash: 'Espèces' };

const StatBox = ({ icon: Icon, label, value, sub, accent = 'bg-primary-600' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

/* Simple CSS bar chart */
const BarRow = ({ label, value, max, color = 'bg-primary-500', suffix = '' }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      <p className="text-xs font-bold text-gray-900">{value}{suffix}</p>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: max > 0 ? `${Math.max(2, (value / max) * 100)}%` : '2%' }}
      />
    </div>
  </div>
);

const Rapports = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.REPORTS_OVERVIEW, { headers: authHdr() });
      const json = await res.json();
      if (json.status === 'success') setData(json.data);
      else setError(json.message || 'Erreur de chargement');
    } catch {
      setError('Erreur réseau');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw size={28} className="animate-spin text-primary-700" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <AlertCircle size={32} className="text-red-400" />
      <p className="text-sm font-semibold text-gray-700">{error}</p>
      <button onClick={loadData}
        className="px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors">
        Réessayer
      </button>
    </div>
  );

  const totalStatusMax = Math.max(...(data.statusAgg || []).map(s => s.count), 1);
  const monthlyMax     = Math.max(...(data.monthlyAgg || []).map(m => m.revenue), 1);
  const methodMax      = Math.max(...(data.methodAgg || []).map(m => m.count), 1);

  const monthName = (ym) => {
    const [y, m] = ym.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="ltr">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Rapports</h2>
          <p className="text-sm text-gray-500 mt-0.5">Analyse des réservations et des revenus</p>
        </div>
        <button onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors">
          <RefreshCw size={13} />Actualiser
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon={BarChart3}   label="Réservations totales"  value={data.totalCount}                          sub="Toutes périodes"             accent="bg-primary-600" />
        <StatBox icon={Calendar}    label="Ce mois"               value={data.monthCount}                          sub="Nouvelles réservations"      accent="bg-sky-500"     />
        <StatBox icon={DollarSign}  label="Revenu total"          value={`${data.totalRevenue.toFixed(0)} TND`}   sub="Toutes périodes"             accent="bg-emerald-600" />
        <StatBox icon={TrendingUp}  label="Revenu ce mois"        value={`${(data.monthRevenue || 0).toFixed(0)} TND`} sub="Mois en cours"           accent="bg-amber-500"   />
      </div>

      {/* 2-col section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Status distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-primary-600" />
            <p className="text-sm font-bold text-gray-900">Réservations par statut</p>
          </div>
          {data.statusAgg.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {data.statusAgg.map(s => (
                <div key={s._id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusTextCls[s._id] || 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                      {statusLabels[s._id] || s._id}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{s.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusColors[s._id] || 'bg-gray-400'}`}
                      style={{ width: `${Math.max(2, (s.count / totalStatusMax) * 100)}%` }}
                    />
                  </div>
                  {s.revenue > 0 && (
                    <p className="text-[10px] text-gray-400">{s.revenue.toFixed(0)} TND de revenu</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={15} className="text-emerald-600" />
            <p className="text-sm font-bold text-gray-900">Méthodes de paiement</p>
          </div>
          {data.methodAgg.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {data.methodAgg.map(m => (
                <BarRow
                  key={m._id}
                  label={methodLabels[m._id] || m._id || 'Non défini'}
                  value={m.count}
                  max={methodMax}
                  color="bg-emerald-500"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly revenue chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={15} className="text-primary-600" />
          <p className="text-sm font-bold text-gray-900">Revenus mensuels — 6 derniers mois</p>
        </div>
        {data.monthlyAgg.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {data.monthlyAgg.map(m => {
              const heightPct = monthlyMax > 0 ? Math.max(4, (m.revenue / monthlyMax) * 100) : 4;
              return (
                <div key={m._id} className="flex-1 flex flex-col items-center gap-1.5">
                  <p className="text-[10px] font-bold text-gray-600">{m.revenue > 0 ? `${(m.revenue / 1000).toFixed(1)}k` : ''}</p>
                  <div className="w-full relative flex items-end" style={{ height: '88px' }}>
                    <div
                      className="w-full bg-primary-500 hover:bg-primary-600 rounded-t-md transition-colors cursor-default"
                      style={{ height: `${heightPct}%` }}
                      title={`${m.revenue.toFixed(0)} TND — ${m.count} rés.`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 whitespace-nowrap">{monthName(m._id)}</p>
                  <p className="text-[10px] text-gray-400">{m.count} rés.</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top hotels */}
      {data.topHotels.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <Hotel size={15} className="text-gray-500" />
            <p className="text-sm font-bold text-gray-900">Hôtels les plus réservés</p>
          </div>
          <div className="divide-y divide-gray-50">
            {data.topHotels.map((h, i) => (
              <div key={h._id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}.</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Hôtel #{h._id}</p>
                    <p className="text-xs text-gray-400">{h.count} réservation{h.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-primary-700">{h.revenue.toFixed(0)} TND</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Rapports;
