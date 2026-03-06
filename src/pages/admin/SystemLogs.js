import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal, RefreshCw, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  AlertCircle, ExternalLink, Filter
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const fmtMs = (ms) => ms >= 1000 ? `${(ms/1000).toFixed(2)}s` : `${ms}ms`;

const durationBadge = (ms) => {
  if (ms > 3000) return 'bg-red-100 text-red-700 border-red-200';
  if (ms > 1000) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

const SUPPLIERS = ['', 'mygo', 'dts', 'gts'];

const SystemLogs = () => {
  const [logs,       setLogs]       = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading,    setLoading]    = useState(true);
  const [filter, setFilter] = useState({ supplier: '', success: '' });
  const [applied, setApplied] = useState({ supplier: '', success: '' });

  const load = useCallback(async (page = 1, f = applied) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), perPage: '50' });
      if (f.supplier) params.set('supplier', f.supplier);
      if (f.success !== '') params.set('success', f.success);

      const res  = await fetch(`${API_ENDPOINTS.SUPPLIER_CONFIG_LOGS}?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.status === 'success') {
        setLogs(data.data.logs || []);
        setPagination({ page: data.data.page, pages: data.data.pages, total: data.data.total });
      }
    } catch { /* ignore */ }
    finally  { setLoading(false); }
  }, [applied]);

  useEffect(() => { load(1, applied); }, []); // eslint-disable-line

  const handleSearch = () => {
    setApplied(filter);
    load(1, filter);
  };

  const handleReset = () => {
    const empty = { supplier: '', success: '' };
    setFilter(empty);
    setApplied(empty);
    load(1, empty);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto" dir="ltr">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Terminal size={18} className="text-primary-700" />
            Logs API
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Historique des appels API vers les fournisseurs</p>
        </div>
        <button onClick={() => load(pagination.page)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-xs font-medium transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Fournisseur</label>
          <select
            value={filter.supplier}
            onChange={e => setFilter(f => ({ ...f, supplier: e.target.value }))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-400 bg-white"
          >
            <option value="">Tous</option>
            {SUPPLIERS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Statut</label>
          <select
            value={filter.success}
            onChange={e => setFilter(f => ({ ...f, success: e.target.value }))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-400 bg-white"
          >
            <option value="">Tous</option>
            <option value="true">Succès</option>
            <option value="false">Échec</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-xs font-semibold transition-colors">
            <Filter size={12} />Filtrer
          </button>
          <button onClick={handleReset}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold transition-colors">
            Réinitialiser
          </button>
        </div>
        <p className="text-xs text-gray-400 ml-auto self-end">
          {loading ? 'Chargement...' : `${pagination.total} entrées`}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={24} className="animate-spin text-primary-700" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucun log trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Fournisseur', 'Endpoint', 'Durée', 'HTTP', 'Statut', 'Réservation', 'Erreur', 'Date'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-gray-800 uppercase">{log.supplier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-700">{log.endpoint}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${durationBadge(log.durationMs)}`}>
                        {fmtMs(log.durationMs)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-bold ${log.httpStatus >= 400 ? 'text-red-600' : 'text-gray-600'}`}>
                        {log.httpStatus || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.success
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle size={9} />OK
                          </span>
                        : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            <XCircle size={9} />Fail
                          </span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {log.bookingId
                        ? <a href={`/admin/bookings/${log.bookingId}`}
                            className="text-xs font-mono text-primary-700 hover:underline flex items-center gap-1">
                            {String(log.bookingId).slice(-8)}<ExternalLink size={10} />
                          </a>
                        : <span className="text-xs text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      {log.error
                        ? <p className="text-[10px] text-red-600 truncate" title={log.error}>{log.error}</p>
                        : <span className="text-xs text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && !loading && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => load(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:border-gray-300 transition-colors"
            >
              <ChevronLeft size={14} />Précédent
            </button>
            <p className="text-xs text-gray-500">
              Page <strong>{pagination.page}</strong> / {pagination.pages}
            </p>
            <button
              onClick={() => load(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:border-gray-300 transition-colors"
            >
              Suivant<ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
