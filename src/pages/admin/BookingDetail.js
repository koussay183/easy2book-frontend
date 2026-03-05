import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Hotel, Clock, User, Users, Mail, Phone,
  CreditCard, FileText, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Download, Printer, Building2,
  MapPin, Star, Utensils, Check, Edit, X, ExternalLink
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';

/* ── Inline print styles ── */
const PRINT_STYLE = `
  @media print {
    .no-print { display: none !important; }
    body { background: white !important; }
    .shadow-md, .shadow-lg, .shadow-xl { box-shadow: none !important; }
  }
`;

/* ── Status / payment configs ── */
const statusConfig = {
  pending:   { cls: 'bg-amber-100 text-amber-800 border-amber-300',     Icon: Clock,        label: 'En attente' },
  confirmed: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', Icon: CheckCircle, label: 'Confirmée'  },
  cancelled: { cls: 'bg-red-100 text-red-800 border-red-300',            Icon: XCircle,     label: 'Annulée'    },
  completed: { cls: 'bg-primary-50 text-primary-700 border-primary-200', Icon: Check,       label: 'Terminée'   },
};
const paymentConfig = {
  pending:  { cls: 'bg-amber-100 text-amber-800 border-amber-300',     Icon: Clock,        label: 'En attente' },
  paid:     { cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', Icon: CheckCircle, label: 'Payé'       },
  failed:   { cls: 'bg-red-100 text-red-800 border-red-300',            Icon: XCircle,     label: 'Échoué'     },
  refunded: { cls: 'bg-gray-100 text-gray-700 border-gray-300',         Icon: RefreshCw,   label: 'Remboursé'  },
};

const Badge = ({ cfg }) => {
  const c = cfg || statusConfig.pending;
  const Icon = c.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border ${c.cls}`}>
      <Icon size={13} />
      {c.label}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-semibold text-gray-900 mt-0.5">{value || '—'}</p>
  </div>
);

const Card = ({ icon: Icon, title, iconColor = 'text-primary-700', children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
      <Icon size={16} className={iconColor} />
      <p className="text-sm font-semibold text-gray-900">{title}</p>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ══════════════════════════════════════════════════ */

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [loadingHotel, setLoadingHotel] = useState(false);

  useEffect(() => {
    if (!location.state?.booking) { loadBooking(); }
    else { loadHotelDetails(booking.hotelBooking?.Hotel); }
  }, [id]); // eslint-disable-line

  useEffect(() => {
    if (booking && booking.hotelBooking?.Hotel && !hotelDetails) {
      loadHotelDetails(booking.hotelBooking.Hotel);
    }
  }, [booking]); // eslint-disable-line

  const loadBooking = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_ENDPOINTS.BOOKINGS_DETAILS}/${id}`);
      const data = await res.json();
      if (data.status === 'success') setBooking(data.data.booking);
      else { alert('Réservation non trouvée'); navigate('/admin/dashboard'); }
    } catch { alert('Erreur de chargement'); navigate('/admin/dashboard'); }
    finally { setLoading(false); }
  };

  const loadHotelDetails = async (hotelId) => {
    if (!hotelId) return;
    setLoadingHotel(true);
    try {
      const res  = await fetch(`${API_ENDPOINTS.MYGO_HOTELS_DETAILS}/${hotelId}`);
      const data = await res.json();
      if (data.status === 'success' && data.data?.HotelDetail) setHotelDetails(data.data.HotelDetail);
    } catch { /* silent */ }
    finally { setLoadingHotel(false); }
  };

  /* ── Admin actions ── */
  const patchBooking = async (url, body) => {
    const res  = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.status === 'success') loadBooking();
    else alert(`Erreur: ${data.message}`);
  };

  const handleUpdateStatus = (s) => {
    if (window.confirm(`Changer le statut à "${s}"?`))
      patchBooking(`${API_BASE_URL}/api/bookings/${id}/status`, { status: s });
  };
  const handleUpdatePayment = (s) => {
    if (window.confirm(`Changer le paiement à "${s}"?`))
      patchBooking(`${API_BASE_URL}/api/bookings/${id}/payment`, { paymentStatus: s });
  };
  /* ── myGo 2-step confirmation modal ── */
  const [myGoModal, setMyGoModal] = useState({
    open: false, step: 'idle', offer: null, error: null
    // step: 'loading' | 'offer' | 'confirming' | 'done' | 'error'
  });
  const closeMyGoModal = () => setMyGoModal({ open: false, step: 'idle', offer: null, error: null });

  // Step 1 — pre-book (PreBooking:true): fetch offer, show it
  const handlePreBook = async () => {
    setMyGoModal({ open: true, step: 'loading', offer: null, error: null });
    try {
      const res  = await fetch(`${API_BASE_URL}/api/bookings/${id}/prebooking`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMyGoModal({ open: true, step: 'offer', offer: data.data.offer, error: null });
      } else {
        setMyGoModal({ open: true, step: 'error', offer: null, error: data.message });
      }
    } catch {
      setMyGoModal({ open: true, step: 'error', offer: null, error: 'Erreur réseau' });
    }
  };

  // Step 2 — confirm (PreBooking:false): create real booking
  const handleConfirmFinal = async () => {
    setMyGoModal(prev => ({ ...prev, step: 'confirming' }));
    try {
      const res  = await fetch(`${API_BASE_URL}/api/bookings/${id}/confirm`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMyGoModal(prev => ({ ...prev, step: 'done', error: null }));
        loadBooking();
      } else {
        setMyGoModal(prev => ({ ...prev, step: 'error', error: data.message }));
      }
    } catch {
      setMyGoModal(prev => ({ ...prev, step: 'error', error: 'Erreur réseau' }));
    }
  };

  /* ── CSV exports ── */
  const exportThis = () => {
    if (!booking) return;
    const r = booking.hotelBooking?.Rooms?.[0];
    const nights = booking.hotelBooking?.CheckIn && booking.hotelBooking?.CheckOut
      ? Math.ceil((new Date(booking.hotelBooking.CheckOut) - new Date(booking.hotelBooking.CheckIn)) / 864e5) : '';
    const price = booking.myGoResponse?.BookingCreation?.TotalPrice
      ? parseFloat(booking.myGoResponse.BookingCreation.TotalPrice).toFixed(2)
      : parseFloat(booking.totalPrice || 0).toFixed(2);
    const guests = (r?.Pax?.Adult || []).map(a => `${a.Civility || ''} ${a.Name} ${a.Surname}`.trim()).join(' | ');
    const hdrs = ['Code','Statut','Paiement','Méthode','Montant (TND)','Hôtel','Arrivée','Départ','Nuits','Voyageurs','Email','Téléphone','Créée le'];
    const row  = [
      booking.confirmationCode || '', booking.status || '', booking.paymentStatus || '',
      booking.paymentMethod || '', price, `Hotel #${booking.hotelBooking?.Hotel || ''}`,
      booking.hotelBooking?.CheckIn || '', booking.hotelBooking?.CheckOut || '', nights,
      guests, booking.contactEmail || '', booking.contactPhone || '',
      booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('fr-FR') : ''
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',');
    const csv  = '\uFEFF' + [hdrs.map(h=>`"${h}"`).join(','), row].join('\r\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})),
      download: `reservation_${booking.confirmationCode||id}.csv`
    });
    a.click();
  };

  const exportAll = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.BOOKINGS_ADMIN_EXPORT_CSV, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (!res.ok) { alert("Erreur lors de l'export"); return; }
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(await res.blob()),
        download: `reservations_${new Date().toISOString().split('T')[0]}.csv`
      });
      a.click();
    } catch { alert("Erreur lors de l'export CSV"); }
  };

  /* ── Helpers ── */
  const calcNights = (ci, co) => ci && co ? Math.ceil((new Date(co)-new Date(ci))/864e5) : 0;
  const getBoardingInfo = (boardingId) => {
    if (!hotelDetails?.Boarding || !boardingId) return { name: `Code ${boardingId}`, code: '' };
    const b = hotelDetails.Boarding.find(b => b.Id === parseInt(boardingId));
    return b ? { name: b.Name, code: b.Code||'', desc: b.Description||'' } : { name: `Code ${boardingId}`, code: '' };
  };

  /* ── Loading / error states ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw size={40} className="animate-spin text-primary-700 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Chargement...</p>
      </div>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center">
        <FileText size={48} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-900 mb-4">Réservation non trouvée</p>
        <button onClick={() => navigate('/admin/dashboard')}
          className="px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium">
          Retour
        </button>
      </div>
    </div>
  );

  /* ── Derived data ── */
  const room         = booking.hotelBooking?.Rooms?.[0];
  const adults       = room?.Pax?.Adult || [];
  const children     = room?.Pax?.Child || [];
  const nights       = calcNights(booking.hotelBooking?.CheckIn, booking.hotelBooking?.CheckOut);
  const displayPrice = booking.myGoResponse?.BookingCreation?.TotalPrice
    ? parseFloat(booking.myGoResponse.BookingCreation.TotalPrice)
    : parseFloat(booking.totalPrice || 0);
  const currency     = booking.myGoResponse?.BookingCreation?.Currency || 'TND';
  const hasDiscrep   = booking.myGoResponse?.BookingCreation?.TotalPrice &&
    parseFloat(booking.myGoResponse.BookingCreation.TotalPrice) !== parseFloat(booking.totalPrice);
  const boarding     = getBoardingInfo(room?.Boarding);

  return (
    <>
      <style>{PRINT_STYLE}</style>
      <div dir="ltr" className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-5 space-y-5">

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between flex-wrap gap-3 no-print">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft size={15} />
              Retour
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={exportThis}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                <Download size={13} />
                Cette réservation (CSV)
              </button>
              <button onClick={exportAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                <Download size={13} />
                Toutes les réservations (CSV)
              </button>
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                <Printer size={13} />
                Imprimer
              </button>
              <button onClick={loadBooking}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-xs font-medium transition-colors">
                <RefreshCw size={13} />
                Actualiser
              </button>
            </div>
          </div>

          {/* ── Price discrepancy alert ── */}
          {hasDiscrep && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Différence de prix détectée</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Prix myGo: <strong>{parseFloat(booking.myGoResponse.BookingCreation.TotalPrice).toFixed(2)} TND</strong>
                  {' '}— Prix initial: <strong>{parseFloat(booking.totalPrice).toFixed(2)} TND</strong>
                </p>
              </div>
            </div>
          )}

          {/* ── Hero card ── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-primary-900 px-5 py-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-primary-300 text-[10px] font-semibold uppercase tracking-widest mb-1">Réservation</p>
                  <h1 className="text-white text-2xl font-bold tracking-wide">{booking.confirmationCode}</h1>
                  <p className="text-primary-400 text-[10px] mt-0.5 font-mono">{booking._id}</p>
                </div>
                <Badge cfg={statusConfig[booking.status] || statusConfig.pending} />
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
              <div className="p-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Montant</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{displayPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-400">{currency}{nights > 0 ? ` · ${(displayPrice/nights).toFixed(0)}/nuit` : ''}</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Séjour</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {booking.hotelBooking?.CheckIn || '—'} → {booking.hotelBooking?.CheckOut || '—'}
                </p>
                {nights > 0 && <p className="text-xs text-primary-700 font-medium mt-0.5">{nights} nuit{nights>1?'s':''}</p>}
              </div>
              <div className="p-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Paiement</p>
                <div className="mt-1"><Badge cfg={paymentConfig[booking.paymentStatus] || paymentConfig.pending} /></div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  {booking.paymentMethod === 'online'
                    ? <><CreditCard size={10}/> En ligne{booking.paymentPlan === 'installment' ? ' (tranches)' : ''}</>
                    : booking.paymentMethod === 'wafacash'
                      ? <><span style={{color:'#EA6913',fontWeight:'bold',fontSize:'10px'}}>WC</span> Wafacash</>
                      : booking.paymentMethod === 'izi'
                        ? <><span style={{color:'#6D28D9',fontWeight:'bold',fontSize:'10px'}}>izi</span> Izi</>
                        : <><Building2 size={10}/> Agence</>
                  }
                </p>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Créée le</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('fr-FR') : '—'}
                </p>
                <p className="text-xs text-gray-400">
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : ''}
                </p>
              </div>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* LEFT */}
            <div className="space-y-5">

              {/* Client */}
              <Card icon={User} title="Client">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      booking.isGuest ? 'bg-gray-100 text-gray-600' : 'bg-primary-50 text-primary-700'
                    }`}>
                      {booking.isGuest ? 'Invité' : 'Compte'}
                    </span>
                    {booking.guestInfo?.name && (
                      <span className="text-sm font-semibold text-gray-900">{booking.guestInfo.name}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail size={13} className="text-gray-400 flex-shrink-0" />
                      <span>{booking.contactEmail || '—'}</span>
                    </div>
                    {booking.contactPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone size={13} className="text-gray-400 flex-shrink-0" />
                        <span>{booking.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Hotel */}
              <Card icon={Hotel} title="Hôtel & Chambre">
                {loadingHotel ? (
                  <div className="flex items-center justify-center py-6">
                    <RefreshCw size={20} className="animate-spin text-primary-700" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hotelDetails ? (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Hotel size={18} className="text-primary-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900">{hotelDetails.Name}</p>
                            {hotelDetails.Adress && (
                              <div className="flex items-start gap-1 text-xs text-gray-500 mt-0.5">
                                <MapPin size={11} className="mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{hotelDetails.Adress}</span>
                              </div>
                            )}
                            {hotelDetails.Category?.Star > 0 && (
                              <div className="flex items-center gap-0.5 mt-1">
                                {[...Array(hotelDetails.Category.Star)].map((_, i) => (
                                  <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {hotelDetails.Facilitie?.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100">
                            {hotelDetails.Facilitie.slice(0, 6).map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                                <div className="w-1 h-1 bg-primary-400 rounded-full flex-shrink-0" />
                                <span className="truncate">{f.Title}</span>
                              </div>
                            ))}
                            {hotelDetails.Facilitie.length > 6 && (
                              <p className="text-xs text-gray-400">+{hotelDetails.Facilitie.length-6} autres</p>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <InfoRow label="Hôtel" value={`Hôtel #${booking.hotelBooking?.Hotel || '—'}`} />
                    )}

                    {room && (
                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Type de pension</p>
                        <div className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
                          <Utensils size={14} className="text-primary-700 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-primary-900">{boarding.name}</p>
                            {boarding.code && <p className="text-[10px] text-primary-600">Code: {boarding.code}</p>}
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                          Source: {booking.hotelBooking?.Source || '—'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {booking.notes && (
                <Card icon={FileText} title="Demandes spéciales" iconColor="text-amber-600">
                  <div className="bg-amber-50 rounded-lg px-4 py-3 border border-amber-200">
                    <p className="text-sm text-gray-700 italic">"{booking.notes}"</p>
                  </div>
                </Card>
              )}
            </div>

            {/* RIGHT */}
            <div className="space-y-5">

              {/* Travelers */}
              <Card icon={Users} title={`Voyageurs (${adults.length} adulte${adults.length>1?'s':''}${children.length>0?`, ${children.length} enfant${children.length>1?'s':''}`:''} )`}>
                <div className="space-y-2">
                  {adults.map((adult, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={14} className="text-primary-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {adult.Civility} {adult.Name} {adult.Surname}
                          </p>
                          <p className="text-xs text-gray-400">Adulte {i+1}</p>
                        </div>
                      </div>
                      {adult.Holder && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-300">
                          Titulaire
                        </span>
                      )}
                    </div>
                  ))}
                  {children.map((child, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={14} className="text-primary-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{child.Name} {child.Surname}</p>
                          <p className="text-xs text-gray-400">Enfant {i+1}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-300">
                        {child.Age} ans
                      </span>
                    </div>
                  ))}
                  {adults.length === 0 && children.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Aucun voyageur enregistré</p>
                  )}
                </div>
              </Card>

              {/* Metadata */}
              <Card icon={Clock} title="Métadonnées" iconColor="text-gray-500">
                <div className="space-y-3">
                  <InfoRow label="Créée le" value={booking.createdAt ? new Date(booking.createdAt).toLocaleString('fr-FR') : '—'} />
                  <div className="border-t border-gray-100 pt-3">
                    <InfoRow label="Dernière modification" value={booking.updatedAt ? new Date(booking.updatedAt).toLocaleString('fr-FR') : '—'} />
                  </div>
                  {booking.requestMetadata && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Appareil client</p>
                      <div className="bg-gray-50 rounded-lg px-3 py-2 space-y-1 text-xs text-gray-600">
                        <p><span className="font-medium">Navigateur:</span> {booking.requestMetadata.browser} {booking.requestMetadata.browserVersion}</p>
                        <p><span className="font-medium">OS:</span> {booking.requestMetadata.os} {booking.requestMetadata.osVersion}</p>
                        <p><span className="font-medium">Type:</span> {booking.requestMetadata.deviceType}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Admin Actions */}
              <Card icon={Edit} title="Actions" className="no-print">
                <div className="space-y-2">

                  {booking.status === 'pending' && (
                    <>
                      <button onClick={handlePreBook}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <CheckCircle size={15} />
                        Confirmer via myGo
                      </button>
                      <button onClick={() => handleUpdateStatus('cancelled')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <XCircle size={15} />
                        Annuler
                      </button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <>
                      <button onClick={() => handleUpdateStatus('completed')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-sm font-medium transition-colors">
                        <Check size={15} />
                        Marquer comme terminée
                      </button>
                      <button onClick={() => handleUpdateStatus('cancelled')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <XCircle size={15} />
                        Annuler
                      </button>
                    </>
                  )}

                  {(booking.status === 'completed' || booking.status === 'cancelled') && (
                    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-center">
                      <p className="text-xs text-gray-500">
                        Réservation {booking.status === 'completed' ? 'terminée' : 'annulée'} — aucune action disponible
                      </p>
                    </div>
                  )}

                  {booking.status !== 'cancelled' && (
                    <div className="border-t border-gray-100 pt-3 mt-1">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Paiement</p>
                      {booking.paymentStatus === 'pending' && (
                        <button onClick={() => handleUpdatePayment('paid')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                          <CheckCircle size={15} />
                          Marquer comme payé
                        </button>
                      )}
                      {booking.paymentStatus === 'paid' && (
                        <button onClick={() => handleUpdatePayment('refunded')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                          <RefreshCw size={15} />
                          Rembourser
                        </button>
                      )}
                      {(booking.paymentStatus === 'refunded' || booking.paymentStatus === 'failed') && (
                        <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 text-center">
                          <p className="text-xs text-gray-500">
                            Paiement {booking.paymentStatus === 'refunded' ? 'remboursé' : 'échoué'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

            </div>
          </div>
        </div>
      </div>

      {/* ── myGo 2-step confirmation modal ── */}
      {myGoModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={myGoModal.step === 'loading' || myGoModal.step === 'confirming' ? undefined : closeMyGoModal}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

            {/* Loading / Confirming spinner */}
            {(myGoModal.step === 'loading' || myGoModal.step === 'confirming') && (
              <div className="p-12 flex flex-col items-center gap-4">
                <RefreshCw size={36} className="animate-spin text-primary-700" />
                <p className="text-sm font-semibold text-gray-700">
                  {myGoModal.step === 'loading' ? "Récupération de l'offre myGo..." : 'Confirmation en cours...'}
                </p>
              </div>
            )}

            {/* Offer review */}
            {myGoModal.step === 'offer' && myGoModal.offer && (
              <>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink size={15} className="text-primary-700" />
                    <p className="text-sm font-bold text-gray-900">Offre myGo — Vérifiez avant de confirmer</p>
                  </div>
                  <button onClick={closeMyGoModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {myGoModal.offer?.BookingCreation?.TotalPrice && (
                    <div className="bg-primary-50 rounded-xl p-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Prix total myGo</p>
                      <p className="text-xl font-bold text-primary-700">
                        {parseFloat(myGoModal.offer.BookingCreation.TotalPrice).toFixed(2)}{' '}
                        {myGoModal.offer.BookingCreation.Currency || 'TND'}
                      </p>
                    </div>
                  )}
                  {myGoModal.offer?.BookingCreation?.TotalPrice && booking?.totalPrice &&
                    parseFloat(myGoModal.offer.BookingCreation.TotalPrice) !== parseFloat(booking.totalPrice) && (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-start gap-2">
                      <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        Attention : prix myGo ({parseFloat(myGoModal.offer.BookingCreation.TotalPrice).toFixed(2)}) ≠ prix
                        enregistré ({parseFloat(booking.totalPrice).toFixed(2)} TND)
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Hôtel</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {booking?.hotelBooking?.Hotel} — {booking?.hotelBooking?.City}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Séjour</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {booking?.hotelBooking?.CheckIn} → {booking?.hotelBooking?.CheckOut}
                      </p>
                    </div>
                  </div>
                  {myGoModal.offer?.BookingCreation?.id && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">ID offre myGo</p>
                      <p className="text-sm font-mono text-gray-900">{myGoModal.offer.BookingCreation.id}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    En cliquant sur "Confirmer", une réservation réelle sera créée dans le système myGo.
                  </p>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                  <button onClick={closeMyGoModal}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                    Fermer
                  </button>
                  <button onClick={handleConfirmFinal}
                    className="flex-1 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Check size={14} />
                    Confirmer la réservation
                  </button>
                </div>
              </>
            )}

            {/* Done */}
            {myGoModal.step === 'done' && (
              <>
                <div className="p-10 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={28} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 mb-1">Réservation confirmée !</p>
                    {booking?.myGoBookingId && (
                      <p className="text-xs text-gray-500">
                        ID myGo : <span className="font-mono font-bold text-gray-900">{booking.myGoBookingId}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button onClick={closeMyGoModal}
                    className="w-full px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-sm font-medium transition-colors">
                    Fermer
                  </button>
                </div>
              </>
            )}

            {/* Error */}
            {myGoModal.step === 'error' && (
              <>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">Erreur myGo</p>
                  <button onClick={closeMyGoModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2">
                    <AlertCircle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800">{myGoModal.error || 'Une erreur est survenue'}</p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                  <button onClick={closeMyGoModal}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                    Fermer
                  </button>
                  <button onClick={handlePreBook}
                    className="flex-1 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <RefreshCw size={14} />
                    Réessayer
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default BookingDetail;
