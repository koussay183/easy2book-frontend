import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, CheckCircle2,
  Clock, Users, Tag, X, Save, AlertCircle, RefreshCw,
  Calendar, MapPin, Star, ListOrdered, Image, Search,
  Plane, DollarSign, ChevronRight
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const CATEGORY_LABELS = { umrah: 'Omra', umrah_plus: 'Omra Plus' };
const CATEGORY_STYLES = {
  umrah:      'bg-emerald-100 text-emerald-700 border-emerald-200',
  umrah_plus: 'bg-purple-100 text-purple-700 border-purple-200'
};
const STATUS_STYLES = {
  pending:   'bg-amber-100  text-amber-700  border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100    text-red-600    border-red-200'
};
const STATUS_LABELS = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' };

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDT = (d) =>
  d ? new Date(d).toLocaleString('fr-TN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const adminFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      ...(options.headers || {})
    }
  });

// ─────────────────────────────────────────────────────────────
// Small reusable atoms
// ─────────────────────────────────────────────────────────────
const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${className}`}>
    {children}
  </span>
);

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">{value ?? '—'}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border ${
      type === 'success'
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// TagInput
// ─────────────────────────────────────────────────────────────
const TagInput = ({ label, items, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setInput('');
  };
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button type="button" onClick={add}
          className="px-3 py-2 bg-primary-700 text-white rounded-lg text-sm hover:bg-primary-800 transition-colors">
          <Plus size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
            {item}
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="hover:text-red-500 transition-colors ml-0.5">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Offer Form Modal
// ─────────────────────────────────────────────────────────────
const BLANK_OFFER = {
  title: '', category: 'umrah', description: '', imageUrl: '',
  price: '', duration: '', departureDate: '', returnDate: '',
  departureCity: 'Tunis', capacity: 30,
  includes: [], excludes: [], highlights: [], plan: [],
  isActive: true, isFeatured: false
};

const FORM_SECTIONS = ['Informations', 'Médias & Prix', 'Détails', 'Programme'];

const OfferModal = ({ offer, onClose, onSaved }) => {
  const isEdit = Boolean(offer?._id);
  const [section, setSection] = useState(0);
  const [form, setForm] = useState(() => {
    if (!offer) return { ...BLANK_OFFER };
    return {
      ...offer,
      departureDate: offer.departureDate ? offer.departureDate.split('T')[0] : '',
      returnDate:    offer.returnDate    ? offer.returnDate.split('T')[0]    : '',
      plan:       offer.plan       || [],
      includes:   offer.includes   || [],
      excludes:   offer.excludes   || [],
      highlights: offer.highlights || []
    };
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const addPlanDay = () =>
    set('plan', [...form.plan, { day: form.plan.length + 1, title: '', description: '' }]);
  const updatePlanDay = (idx, field, val) =>
    set('plan', form.plan.map((d, i) => i === idx ? { ...d, [field]: val } : d));
  const removePlanDay = (idx) =>
    set('plan', form.plan.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.duration || !form.departureDate || !form.returnDate) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setSection(0);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url    = isEdit ? API_ENDPOINTS.OMRA_ADMIN_OFFER(offer._id) : API_ENDPOINTS.OMRA_ADMIN_OFFERS;
      const method = isEdit ? 'PATCH' : 'POST';
      const res    = await adminFetch(url, {
        method,
        body: JSON.stringify({ ...form, price: Number(form.price), duration: Number(form.duration), capacity: Number(form.capacity) })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        onSaved(data.data, isEdit);
      } else {
        setError(data.message || 'Erreur lors de la sauvegarde.');
      }
    } catch {
      setError('Erreur de connexion.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white';
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-700 rounded-lg flex items-center justify-center">
              <Plane size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {isEdit ? 'Modifier l\'offre' : 'Nouvelle offre'}
              </h2>
              {isEdit && <p className="text-xs text-gray-400 truncate max-w-[200px]">{offer.title}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-white">
          {FORM_SECTIONS.map((s, i) => (
            <button key={s} onClick={() => setSection(i)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                section === i
                  ? 'border-primary-700 text-primary-700'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* ── Section 0: Informations ── */}
            {section === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Titre <span className="text-red-400 normal-case">*</span></label>
                    <input value={form.title} onChange={(e) => set('title', e.target.value)}
                      placeholder="Ex: Omra Ramadan 2026 — 15 jours" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Catégorie</label>
                    <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                      <option value="umrah">Omra</option>
                      <option value="umrah_plus">Omra Plus</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description <span className="text-red-400 normal-case">*</span></label>
                  <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                    rows={4} placeholder="Description complète de l'offre..."
                    className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Date de départ <span className="text-red-400 normal-case">*</span></label>
                    <input type="date" value={form.departureDate} onChange={(e) => set('departureDate', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Date de retour <span className="text-red-400 normal-case">*</span></label>
                    <input type="date" value={form.returnDate} onChange={(e) => set('returnDate', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Ville de départ</label>
                    <input value={form.departureCity} onChange={(e) => set('departureCity', e.target.value)}
                      placeholder="Tunis" className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)}
                      className="w-4 h-4 accent-primary-700" />
                    <span className="text-sm text-gray-700">Offre active <span className="text-gray-400">(visible sur le site)</span></span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)}
                      className="w-4 h-4 accent-amber-500" />
                    <span className="text-sm text-gray-700">Mettre en vedette <Star size={13} className="inline text-amber-400 fill-amber-400" /></span>
                  </label>
                </div>
              </div>
            )}

            {/* ── Section 1: Médias & Prix ── */}
            {section === 1 && (
              <div className="space-y-4">
                <div>
                  <label className={`${labelCls} flex items-center gap-1`}><Image size={12} /> URL de l&apos;image</label>
                  <input value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..." className={inputCls} />
                  {form.imageUrl && (
                    <div className="mt-2 h-40 rounded-xl overflow-hidden border border-gray-200">
                      <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Prix (TND) <span className="text-red-400 normal-case">*</span></label>
                    <input type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)}
                      placeholder="2 500" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Durée (jours) <span className="text-red-400 normal-case">*</span></label>
                    <input type="number" min="1" value={form.duration} onChange={(e) => set('duration', e.target.value)}
                      placeholder="15" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Capacité (pers.)</label>
                    <input type="number" min="1" value={form.capacity} onChange={(e) => set('capacity', e.target.value)}
                      className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Section 2: Détails ── */}
            {section === 2 && (
              <div className="space-y-5">
                <TagInput label="Ce qui est inclus" items={form.includes}
                  onChange={(v) => set('includes', v)} placeholder="Ex: Vol aller-retour" />
                <TagInput label="Non inclus" items={form.excludes}
                  onChange={(v) => set('excludes', v)} placeholder="Ex: Frais de visa" />
                <TagInput label="Points forts" items={form.highlights}
                  onChange={(v) => set('highlights', v)} placeholder="Ex: Hôtel 5★ à 200m de la Kaâba" />
              </div>
            )}

            {/* ── Section 3: Programme ── */}
            {section === 3 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <ListOrdered size={16} className="text-primary-700" />
                    Programme jour par jour
                  </div>
                  <button type="button" onClick={addPlanDay}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-semibold border border-primary-200">
                    <Plus size={12} /> Ajouter un jour
                  </button>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {form.plan.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
                      <ListOrdered size={24} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Aucun jour ajouté</p>
                      <button type="button" onClick={addPlanDay}
                        className="mt-3 text-xs text-primary-700 font-semibold hover:underline">
                        Ajouter le jour 1
                      </button>
                    </div>
                  ) : form.plan.map((day, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="w-8 h-8 bg-primary-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                        J{day.day}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input value={day.title} onChange={(e) => updatePlanDay(idx, 'title', e.target.value)}
                          placeholder={`Titre du jour ${day.day}`}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
                        <textarea value={day.description} onChange={(e) => updatePlanDay(idx, 'description', e.target.value)}
                          placeholder="Activités du jour..." rows={2}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-white" />
                      </div>
                      <button type="button" onClick={() => removePlanDay(idx)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-2">
              {FORM_SECTIONS.map((_, i) => (
                <button key={i} type="button" onClick={() => setSection(i)}
                  className={`w-2 h-2 rounded-full transition-all ${section === i ? 'bg-primary-700 w-5' : 'bg-gray-300 hover:bg-gray-400'}`} />
              ))}
            </div>
            <div className="flex gap-3">
              {section > 0 && (
                <button type="button" onClick={() => setSection(s => s - 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                  Précédent
                </button>
              )}
              {section < FORM_SECTIONS.length - 1 ? (
                <button type="button" onClick={() => setSection(s => s + 1)}
                  className="px-5 py-2 bg-primary-700 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 transition-colors flex items-center gap-2">
                  Suivant <ChevronRight size={15} />
                </button>
              ) : (
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-primary-700 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sauvegarde...</>
                  ) : (
                    <><Save size={15} /> {isEdit ? 'Enregistrer' : 'Créer l\'offre'}</>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Reservation Detail Modal
// ─────────────────────────────────────────────────────────────
const ReservationModal = ({ reservation, onClose, onUpdated }) => {
  const [status,    setStatus]    = useState(reservation.status);
  const [adminNote, setAdminNote] = useState(reservation.adminNote || '');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await adminFetch(API_ENDPOINTS.OMRA_ADMIN_RESERVATION_STATUS(reservation._id), {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNote })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        onUpdated(data.data);
      } else {
        setError(data.message || 'Erreur lors de la mise à jour.');
      }
    } catch {
      setError('Erreur de connexion.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Réservation Omra</h2>
            <p className="text-xs font-mono text-primary-700 mt-0.5">{reservation.confirmationCode}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>
          )}

          {/* Client info */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Nom complet',         value: reservation.fullName },
              { label: 'Email',               value: reservation.email },
              { label: 'Téléphone',           value: reservation.phone },
              { label: 'CIN / Passeport',     value: reservation.nationalId },
              { label: 'Nombre de personnes', value: reservation.numberOfPeople },
              { label: 'Date de demande',     value: fmtDT(reservation.createdAt) }
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Offer */}
          {reservation.offer && (
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
              <p className="text-[10px] font-semibold text-primary-600 uppercase tracking-wide mb-1">Offre réservée</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{reservation.offer.title}</p>
                <Badge className={CATEGORY_STYLES[reservation.offer.category]}>
                  {CATEGORY_LABELS[reservation.offer.category]}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><Calendar size={11} />{fmt(reservation.offer.departureDate)}</span>
                <span className="flex items-center gap-1"><DollarSign size={11} />{reservation.offer.price?.toLocaleString()} TND</span>
              </p>
            </div>
          )}

          {/* Message */}
          {reservation.message && (
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
              <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wide mb-1">Message du client</p>
              <p className="text-sm text-gray-700">{reservation.message}</p>
            </div>
          )}

          {/* Status picker */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Statut</p>
            <div className="grid grid-cols-3 gap-2">
              {['pending', 'confirmed', 'cancelled'].map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    status === s
                      ? s === 'confirmed' ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : s === 'cancelled' ? 'border-red-400 bg-red-50 text-red-600'
                        : 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                  }`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Admin note */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Note interne <span className="normal-case font-normal text-gray-400">(optionnel)</span>
            </label>
            <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2}
              placeholder="Note visible uniquement par les admins..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 font-medium transition-colors">
            Fermer
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-primary-700 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={15} />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Delete Confirm Dialog
// ─────────────────────────────────────────────────────────────
const DeleteDialog = ({ target, onCancel, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 size={24} className="text-red-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">Supprimer l&apos;offre ?</h3>
      <p className="text-sm text-gray-500 mb-6">
        <strong className="text-gray-700">{target.title}</strong> sera supprimée définitivement et toutes ses réservations seront impactées.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">
          Annuler
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
          {loading ? 'Suppression...' : 'Supprimer'}
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main OmraManager
// ─────────────────────────────────────────────────────────────
const OmraManager = () => {
  const [tab,              setTab]             = useState('offers');
  const [stats,            setStats]           = useState(null);

  // Offers
  const [offers,           setOffers]          = useState([]);
  const [loadingOffers,    setLoadingOffers]   = useState(true);
  const [offerModal,       setOfferModal]      = useState(null);
  const [deleteTarget,     setDeleteTarget]    = useState(null);
  const [deleting,         setDeleting]        = useState(false);
  const [offerSearch,      setOfferSearch]     = useState('');
  const [categoryFilter,   setCategoryFilter]  = useState('all');

  // Reservations
  const [reservations,     setReservations]    = useState([]);
  const [loadingRes,       setLoadingRes]      = useState(true);
  const [resStatusFilter,  setResStatusFilter] = useState('all');
  const [resModal,         setResModal]        = useState(null);
  const [resSearch,        setResSearch]       = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // ── Data loaders ──
  const loadStats = useCallback(async () => {
    try {
      const r = await adminFetch(API_ENDPOINTS.OMRA_ADMIN_STATS);
      const d = await r.json();
      if (d.status === 'success') setStats(d.data);
    } catch { /* ignore */ }
  }, []);

  const loadOffers = useCallback(async () => {
    setLoadingOffers(true);
    try {
      const r = await adminFetch(API_ENDPOINTS.OMRA_ADMIN_OFFERS);
      const d = await r.json();
      if (d.status === 'success') setOffers(d.data);
    } catch { /* ignore */ }
    finally { setLoadingOffers(false); }
  }, []);

  const loadReservations = useCallback(async () => {
    setLoadingRes(true);
    try {
      const url = resStatusFilter === 'all'
        ? API_ENDPOINTS.OMRA_ADMIN_RESERVATIONS
        : `${API_ENDPOINTS.OMRA_ADMIN_RESERVATIONS}?status=${resStatusFilter}`;
      const r = await adminFetch(url);
      const d = await r.json();
      if (d.status === 'success') setReservations(d.data);
    } catch { /* ignore */ }
    finally { setLoadingRes(false); }
  }, [resStatusFilter]);

  useEffect(() => { loadStats(); loadOffers(); }, [loadStats, loadOffers]);
  useEffect(() => { loadReservations(); }, [loadReservations]);

  // ── Handlers ──
  const handleOfferSaved = (savedOffer, isEdit) => {
    if (isEdit) {
      setOffers((prev) => prev.map((o) => o._id === savedOffer._id ? savedOffer : o));
      showToast('Offre modifiée avec succès');
    } else {
      setOffers((prev) => [savedOffer, ...prev]);
      showToast('Offre créée avec succès');
    }
    setOfferModal(null);
    loadStats();
  };

  const handleToggleActive = async (offer) => {
    try {
      const r = await adminFetch(API_ENDPOINTS.OMRA_ADMIN_OFFER(offer._id), {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !offer.isActive })
      });
      const d = await r.json();
      if (d.status === 'success') {
        setOffers((prev) => prev.map((o) => o._id === offer._id ? d.data : o));
        showToast(d.data.isActive ? 'Offre activée' : 'Offre désactivée');
      }
    } catch { /* ignore */ }
  };

  const handleDeleteOffer = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminFetch(API_ENDPOINTS.OMRA_ADMIN_OFFER(deleteTarget._id), { method: 'DELETE' });
      setOffers((prev) => prev.filter((o) => o._id !== deleteTarget._id));
      setDeleteTarget(null);
      loadStats();
      showToast('Offre supprimée');
    } catch { /* ignore */ }
    finally { setDeleting(false); }
  };

  const handleResUpdated = (updated) => {
    setReservations((prev) => prev.map((r) => r._id === updated._id ? updated : r));
    setResModal(null);
    loadStats();
    showToast('Réservation mise à jour');
  };

  // ── Filtered views ──
  const filteredOffers = offers.filter((o) => {
    const matchSearch = !offerSearch || o.title.toLowerCase().includes(offerSearch.toLowerCase());
    const matchCat    = categoryFilter === 'all' || o.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const filteredRes = reservations.filter((r) =>
    !resSearch ||
    r.fullName?.toLowerCase().includes(resSearch.toLowerCase()) ||
    r.email?.toLowerCase().includes(resSearch.toLowerCase()) ||
    r.confirmationCode?.includes(resSearch)
  );

  // ── Render ──
  return (
    <div dir="ltr" className="space-y-5 max-w-6xl mx-auto">

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Tag}          label="Total offres"       value={stats?.totalOffers}          accent="bg-primary-700" />
        <StatCard icon={Eye}          label="Offres actives"     value={stats?.activeOffers}         accent="bg-emerald-600" />
        <StatCard icon={Users}        label="Réservations"       value={stats?.totalReservations}    accent="bg-sky-600" />
        <StatCard icon={Clock}        label="En attente"         value={stats?.pendingReservations}  accent="bg-amber-500" />
        <StatCard icon={CheckCircle2} label="Confirmées"         value={stats?.confirmedReservations} accent="bg-teal-600" />
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Tab bar + top actions */}
        <div className="flex items-center justify-between border-b border-gray-100 pl-1 pr-4">
          <div className="flex">
            {[{ id: 'offers', label: 'Offres' }, { id: 'reservations', label: 'Réservations' }].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-primary-700 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {t.label}
                {t.id === 'reservations' && stats?.pendingReservations > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                    {stats.pendingReservations}
                  </span>
                )}
              </button>
            ))}
          </div>
          {tab === 'offers' && (
            <button onClick={() => setOfferModal('new')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-xl text-xs font-semibold hover:bg-primary-800 transition-colors">
              <Plus size={14} /> Nouvelle offre
            </button>
          )}
        </div>

        {/* ═══ OFFERS TAB ═══ */}
        {tab === 'offers' && (
          <div className="p-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={offerSearch} onChange={(e) => setOfferSearch(e.target.value)}
                  placeholder="Rechercher une offre..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all',       label: 'Toutes' },
                  { id: 'umrah',     label: 'Omra' },
                  { id: 'umrah_plus', label: 'Omra Plus' }
                ].map((f) => (
                  <button key={f.id} onClick={() => setCategoryFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      categoryFilter === f.id
                        ? 'bg-primary-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
              <button onClick={loadOffers} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <RefreshCw size={14} className={`text-gray-400 ${loadingOffers ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingOffers ? (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                <RefreshCw size={18} className="animate-spin text-primary-700" />
                <span className="text-sm">Chargement...</span>
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plane size={28} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {offerSearch || categoryFilter !== 'all' ? 'Aucune offre ne correspond à votre recherche' : 'Aucune offre créée'}
                </p>
                {!offerSearch && categoryFilter === 'all' && (
                  <button onClick={() => setOfferModal('new')}
                    className="px-5 py-2 bg-primary-700 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 transition-colors">
                    Créer la première offre
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 pb-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Offre</th>
                      <th className="px-4 pb-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Catégorie</th>
                      <th className="px-4 pb-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Départ</th>
                      <th className="px-4 pb-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Places</th>
                      <th className="px-4 pb-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Prix</th>
                      <th className="px-4 pb-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Statut</th>
                      <th className="px-4 pb-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredOffers.map((offer) => (
                      <tr key={offer._id} className={`hover:bg-gray-50 transition-colors ${!offer.isActive ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                              <img
                                src={offer.imageUrl || 'https://images.unsplash.com/photo-1570516373621-186de359c2b7?w=80'}
                                alt={offer.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{offer.title}</p>
                                {offer.isFeatured && (
                                  <Star size={11} fill="#f59e0b" className="text-amber-400 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={9} />{offer.departureCity} · {offer.duration} jours
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={CATEGORY_STYLES[offer.category]}>
                            {CATEGORY_LABELS[offer.category]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-700 font-medium">{fmt(offer.departureDate)}</p>
                          <p className="text-[10px] text-gray-400">→ {fmt(offer.returnDate)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  (offer.availableSpots / offer.capacity) > 0.5 ? 'bg-emerald-500'
                                    : (offer.availableSpots / offer.capacity) > 0.2 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.round((offer.availableSpots / offer.capacity) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                              {offer.availableSpots}/{offer.capacity}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-gray-900">{offer.price?.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400">TND / pers.</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            offer.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {offer.isActive
                              ? <><span className="w-1 h-1 rounded-full bg-emerald-500" />Active</>
                              : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => handleToggleActive(offer)} title={offer.isActive ? 'Désactiver' : 'Activer'}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
                              {offer.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button onClick={() => setOfferModal(offer)} title="Modifier"
                              className="p-1.5 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-700 transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => setDeleteTarget(offer)} title="Supprimer"
                              className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ RESERVATIONS TAB ═══ */}
        {tab === 'reservations' && (
          <div className="p-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={resSearch} onChange={(e) => setResSearch(e.target.value)}
                  placeholder="Nom, email ou code..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all',       label: 'Toutes' },
                  { id: 'pending',   label: 'En attente' },
                  { id: 'confirmed', label: 'Confirmées' },
                  { id: 'cancelled', label: 'Annulées' }
                ].map((f) => (
                  <button key={f.id} onClick={() => setResStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      resStatusFilter === f.id
                        ? 'bg-primary-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
              <button onClick={loadReservations}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <RefreshCw size={14} className={`text-gray-400 ${loadingRes ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingRes ? (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                <RefreshCw size={18} className="animate-spin text-primary-700" />
                <span className="text-sm">Chargement...</span>
              </div>
            ) : filteredRes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={28} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">Aucune réservation trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Code', 'Client', 'Offre', 'Pers.', 'Date', 'Statut', ''].map((h) => (
                        <th key={h} className="px-4 pb-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRes.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-primary-700 font-bold whitespace-nowrap">
                          {r.confirmationCode}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{r.fullName}</p>
                          <p className="text-[10px] text-gray-400">{r.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-700 line-clamp-1 max-w-[140px]">{r.offer?.title || '—'}</p>
                          <p className="text-[10px] text-gray-400">{fmt(r.offer?.departureDate)}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-gray-800">{r.numberOfPeople}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-xs text-gray-600">{fmtDT(r.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={STATUS_STYLES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setResModal(r)}
                            className="flex items-center gap-1 text-xs text-primary-700 hover:text-primary-900 font-semibold transition-colors">
                            Voir <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {offerModal && (
        <OfferModal
          offer={offerModal === 'new' ? null : offerModal}
          onClose={() => setOfferModal(null)}
          onSaved={handleOfferSaved}
        />
      )}
      {resModal && (
        <ReservationModal
          reservation={resModal}
          onClose={() => setResModal(null)}
          onUpdated={handleResUpdated}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          target={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteOffer}
          loading={deleting}
        />
      )}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
};

export default OmraManager;
