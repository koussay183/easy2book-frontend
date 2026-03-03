import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Home, Mail, Phone, CreditCard,
  Building2, Copy, ArrowRight, FileText, User,
  MapPin, Clock, Moon, Banknote, AlertCircle, Check, Printer
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';

/* ─── Print styles ───────────────────────────────────────────────── */
const PRINT_STYLE = `
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  body { background: white !important; margin: 0; padding: 0; }
  @page { margin: 14mm 12mm; size: A4; }
}
@media screen {
  .print-only { display: none !important; }
}
`;

/* ─── mini Card wrapper ───────────────────────────────────────────── */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ icon: Icon, title, color = 'text-primary-600' }) => (
  <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
    <Icon size={16} className={color} />
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
  </div>
);
const Row = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
    <span className={`text-xs font-semibold text-gray-800 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

/* ─── Copy button ────────────────────────────────────────────────── */
const CopyBtn = ({ text }) => {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-primary-50">
      {done ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      <span>{done ? 'Copié' : 'Copier'}</span>
    </button>
  );
};

/* ══════════════════════ MAIN ════════════════════════════════════════ */
const BookingConfirmation = () => {
  const { language }                 = useLanguage();
  const isRTL                        = language === 'ar';
  const navigate                     = useNavigate();
  const location                     = useLocation();
  const { booking, paymentMethod: pm, isGuest } = location.state || {};
  const paymentMethod                = pm || booking?.paymentMethod || 'agency';
  const paymentPlan                  = booking?.paymentPlan || 'full';
  const [settings,   setSettings]    = useState(null);
  const [copied,     setCopied]      = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    fetch(API_ENDPOINTS.PUBLIC_SETTINGS)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setSettings(d.data); })
      .catch(() => {});
  }, []);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="font-semibold text-gray-900 mb-2">
            {language === 'fr' ? 'Aucune réservation trouvée' : language === 'ar' ? 'لم يتم العثور على حجز' : 'No booking found'}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {language === 'fr' ? 'Cette page est accessible après une réservation.' : language === 'ar' ? 'هذه الصفحة متاحة بعد الحجز.' : 'This page is only accessible after booking.'}
          </p>
          <button onClick={() => navigate('/')}
            className="bg-primary-700 hover:bg-primary-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            {language === 'fr' ? 'Retour à l\'accueil' : language === 'ar' ? 'الرئيسية' : 'Back to home'}
          </button>
        </Card>
      </div>
    );
  }

  /* ── derived data ── */
  const checkIn   = new Date(booking.hotelBooking.CheckIn);
  const checkOut  = new Date(booking.hotelBooking.CheckOut);
  const nights    = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const room      = booking.hotelBooking.Rooms[0];
  const adults    = room?.Pax?.Adult || [];
  const children  = room?.Pax?.Child || [];
  const holder    = adults.find(a => a.Holder) || adults[0];
  const currency  = booking.currency || 'TND';

  const fmt = (d) => new Date(d).toLocaleDateString(
    language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  );

  const fmtPrint = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  /* ── payment method config ── */
  const methodMeta = {
    agency:   { label: language === 'fr' ? 'Agence Easy2Book' : language === 'ar' ? 'وكالة Easy2Book' : 'Easy2Book Agency',   color: 'bg-primary-50 border-primary-200 text-primary-700', icon: Building2 },
    wafacash: { label: 'Wafacash',  color: 'bg-orange-50 border-orange-200 text-orange-700', icon: Banknote },
    izi:      { label: 'Izi',       color: 'bg-violet-50 border-violet-200 text-violet-700', icon: Banknote },
    online:   { label: language === 'fr' ? 'Paiement en ligne' : language === 'ar' ? 'الدفع عبر الإنترنت' : 'Online Payment', color: 'bg-blue-50 border-blue-200 text-blue-700', icon: CreditCard },
  };
  const meta = methodMeta[paymentMethod] || methodMeta.agency;

  /* ── payment instructions block ── */
  const PaymentInstructions = () => {
    const s = settings;

    if (paymentMethod === 'wafacash' && s?.wafacash) {
      const w = s.wafacash;
      return (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {language === 'fr'
              ? `Effectuez un virement Wafacash du montant de `
              : language === 'ar' ? 'أرسل مبلغ ' : 'Transfer '}
            <strong className="text-gray-900">{parseFloat(booking.totalPrice).toFixed(2)} {currency}</strong>
            {language === 'fr' ? ' vers le compte suivant :' : language === 'ar' ? ' إلى الحساب التالي:' : ' to the following account:'}
          </p>
          {w.rib && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wide mb-1">RIB</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-sm font-bold text-gray-900 tracking-wider" dir="ltr">{w.rib}</p>
                <CopyBtn text={w.rib} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {w.accountName && <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-400 mb-0.5">{language === 'fr' ? 'Titulaire' : 'Account name'}</p><p className="font-semibold text-gray-800">{w.accountName}</p></div>}
            {w.bankName    && <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-400 mb-0.5">{language === 'fr' ? 'Etablissement' : 'Bank'}</p><p className="font-semibold text-gray-800">{w.bankName}</p></div>}
            {w.phone       && <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2"><Phone size={11} className="text-orange-500 flex-shrink-0" /><div><p className="text-gray-400 mb-0.5">Téléphone</p><p className="font-semibold text-gray-800" dir="ltr">{w.phone}</p></div></div>}
          </div>
          {w.instructions && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 italic">{w.instructions}</p>}
          <div className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-3">
            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
            <span>
              {language === 'fr'
                ? `Indiquez votre code de confirmation `
                : language === 'ar' ? 'أذكر كود التأكيد '
                : 'Include your confirmation code '}
              <strong className="font-mono">{booking.confirmationCode}</strong>
              {language === 'fr' ? ' en référence du virement.' : language === 'ar' ? ' كمرجع للتحويل.' : ' as the transfer reference.'}
            </span>
          </div>
        </div>
      );
    }

    if (paymentMethod === 'izi' && s?.izi) {
      const iz = s.izi;
      return (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {language === 'fr' ? 'Effectuez un paiement Izi de ' : language === 'ar' ? 'أرسل مبلغ ' : 'Transfer '}
            <strong className="text-gray-900">{parseFloat(booking.totalPrice).toFixed(2)} {currency}</strong>
            {language === 'fr' ? ' vers :' : language === 'ar' ? ' إلى:' : ' to:'}
          </p>
          {iz.rib && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
              <p className="text-[10px] text-violet-600 font-semibold uppercase tracking-wide mb-1">RIB</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-sm font-bold text-gray-900 tracking-wider" dir="ltr">{iz.rib}</p>
                <CopyBtn text={iz.rib} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {iz.accountName && <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-400 mb-0.5">{language === 'fr' ? 'Titulaire' : 'Account name'}</p><p className="font-semibold text-gray-800">{iz.accountName}</p></div>}
            {iz.bankName    && <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-400 mb-0.5">{language === 'fr' ? 'Plateforme' : 'Platform'}</p><p className="font-semibold text-gray-800">{iz.bankName}</p></div>}
            {iz.phone       && <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2"><Phone size={11} className="text-violet-500 flex-shrink-0" /><div><p className="text-gray-400 mb-0.5">Téléphone</p><p className="font-semibold text-gray-800" dir="ltr">{iz.phone}</p></div></div>}
          </div>
          {iz.instructions && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 italic">{iz.instructions}</p>}
          <div className="flex items-start gap-2 text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-lg p-3">
            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
            <span>
              {language === 'fr' ? 'Indiquez votre code ' : language === 'ar' ? 'أذكر كود ' : 'Include code '}
              <strong className="font-mono">{booking.confirmationCode}</strong>
              {language === 'fr' ? ' en référence.' : language === 'ar' ? ' كمرجع.' : ' as reference.'}
            </span>
          </div>
        </div>
      );
    }

    if (paymentMethod === 'agency' && s?.agency) {
      const ag = s.agency;
      return (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {language === 'fr' ? 'Présentez-vous dans notre agence pour finaliser votre réservation.' : language === 'ar' ? 'تفضل إلى وكالتنا لإتمام الحجز.' : 'Visit our agency to complete your booking.'}
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {ag.address && (
              <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                <MapPin size={12} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <div><p className="text-gray-400 mb-0.5">{language === 'fr' ? 'Adresse' : 'Address'}</p><p className="font-semibold text-gray-800">{ag.address}</p></div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ag.phone && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <Phone size={12} className="text-primary-500 flex-shrink-0" />
                  <div><p className="text-gray-400 mb-0.5 text-[10px]">{language === 'fr' ? 'Téléphone' : 'Phone'}</p><p className="font-semibold text-gray-800" dir="ltr">{ag.phone}</p></div>
                </div>
              )}
              {ag.email && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <Mail size={12} className="text-primary-500 flex-shrink-0" />
                  <div><p className="text-gray-400 mb-0.5 text-[10px]">Email</p><p className="font-semibold text-gray-800">{ag.email}</p></div>
                </div>
              )}
              {ag.hours && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <Clock size={12} className="text-primary-500 flex-shrink-0" />
                  <div><p className="text-gray-400 mb-0.5 text-[10px]">{language === 'fr' ? 'Horaires' : 'Hours'}</p><p className="font-semibold text-gray-800">{ag.hours}</p></div>
                </div>
              )}
            </div>
          </div>
          {ag.instructions && <p className="text-xs text-gray-500 bg-primary-50 border border-primary-100 rounded-lg p-3 italic">{ag.instructions}</p>}
        </div>
      );
    }

    if (paymentMethod === 'online') {
      const planLabel = paymentPlan === 'installment'
        ? (language === 'fr' ? 'paiement en tranches' : language === 'ar' ? 'دفع مقسّط' : 'installment payment')
        : (language === 'fr' ? 'paiement total' : language === 'ar' ? 'دفع كامل' : 'full payment');
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
            <CheckCircle2 size={13} className="flex-shrink-0 text-blue-500" />
            <span>
              {language === 'fr' ? `Votre ${planLabel} est en cours de traitement.` : language === 'ar' ? `${planLabel} — جاري المعالجة.` : `Your ${planLabel} is being processed.`}
            </span>
          </div>
          {s?.online?.instructions && <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-3">{s.online.instructions}</p>}
        </div>
      );
    }

    return (
      <div className="text-xs text-gray-400 italic py-2">
        {language === 'fr' ? 'Chargement des instructions...' : 'Loading instructions...'}
      </div>
    );
  };

  /* ── Print receipt content (rendered in DOM, shown only on print) ── */
  const w = settings?.wafacash;
  const iz = settings?.izi;
  const ag = settings?.agency;
  const hasRIB = (paymentMethod === 'wafacash' && w?.rib) || (paymentMethod === 'izi' && iz?.rib);
  const ribData = paymentMethod === 'wafacash' ? w : paymentMethod === 'izi' ? iz : null;
  const ribColor = paymentMethod === 'wafacash' ? '#EA6913' : '#6D28D9';

  /* ══════ RENDER ══════ */
  return (
    <>
      {/* Inject print CSS */}
      <style>{PRINT_STYLE}</style>

      {/* ══ PRINT RECEIPT (hidden on screen) ══ */}
      <div className="print-only" style={{ fontFamily: 'Arial, sans-serif', color: '#111', maxWidth: 680, margin: '0 auto', padding: '0 8px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1e40af', paddingBottom: 14, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#1e40af', letterSpacing: '-0.5px' }}>Easy2Book</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>easy2book.tn</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bon de Réservation</div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>Imprimé le {fmtPrint(new Date())}</div>
          </div>
        </div>

        {/* Confirmation code */}
        <div style={{ background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: 4 }}>Code de confirmation</div>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '4px', color: '#1e3a8a' }}>{booking.confirmationCode}</div>
          </div>
          <div style={{ fontSize: 10, color: '#6b7280', textAlign: 'right' }}>
            <div>Statut</div>
            <div style={{ fontWeight: 700, color: '#059669', marginTop: 2 }}>Créée</div>
          </div>
        </div>

        {/* Booking details */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', marginBottom: 8, borderLeft: '3px solid #1e40af', paddingLeft: 8 }}>Détails de la réservation</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <tbody>
              {[
                ['Check-in',    fmtPrint(booking.hotelBooking.CheckIn)],
                ['Check-out',   fmtPrint(booking.hotelBooking.CheckOut)],
                ['Nuits',       nights],
                ['Chambre',     `#${room?.Id}`],
                ['Pension',     room?.Boarding || '—'],
                ['Voyageurs',   `${adults.length} adulte(s)${children.length > 0 ? ` + ${children.length} enfant(s)` : ''}`],
                ...(holder ? [['Titulaire', `${holder.Civility || ''} ${holder.Name || ''} ${holder.Surname || ''}`.trim()]] : []),
                ...(booking.contactEmail ? [['Email', booking.contactEmail]] : []),
                ...(booking.contactPhone ? [['Téléphone', booking.contactPhone]] : []),
              ].map(([label, value], i) => (
                <tr key={label} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                  <td style={{ padding: '7px 10px', color: '#6b7280', fontWeight: 600, width: '35%' }}>{label}</td>
                  <td style={{ padding: '7px 10px', color: '#111827', fontWeight: 700 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment section */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', marginBottom: 8, borderLeft: '3px solid #1e40af', paddingLeft: 8 }}>Mode de paiement — {meta.label}</div>

          {hasRIB && ribData?.rib && (
            <div style={{ border: `2px solid ${ribColor}22`, borderRadius: 8, padding: '12px 14px', background: `${ribColor}0a`, marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: ribColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>RIB — Compte destinataire</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 12 }}>
                <div><span style={{ color: '#6b7280' }}>RIB: </span><strong style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: 13 }}>{ribData.rib}</strong></div>
                {ribData.accountName && <div><span style={{ color: '#6b7280' }}>Titulaire: </span><strong>{ribData.accountName}</strong></div>}
                {ribData.bankName    && <div><span style={{ color: '#6b7280' }}>Banque: </span><strong>{ribData.bankName}</strong></div>}
                {ribData.phone       && <div><span style={{ color: '#6b7280' }}>Tél.: </span><strong>{ribData.phone}</strong></div>}
              </div>
            </div>
          )}

          {paymentMethod === 'agency' && ag && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', background: '#f0f9ff', marginBottom: 10, fontSize: 12 }}>
              {ag.address && <div><span style={{ color: '#6b7280' }}>Adresse: </span><strong>{ag.address}</strong></div>}
              {ag.phone   && <div style={{ marginTop: 4 }}><span style={{ color: '#6b7280' }}>Tél.: </span><strong>{ag.phone}</strong></div>}
              {ag.email   && <div style={{ marginTop: 4 }}><span style={{ color: '#6b7280' }}>Email: </span><strong>{ag.email}</strong></div>}
              {ag.hours   && <div style={{ marginTop: 4 }}><span style={{ color: '#6b7280' }}>Horaires: </span><strong>{ag.hours}</strong></div>}
            </div>
          )}

          {/* Reference reminder (for transfer methods) */}
          {(paymentMethod === 'wafacash' || paymentMethod === 'izi') && (
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#92400e', marginBottom: 10 }}>
              <strong>Important:</strong> Indiquez le code <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 13 }}>{booking.confirmationCode}</span> en référence lors de votre virement.
            </div>
          )}
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <div style={{ background: '#1e3a8a', borderRadius: 10, padding: '12px 24px', textAlign: 'right', color: 'white' }}>
            <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Montant total à régler</div>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace' }}>{parseFloat(booking.totalPrice).toFixed(2)} <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>{currency}</span></div>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div style={{ marginBottom: 18, border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Demandes spéciales</div>
            <div style={{ color: '#374151', fontStyle: 'italic' }}>{booking.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af' }}>
          <span>Easy2Book — easy2book.tn</span>
          <span>Document généré automatiquement — non contractuel avant confirmation.</span>
        </div>
      </div>

      {/* ══ SCREEN CONTENT ══ */}
      <div className="no-print min-h-screen bg-gray-50 py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-3xl mx-auto space-y-4">

          {/* ── Success banner ── */}
          <div className="bg-primary-700 rounded-2xl p-6 text-center text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold mb-1">
              {language === 'fr' ? 'Réservation créée !' : language === 'ar' ? 'تم إنشاء الحجز!' : 'Booking created!'}
            </h1>
            <p className="text-white/80 text-sm max-w-sm mx-auto">
              {language === 'fr' ? 'Votre réservation est enregistrée. Suivez les instructions ci-dessous pour la valider.' : language === 'ar' ? 'حجزك مسجّل. اتبع التعليمات أدناه لإتمامه.' : 'Your booking is registered. Follow the instructions below to complete it.'}
            </p>

            {/* Confirmation code */}
            <div className="mt-4 inline-flex items-center gap-3 bg-white/15 border border-white/30 rounded-xl px-4 py-3">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wide mb-0.5">
                  {language === 'fr' ? 'Code de confirmation' : language === 'ar' ? 'كود التأكيد' : 'Confirmation Code'}
                </p>
                <p className="font-mono text-xl font-bold tracking-widest" dir="ltr">{booking.confirmationCode}</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(booking.confirmationCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                title="Copier"
              >
                {copied ? <Check size={14} className="text-green-300" /> : <Copy size={14} className="text-white" />}
              </button>
            </div>
          </div>

          {/* ── Primary CTA: Imprimer ── */}
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-3 bg-primary-700 hover:bg-primary-800 active:scale-[.99] text-white px-5 py-4 rounded-2xl text-base font-semibold transition-all shadow-sm"
          >
            <Printer size={18} />
            {language === 'fr' ? 'Imprimer le bon de réservation' : language === 'ar' ? 'طباعة وثيقة الحجز' : 'Print booking receipt'}
          </button>

          {/* ── Next step: Payment instructions ── */}
          <Card>
            <div className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 ${meta.color} border-l-4`}>
              <div className="flex items-center gap-2.5">
                <meta.icon size={16} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    {language === 'fr' ? 'Prochaine étape' : language === 'ar' ? 'الخطوة التالية' : 'Next step'}
                  </p>
                  <p className="text-sm font-bold">{meta.label}</p>
                </div>
              </div>
              <span className="text-lg font-bold" dir="ltr">
                {parseFloat(booking.totalPrice).toFixed(2)} <span className="text-sm font-medium opacity-70">{currency}</span>
              </span>
            </div>
            <div className="p-5">
              <PaymentInstructions />
            </div>
          </Card>

          {/* ── Booking summary ── */}
          <Card>
            <CardHeader icon={FileText} title={language === 'fr' ? 'Récapitulatif de la réservation' : language === 'ar' ? 'ملخص الحجز' : 'Booking Summary'} />
            <div className="p-5 space-y-4">

              {/* Dates & nights */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{language === 'fr' ? 'Arrivée' : language === 'ar' ? 'الوصول' : 'Check-in'}</p>
                  <p className="text-xs font-bold text-gray-900">{fmt(booking.hotelBooking.CheckIn)}</p>
                </div>
                <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-primary-500 uppercase tracking-wide mb-1">
                    <Moon size={10} className="inline mr-0.5" />{language === 'fr' ? 'Nuits' : language === 'ar' ? 'ليالي' : 'Nights'}
                  </p>
                  <p className="text-xl font-bold text-primary-700">{nights}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{language === 'fr' ? 'Départ' : language === 'ar' ? 'المغادرة' : 'Check-out'}</p>
                  <p className="text-xs font-bold text-gray-900">{fmt(booking.hotelBooking.CheckOut)}</p>
                </div>
              </div>

              {/* Room / boarding / guests */}
              <div className="divide-y divide-gray-50">
                <Row label={language === 'fr' ? 'Chambre' : language === 'ar' ? 'الغرفة' : 'Room'} value={`#${room.Id}`} mono />
                <Row
                  label={language === 'fr' ? 'Pension' : language === 'ar' ? 'الإقامة' : 'Board'}
                  value={room.Boarding}
                />
                <Row
                  label={language === 'fr' ? 'Voyageurs' : language === 'ar' ? 'المسافرون' : 'Guests'}
                  value={`${adults.length} ${language === 'fr' ? 'adulte(s)' : language === 'ar' ? 'بالغ' : 'adult(s)'}${children.length > 0 ? ` + ${children.length} ${language === 'fr' ? 'enfant(s)' : language === 'ar' ? 'طفل' : 'child(ren)'}` : ''}`}
                />
              </div>

              {/* Holder */}
              {holder && (
                <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">{language === 'fr' ? 'Titulaire' : language === 'ar' ? 'صاحب الحجز' : 'Holder'}</p>
                    <p className="text-sm font-semibold text-gray-900">{holder.Civility} {holder.Name} {holder.Surname}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ── Contact + total ── */}
          <Card>
            <CardHeader icon={Mail} title={language === 'fr' ? 'Contact & Montant' : language === 'ar' ? 'التواصل والمبلغ' : 'Contact & Amount'} />
            <div className="p-5 space-y-3">
              {booking.isGuest && booking.guestInfo?.name && (
                <Row label={language === 'fr' ? 'Nom' : language === 'ar' ? 'الاسم' : 'Name'} value={booking.guestInfo.name} />
              )}
              {booking.contactEmail && (
                <Row label="Email" value={booking.contactEmail} />
              )}
              {booking.contactPhone && (
                <Row label={language === 'fr' ? 'Téléphone' : language === 'ar' ? 'الهاتف' : 'Phone'} value={booking.contactPhone} />
              )}
              <div className={`flex items-center justify-between pt-3 mt-2 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <p className="text-xs text-gray-400">{language === 'fr' ? 'Montant total' : language === 'ar' ? 'المبلغ الإجمالي' : 'Total amount'}</p>
                <p className="text-xl font-bold text-primary-700" dir="ltr">
                  {parseFloat(booking.totalPrice).toFixed(2)} <span className="text-sm font-medium text-gray-400">{currency}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* ── Notes ── */}
          {booking.notes && (
            <Card>
              <CardHeader icon={FileText} title={language === 'fr' ? 'Demandes spéciales' : language === 'ar' ? 'طلبات خاصة' : 'Special Requests'} />
              <div className="px-5 py-4">
                <p className="text-sm text-gray-600 italic">{booking.notes}</p>
              </div>
            </Card>
          )}

          {/* ── Secondary actions ── */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            <button onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium transition-colors">
              <Home size={15} /> {language === 'fr' ? 'Accueil' : language === 'ar' ? 'الرئيسية' : 'Home'}
            </button>

            {isGuest ? (
              <button onClick={() => navigate('/guest-booking-lookup')}
                className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium transition-colors">
                <ArrowRight size={15} /> {language === 'fr' ? 'Suivre la réservation' : language === 'ar' ? 'تتبع الحجز' : 'Track booking'}
              </button>
            ) : (
              <button onClick={() => navigate('/my-bookings')}
                className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium transition-colors">
                <FileText size={15} /> {language === 'fr' ? 'Mes réservations' : language === 'ar' ? 'حجوزاتي' : 'My bookings'}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default BookingConfirmation;
