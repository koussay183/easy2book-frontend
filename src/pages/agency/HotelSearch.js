import React, { useState, useEffect, useRef } from 'react';
import {
  Search, MapPin, Star, ArrowLeft, Building2, Tag,
  CheckCircle, AlertCircle, Loader2, ChevronRight,
  Check, RefreshCw, Users, Calendar, Utensils, Baby, ThumbsUp, Hotel,
} from 'lucide-react';
import { useAgency }   from '../../context/AgencyContext';
import { useLanguage } from '../../context/LanguageContext';
import DateRangePicker from '../../components/DateRangePicker';
import GuestSelector   from '../../components/landing/GuestSelector';
import { API_ENDPOINTS } from '../../config/api';

// ── Design System tokens (Easy2Book) ──────────────────────────────────────────
const DS = {
  primary700:  '#002d5f',   // main accent — buttons, filled icons, selected states
  primary800:  '#001d3f',   // button hover
  primary600:  '#003d78',   // active/focus borders
  primary50:   '#e6eef5',   // light tint backgrounds
  primary100:  '#ccdcea',   // tint borders
  gray50:      '#f9fafb',
  gray100:     '#f3f4f6',
  gray200:     '#e5e7eb',
  gray300:     '#d1d5db',
  gray400:     '#9ca3af',
  gray500:     '#6b7280',
  gray600:     '#4b5563',
  gray700:     '#374151',
  gray900:     '#111827',
  star:        '#ffeb85',   // secondary-400
  shadow:      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowBtn:   '0 4px 12px rgba(0,45,95,0.25)',
  ring:        '0 0 0 3px rgba(0,45,95,0.10)',
};

// ── City list ─────────────────────────────────────────────────────────────────
const CITIES = [
  { id: 10,   name: 'Hammamet',         region: 'Cap Bon',         country: 'Tunisie' },
  { id: 11,   name: 'Nabeul',           region: 'Cap Bon',         country: 'Tunisie' },
  { id: 12,   name: 'Kelibia',          region: 'Cap Bon',         country: 'Tunisie' },
  { id: 13,   name: 'Korba',            region: 'Cap Bon',         country: 'Tunisie' },
  { id: 17,   name: 'Kairouan',         region: 'Centre',          country: 'Tunisie' },
  { id: 18,   name: 'Djerba',           region: 'Djerba & Zarzis', country: 'Tunisie' },
  { id: 19,   name: 'Zarzis',           region: 'Djerba & Zarzis', country: 'Tunisie' },
  { id: 20,   name: 'Douz',             region: 'Djerid',          country: 'Tunisie' },
  { id: 23,   name: 'Ksar Ghilane',     region: 'Djerid',          country: 'Tunisie' },
  { id: 31,   name: 'Ain Drahem',       region: 'Nord',            country: 'Tunisie' },
  { id: 32,   name: 'Tunis',            region: 'Tunis',           country: 'Tunisie' },
  { id: 33,   name: 'Tabarka',          region: 'Tabarka',         country: 'Tunisie' },
  { id: 34,   name: 'Sousse',           region: 'Sahel',           country: 'Tunisie' },
  { id: 35,   name: 'Mahdia',           region: 'Sahel',           country: 'Tunisie' },
  { id: 37,   name: 'Monastir',         region: 'Sahel',           country: 'Tunisie' },
  { id: 39,   name: 'Sfax',             region: 'Sfax',            country: 'Tunisie' },
  { id: 47,   name: 'Tozeur',           region: 'Djerid',          country: 'Tunisie' },
  { id: 48,   name: 'Bizerte',          region: 'Nord',            country: 'Tunisie' },
  { id: 54,   name: 'Gafsa',            region: 'Sud',             country: 'Tunisie' },
  { id: 55,   name: 'Gabes',            region: 'Sud',             country: 'Tunisie' },
  { id: 70,   name: 'Tataouine',        region: 'Sud',             country: 'Tunisie' },
  { id: 73,   name: 'Matmata',          region: 'Sud',             country: 'Tunisie' },
  { id: 75,   name: 'Nefta',            region: 'Djerid',          country: 'Tunisie' },
  { id: 6482, name: 'El Jem',           region: 'Sahel',           country: 'Tunisie' },
  { id: 6485, name: 'Gammarth',         region: 'Grand Tunis',     country: 'Tunisie' },
  { id: 6488, name: 'Istanbul',         region: '',                country: 'Turquie' },
];

const BOARDING_NAMES = {
  '1': 'Chambre seule', '2': 'Petit-déjeuner', '3': 'Demi-pension',
  '4': 'Pension complète', '5': 'Tout inclus',
  RO: 'Chambre seule', BB: 'Petit-déjeuner', HB: 'Demi-pension',
  FB: 'Pension complète', AI: 'Tout inclus', SC: 'Chambre seule',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt        = n  => new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n ?? 0);
const todayStr   = () => new Date().toISOString().slice(0, 10);
const tmrwStr    = () => new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const nightCount = (ci, co) => Math.max(1, Math.ceil((new Date(co) - new Date(ci)) / 86400000));
const bName      = id => BOARDING_NAMES[String(id)] || 'Pension';

const getMinPrice = hotel => {
  let min = { clientPrice: Infinity, supplierPrice: 0, markupAmount: 0 };
  (hotel.SearchData?.Price?.Boarding || []).forEach(b =>
    (b.Pax || []).forEach(p =>
      (p.Rooms || []).forEach(r => {
        const cp = parseFloat(r.Price || 0);
        if (cp > 0 && cp < min.clientPrice)
          min = { clientPrice: cp, supplierPrice: parseFloat(r._supplierPrice || r.Price || 0), markupAmount: parseFloat(r._markupAmount || 0) };
      })
    )
  );
  return min.clientPrice === Infinity ? { clientPrice: 0, supplierPrice: 0, markupAmount: 0 } : min;
};

const getMinPricePerBoarding = (hotel, boardingId) => {
  const boarding = (hotel.SearchData?.Price?.Boarding || []).find(b => b.Id === boardingId);
  if (!boarding) return { clientPrice: 0, supplierPrice: 0, markupAmount: 0 };
  let min = { clientPrice: Infinity, supplierPrice: 0, markupAmount: 0 };
  (boarding.Pax || []).forEach(p =>
    (p.Rooms || []).forEach(r => {
      const cp = parseFloat(r.Price || 0);
      if (cp > 0 && cp < min.clientPrice)
        min = { clientPrice: cp, supplierPrice: parseFloat(r._supplierPrice || r.Price || 0), markupAmount: parseFloat(r._markupAmount || 0) };
    })
  );
  return min.clientPrice === Infinity ? { clientPrice: 0, supplierPrice: 0, markupAmount: 0 } : min;
};

const getBoardings = hotel => {
  const seen = new Set();
  return (hotel.SearchData?.Price?.Boarding || []).filter(b => {
    const key = b.Code || String(b.Id);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
};

const getRoomTypesForBoarding = (hotel, boardingId) => {
  const boarding = (hotel.SearchData?.Price?.Boarding || []).find(b => b.Id === boardingId);
  if (!boarding) return [];
  const seen = new Set(); const rooms = [];
  (boarding.Pax || []).forEach(p =>
    (p.Rooms || []).forEach(r => {
      if (!seen.has(r.Id)) {
        seen.add(r.Id);
        rooms.push({ roomId: r.Id, roomName: r.Name || 'Chambre standard', price: parseFloat(r.Price || 0), supplierPrice: parseFloat(r._supplierPrice || r.Price || 0), markupAmount: parseFloat(r._markupAmount || 0) });
      }
    })
  );
  return rooms;
};

// ── Small shared components ───────────────────────────────────────────────────
function StarsRow({ count, showLabel }) {
  const n = Math.min(5, Math.max(0, count || 0));
  if (!n) return null;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={12} fill={i < n ? DS.star : 'none'} color={i < n ? '#d6a800' : DS.gray300} />
      ))}
      {showLabel && <span style={{ fontSize: 12, color: DS.gray400, marginLeft: 4 }}>{n} étoiles</span>}
    </div>
  );
}

function BackBtn({ onClick, label = 'Retour' }) {
  return (
    <button onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: DS.gray500, fontSize: 13, fontWeight: 500, padding: '4px 0', marginBottom: 20, fontFamily: 'inherit' }}
      onMouseEnter={e => e.currentTarget.style.color = DS.primary700}
      onMouseLeave={e => e.currentTarget.style.color = DS.gray500}
    ><ArrowLeft size={15} />{label}</button>
  );
}

function PriceDisplay({ clientPrice, supplierPrice, markupAmount, markupEnabled, size = 'md' }) {
  const fs = size === 'lg' ? 22 : 17;
  return (
    <div style={{ textAlign: 'right' }}>
      {markupEnabled && markupAmount > 0 && (
        <div style={{ fontSize: 11, color: DS.gray400, textDecoration: 'line-through', marginBottom: 1 }}>
          {fmt(supplierPrice)} TND
        </div>
      )}
      <div style={{ fontSize: fs, fontWeight: 800, color: DS.primary700, lineHeight: 1.1 }}>
        {fmt(clientPrice)} <span style={{ fontSize: 11, fontWeight: 400, color: DS.gray400 }}>TND</span>
      </div>
      {markupEnabled && markupAmount > 0 && (
        <div style={{ marginTop: 3, fontSize: 11, color: '#065f46', background: '#d1fae5', padding: '2px 7px', borderRadius: 20, fontWeight: 700, display: 'inline-block' }}>
          +{fmt(markupAmount)} TND marge
        </div>
      )}
    </div>
  );
}

// ── B2B Agency Hotel Card ─────────────────────────────────────────────────────
function AgencyHotelCard({ hotel, nightsCount, cityName, markupEnabled, onChoose }) {
  const [imgErr, setImgErr] = useState(false);
  const { clientPrice, supplierPrice, markupAmount } = getMinPrice(hotel);
  const stars      = hotel.Stars || hotel.Category?.Star || 0;
  const boardings  = getBoardings(hotel);
  const facilities = (hotel.Facilities || []).slice(0, 3);
  const freeChild  = hotel.SearchData?.FreeChild;
  const hasFreeChild  = Array.isArray(freeChild) && freeChild.length > 0;
  const recommended   = hotel.SearchData?.Recommended;
  const location = hotel.Adress || [hotel.City?.Name, hotel.City?.Country?.Name].filter(Boolean).join(', ') || cityName;
  const imgSrc   = imgErr ? null : (hotel.Image || hotel.Images?.[0]?.Url || hotel.Images?.[0] || null);

  return (
    <div
      style={{ background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 16, overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s', boxShadow: DS.shadow }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,45,95,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = DS.shadow; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 175 }}>

        {/* Image */}
        <div style={{ width: 210, minWidth: 210, flexShrink: 0, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${DS.primary50}, ${DS.primary100})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {imgSrc
            ? <img src={imgSrc} alt={hotel.Name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={() => setImgErr(true)} />
            : <Building2 size={40} color={DS.primary100} />}
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          {/* Name */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: DS.gray900, lineHeight: 1.3 }}>{hotel.Name}</span>
          </div>

          {/* Stars */}
          <StarsRow count={stars} showLabel />

          {/* Location */}
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: DS.gray500, fontSize: 13 }}>
              <MapPin size={12} color={DS.gray400} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{location}</span>
            </div>
          )}

          {/* Boarding pills */}
          {boardings.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              <Utensils size={12} color={DS.gray400} />
              {boardings.map(b => (
                <span key={b.Id} title={b.Name || bName(b.Id)}
                  style={{ fontSize: 11, fontWeight: 700, background: DS.gray50, color: DS.gray600, border: `1px solid ${DS.gray200}`, padding: '2px 8px', borderRadius: 8 }}>
                  {b.Code || String(b.Id)}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
            {/* Free child */}
            {hasFreeChild && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: DS.primary50, color: DS.primary700, border: `1px solid ${DS.primary100}`, padding: '2px 9px', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                <Baby size={11} /> 1er bébé gratuit (≤{freeChild[0].Age} ans)
              </span>
            )}
            {/* Recommended */}
            {recommended >= 1 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: DS.primary50, color: DS.primary700, border: `1px solid ${DS.primary100}`, padding: '2px 9px', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                <ThumbsUp size={11} /> Recommandé
              </span>
            )}
          </div>

          {/* Facilities */}
          {facilities.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {facilities.map((f, i) => (
                <span key={i} style={{ fontSize: 11, color: DS.gray500, background: DS.gray50, border: `1px solid ${DS.gray200}`, padding: '2px 9px', borderRadius: 8 }}>
                  {f.Title}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* B2B Price panel */}
        <div style={{ width: 180, minWidth: 180, flexShrink: 0, borderLeft: `1px solid ${DS.gray100}`, background: DS.gray50, padding: '18px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {clientPrice > 0 ? (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: DS.gray400, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>À partir de</div>
              {markupEnabled && markupAmount > 0 && (
                <div style={{ fontSize: 12, color: DS.gray400, textDecoration: 'line-through', marginBottom: 2 }}>{fmt(supplierPrice)} TND</div>
              )}
              <div style={{ fontSize: 22, fontWeight: 800, color: DS.primary700, lineHeight: 1 }}>{fmt(clientPrice)} <span style={{ fontSize: 12, fontWeight: 400, color: DS.gray400 }}>TND</span></div>
              {markupEnabled && markupAmount > 0 && (
                <div style={{ marginTop: 4, fontSize: 11, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 20, fontWeight: 700, display: 'inline-block' }}>+{fmt(markupAmount)} TND marge</div>
              )}
              <div style={{ fontSize: 11, color: DS.gray400, marginTop: 5 }}>pour {nightsCount} nuit{nightsCount > 1 ? 's' : ''}</div>
            </div>
          ) : <span style={{ fontSize: 13, color: DS.gray400 }}>Prix sur demande</span>}

          <button onClick={onChoose}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: DS.primary700, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: DS.shadowBtn, transition: 'all 0.15s', marginTop: 12, whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = DS.primary800; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = DS.primary700; e.currentTarget.style.transform = 'translateY(0)'; }}
          >Choisir <ChevronRight size={13} /></button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function HotelSearch() {
  const { agency, agencyFetch } = useAgency();
  const { language }            = useLanguage();
  const markup                  = agency?.markup;
  const markupEnabled           = !!markup?.enabled;

  // ── Step ───────────────────────────────────────────────────────────────────
  const [step, setStep] = useState('search');

  // ── Destination & hotel list ────────────────────────────────────────────────
  const [cityId,               setCityId]               = useState('');
  const [cityName,             setCityName]             = useState('');
  const [cityQuery,            setCityQuery]            = useState('');
  const [showDrop,             setShowDrop]             = useState(false);
  const [selectedSpecificHotel,setSelectedSpecificHotel]= useState(null); // hotel Id to filter on
  const [hotelsList,           setHotelsList]           = useState([]);
  const [loadingHotels,        setLoadingHotels]        = useState(true);
  const [filteredResults,      setFilteredResults]      = useState([]);   // [{city, hotels:[]}]
  const destRef = useRef(null);

  // Fetch hotel catalogue once (public endpoint — no auth required)
  useEffect(() => {
    fetch(API_ENDPOINTS.MYGO_HOTELS)
      .then(r => r.json())
      .then(json => {
        const list = json?.data?.ListHotel;
        if (Array.isArray(list)) setHotelsList(list.map(h => ({ Id: h.Id, Name: h.Name, City: h.City })));
        setLoadingHotels(false);
      })
      .catch(() => setLoadingHotels(false));
  }, []);

  // Build grouped city→hotels dropdown whenever query or catalogue changes
  useEffect(() => {
    const byCity = {};
    hotelsList.forEach(h => { const cid = h.City?.Id; if (cid != null) { if (!byCity[cid]) byCity[cid] = []; byCity[cid].push(h); } });
    const q = cityQuery.trim().toLowerCase();
    if (!q) {
      setFilteredResults(CITIES.slice(0, 10).map(city => ({ city, hotels: (byCity[city.id] || []).slice(0, 3) })));
      return;
    }
    const results = []; const seen = new Set();
    CITIES.forEach(city => {
      if (city.name.toLowerCase().includes(q) || city.region.toLowerCase().includes(q)) {
        seen.add(city.id);
        results.push({ city, hotels: (byCity[city.id] || []).slice(0, 5) });
      }
    });
    hotelsList.filter(h => h.Name?.toLowerCase().includes(q)).forEach(h => {
      const cid = h.City?.Id;
      if (cid == null || seen.has(cid)) return;
      seen.add(cid);
      const cityObj = CITIES.find(c => c.id === cid) || { id: cid, name: h.City?.Name || '', region: '', country: '' };
      results.push({ city: cityObj, hotels: (byCity[cid] || []).filter(x => x.Name?.toLowerCase().includes(q)).slice(0, 5) });
    });
    setFilteredResults(results);
  }, [cityQuery, hotelsList]);

  // Close dropdown on outside click
  useEffect(() => {
    const h = e => { if (destRef.current && !destRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleCitySelect = city => {
    setCityId(city.id); setCityName(city.name); setCityQuery(city.name);
    setSelectedSpecificHotel(null); setShowDrop(false);
  };
  const handleHotelSelect = hotel => {
    setCityId(hotel.City?.Id); setCityName(hotel.City?.Name || ''); setCityQuery(hotel.Name);
    setSelectedSpecificHotel(hotel.Id); setShowDrop(false);
  };

  // ── Dates & guests ─────────────────────────────────────────────────────────
  const [checkIn,    setCheckIn]   = useState(todayStr());
  const [checkOut,   setCheckOut]  = useState(tmrwStr());
  const [rooms,      setRooms]     = useState(1);
  const [roomsCfg,   setRoomsCfg]  = useState([{ adults: 2, children: [] }]);
  const [showGuests, setShowGuests]= useState(false);

  // ── Results ────────────────────────────────────────────────────────────────
  const [hotels,   setHotels]   = useState([]);
  const [sLoading, setSLoading] = useState(false);
  const [sError,   setSError]   = useState('');

  // ── Selection ──────────────────────────────────────────────────────────────
  const [selectedHotel,     setSelectedHotel]     = useState(null);
  const [selectedBoarding,  setSelectedBoarding]  = useState(null);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);

  // ── Booking form ───────────────────────────────────────────────────────────
  const [pax,      setPax]      = useState([{ civility: 'Mr', name: '', surname: '', holder: true }]);
  const [childPax, setChildPax] = useState([]);
  const [notes,    setNotes]    = useState('');
  const [bLoading, setBLoading] = useState(false);
  const [bError,   setBError]   = useState('');
  const [confirmed,setConfirmed]= useState(null);

  // Sync pax with rooms config
  useEffect(() => {
    const totalAdults = roomsCfg.reduce((s, r) => s + r.adults, 0);
    const allAges     = roomsCfg.flatMap(r => r.children);
    setPax(prev => Array(totalAdults).fill(null).map((_, i) =>
      i === 0 ? { civility: (prev[0]?.civility || 'Mr'), name: (prev[0]?.name || ''), surname: (prev[0]?.surname || ''), holder: true }
              : prev[i] || { civility: 'Mr', name: '', surname: '', holder: false }
    ));
    setChildPax(prev => allAges.map((age, i) => prev[i] || { name: '', surname: '', age: String(age) }));
  }, [roomsCfg]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalAdults    = roomsCfg.reduce((s, r) => s + r.adults, 0);
  const totalChildren  = roomsCfg.reduce((s, r) => s + r.children.length, 0);
  const nightsCount    = nightCount(checkIn, checkOut);
  const availCredit    = (agency?.creditBalance || 0) + (agency?.creditLimit || 0);
  const guestLabel     = `${totalAdults} adulte${totalAdults > 1 ? 's' : ''} · ${rooms} chambre${rooms > 1 ? 's' : ''}${totalChildren > 0 ? ` · ${totalChildren} enfant${totalChildren > 1 ? 's' : ''}` : ''}`;
  const allRoomsSelected = selectedBoarding && selectedRoomTypes.length > 0 && selectedRoomTypes.every(rt => rt !== null);
  const totalClientPrice   = selectedRoomTypes.reduce((s, rt) => s + (rt?.price         || 0), 0);
  const totalSupplierPrice = selectedRoomTypes.reduce((s, rt) => s + (rt?.supplierPrice  || 0), 0);
  const totalMarkupAmount  = selectedRoomTypes.reduce((s, rt) => s + (rt?.markupAmount   || 0), 0);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePickHotel = hotel => {
    setSelectedHotel(hotel);
    setSelectedBoarding(null);
    setSelectedRoomTypes(Array(roomsCfg.length).fill(null));
    setStep('rooms');
  };

  const handleSearch = async e => {
    e.preventDefault();
    if (!cityId) { setSError('Veuillez sélectionner une destination'); return; }
    const roomsParam = roomsCfg.map(r => ({ Adult: r.adults, Child: r.children }));
    setSLoading(true); setSError(''); setHotels([]);
    try {
      const qs  = new URLSearchParams({ City: cityId, CheckIn: checkIn, CheckOut: checkOut, Rooms: JSON.stringify(roomsParam) });
      const res  = await agencyFetch(`${API_ENDPOINTS.AGENCY_HOTELS_SEARCH}?${qs}`);
      const data = await res.json();
      if (data.status === 'success') {
        let list = data.data?.ListHotel || [];
        // if user picked a specific hotel, filter to only that property
        if (selectedSpecificHotel) list = list.filter(h => h.Id === selectedSpecificHotel);
        setHotels(list);
        // when exactly one hotel is matched (specific hotel was selected), skip results list
        if (list.length === 1 && selectedSpecificHotel) {
          handlePickHotel(list[0]);
        } else {
          setStep('results');
        }
      } else { setSError(data.message || 'Erreur lors de la recherche'); }
    } catch { setSError('Erreur réseau. Réessayez.'); }
    finally { setSLoading(false); }
  };

  const handlePickBoarding = boarding => {
    setSelectedBoarding(boarding);
    setSelectedRoomTypes(Array(roomsCfg.length).fill(null));
  };

  const handlePickRoomType = (roomIdx, rt) => {
    setSelectedRoomTypes(prev => {
      const next = [...prev];
      next[roomIdx] = prev[roomIdx]?.roomId === rt.roomId ? null : rt;
      return next;
    });
  };

  const handleBook = async () => {
    if (pax.some(p => !p.name || !p.surname)) { setBError('Remplissez tous les noms et prénoms'); return; }
    setBLoading(true); setBError('');
    let aIdx = 0, cIdx = 0;
    const payloadRooms = roomsCfg.map((rc, i) => {
      const rt = selectedRoomTypes[i];
      const ra = pax.slice(aIdx, aIdx + rc.adults); aIdx += rc.adults;
      const rc2 = childPax.slice(cIdx, cIdx + rc.children.length); cIdx += rc.children.length;
      return { Id: rt.roomId, Boarding: String(selectedBoarding.Id), View: [], Supplement: [],
        Pax: { Adult: ra.map(a => ({ Civility: a.civility, Name: a.name, Surname: a.surname, Holder: !!a.holder })), ...(rc2.length > 0 && { Child: rc2.map(c => ({ Name: c.name, Surname: c.surname, Age: String(c.age) })) }) } };
    });
    const payload = { hotelBooking: { City: String(cityId), Hotel: selectedHotel.Id, CheckIn: checkIn, CheckOut: checkOut, Option: [], Source: selectedHotel.SearchData?.Source || 'local-2', Rooms: payloadRooms }, notes };
    try {
      const res  = await agencyFetch(API_ENDPOINTS.AGENCY_BOOKINGS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.status === 'success') { setConfirmed(data.data.booking || data.data); setStep('confirmed'); }
      else { setBError(data.message || 'Erreur lors de la réservation'); }
    } catch { setBError('Erreur réseau. Réessayez.'); }
    finally { setBLoading(false); }
  };

  const resetAll = () => {
    setStep('search'); setHotels([]);
    setSelectedHotel(null); setSelectedBoarding(null); setSelectedRoomTypes([]);
    setConfirmed(null); setBError(''); setSError('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: SEARCH
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'search') return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: DS.gray900, margin: '0 0 4px' }}>Recherche Hôtels</h1>
        <p style={{ fontSize: 13, color: DS.gray500, margin: 0 }}>Recherchez et réservez pour vos clients avec vos tarifs personnalisés.</p>
      </div>

      {markupEnabled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.primary50, border: `1px solid ${DS.primary100}`, borderRadius: 10, padding: '9px 14px', marginBottom: 20 }}>
          <Tag size={13} color={DS.primary700} />
          <span style={{ fontSize: 12, color: DS.primary700, fontWeight: 600 }}>
            Majoration active : {markup.type === 'percentage' ? `+${markup.value}%` : `+${fmt(markup.value)} TND`} — appliquée automatiquement
          </span>
        </div>
      )}

      {/* Search card */}
      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${DS.gray200}`, boxShadow: '0 2px 8px rgba(0,45,95,0.06)' }}>
        <form onSubmit={handleSearch} style={{ padding: '22px 22px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>

            {/* ── Destination ── */}
            <div ref={destRef} style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: DS.gray600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Destination</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} color={cityId ? DS.primary600 : DS.gray400}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
                <input
                  value={cityQuery}
                  onChange={e => { setCityQuery(e.target.value); setShowDrop(true); if (!e.target.value) { setCityId(''); setCityName(''); setSelectedSpecificHotel(null); } }}
                  onFocus={() => setShowDrop(true)}
                  placeholder="Ville, région ou hôtel…"
                  style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 11, paddingBottom: 11, border: `1.5px solid ${cityId ? DS.primary600 : DS.gray300}`, borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff', color: DS.gray900, transition: 'border-color 0.15s' }}
                  onFocus2={e => { e.target.style.borderColor = DS.primary600; e.target.style.boxShadow = DS.ring; }}
                  onBlurCapture={e => { if (!cityId) e.target.style.borderColor = DS.gray300; e.target.style.boxShadow = 'none'; }}
                />
                {/* Selected specific hotel tag */}
                {selectedSpecificHotel && (
                  <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: DS.primary50, border: `1px solid ${DS.primary100}`, color: DS.primary700, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6 }}>
                    Hôtel spécifique
                  </div>
                )}
              </div>

              {/* Rich grouped dropdown */}
              {showDrop && (filteredResults.length > 0 || loadingHotels) && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 1000, background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', maxHeight: 300, overflowY: 'auto' }}>
                  {/* Loading indicator */}
                  {loadingHotels && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: DS.primary50, borderBottom: `1px solid ${DS.primary100}` }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${DS.primary700}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: DS.primary700, fontWeight: 600 }}>Chargement des hôtels…</span>
                    </div>
                  )}

                  {filteredResults.map(({ city, hotels: cityHotels }) => (
                    <div key={city.id}>
                      {/* City row */}
                      <div
                        onMouseDown={() => handleCitySelect(city)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${DS.gray100}`, transition: 'background 0.1s', background: city.id === cityId && !selectedSpecificHotel ? DS.primary50 : 'transparent' }}
                        onMouseEnter={e => { if (!(city.id === cityId && !selectedSpecificHotel)) e.currentTarget.style.background = DS.gray50; }}
                        onMouseLeave={e => { if (!(city.id === cityId && !selectedSpecificHotel)) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: city.id === cityId && !selectedSpecificHotel ? DS.primary100 : DS.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <MapPin size={13} color={city.id === cityId && !selectedSpecificHotel ? DS.primary700 : DS.gray500} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: city.id === cityId && !selectedSpecificHotel ? DS.primary700 : DS.gray900 }}>{city.name}</div>
                          {(city.region || city.country) && (
                            <div style={{ fontSize: 11, color: DS.gray400 }}>
                              {city.region ? `${city.region}` : ''}{city.region && city.country ? ', ' : ''}{city.country}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: 10, color: DS.gray400, background: DS.gray100, padding: '2px 6px', borderRadius: 6, flexShrink: 0, fontWeight: 600 }}>VILLE</span>
                      </div>

                      {/* Hotel sub-rows */}
                      {loadingHotels ? [0, 1].map(i => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 8px 44px', borderBottom: `1px solid ${DS.gray50}`, background: DS.gray50 }}>
                          <div style={{ width: 10, height: 10, background: DS.gray200, borderRadius: 2, flexShrink: 0 }} />
                          <div style={{ height: 10, background: DS.gray200, width: i === 0 ? '55%' : '38%', borderRadius: 4 }} />
                        </div>
                      )) : cityHotels.map(h => (
                        <div
                          key={h.Id}
                          onMouseDown={() => handleHotelSelect(h)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 8px 44px', cursor: 'pointer', borderBottom: `1px solid ${DS.gray50}`, background: h.Id === selectedSpecificHotel ? DS.primary50 : DS.gray50, transition: 'background 0.1s' }}
                          onMouseEnter={e => { if (h.Id !== selectedSpecificHotel) e.currentTarget.style.background = DS.primary50; }}
                          onMouseLeave={e => { if (h.Id !== selectedSpecificHotel) e.currentTarget.style.background = DS.gray50; }}
                        >
                          <Hotel size={12} color={h.Id === selectedSpecificHotel ? DS.primary700 : DS.gray400} style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: h.Id === selectedSpecificHotel ? DS.primary700 : DS.gray700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: h.Id === selectedSpecificHotel ? 600 : 400 }}>{h.Name}</span>
                          {h.Id === selectedSpecificHotel && <Check size={11} color={DS.primary700} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Dates ── */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: DS.gray600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                <Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />Dates du séjour
              </label>
              <DateRangePicker checkIn={checkIn} checkOut={checkOut} onChange={({ checkIn: ci, checkOut: co }) => { setCheckIn(ci); setCheckOut(co); }} language={language} minDate={todayStr()} variant="default" />
            </div>

            {/* ── Guests ── */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: DS.gray600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                <Users size={10} style={{ display: 'inline', marginRight: 4 }} />Voyageurs
              </label>
              <button type="button" onClick={() => setShowGuests(true)}
                style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${DS.gray300}`, borderRadius: 10, fontSize: 13, cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', gap: 8, color: DS.gray700, fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = DS.gray400}
                onMouseLeave={e => e.currentTarget.style.borderColor = DS.gray300}
              >
                <Users size={14} color={DS.gray400} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guestLabel}</span>
              </button>
            </div>

            {/* ── Search button ── */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'transparent', letterSpacing: '0.06em', marginBottom: 6 }}>_</label>
              <button type="submit" disabled={sLoading}
                style={{ padding: '11px 24px', background: sLoading ? DS.gray300 : DS.primary700, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: sLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', fontFamily: 'inherit', boxShadow: sLoading ? 'none' : DS.shadowBtn, transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!sLoading) { e.currentTarget.style.background = DS.primary800; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { if (!sLoading) { e.currentTarget.style.background = DS.primary700; e.currentTarget.style.transform = 'translateY(0)'; } }}
              >
                {sLoading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />Recherche…</> : <><Search size={15} />Rechercher</>}
              </button>
            </div>
          </div>

          {sError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '9px 14px', marginTop: 14, fontSize: 13, color: '#b91c1c' }}>
              <AlertCircle size={14} />{sError}
            </div>
          )}
        </form>
      </div>

      {showGuests && <GuestSelector rooms={rooms} setRooms={setRooms} roomsConfig={roomsCfg} setRoomsConfig={setRoomsCfg} showGuestSelector={showGuests} setShowGuestSelector={setShowGuests} />}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: RESULTS
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'results') return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <BackBtn onClick={() => setStep('search')} label="Modifier la recherche" />

      {markupEnabled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.primary50, border: `1px solid ${DS.primary100}`, borderRadius: 9, padding: '8px 14px', marginBottom: 16 }}>
          <Tag size={12} color={DS.primary700} />
          <span style={{ fontSize: 12, color: DS.primary700, fontWeight: 600 }}>
            Majoration {markup.type === 'percentage' ? `+${markup.value}%` : `+${fmt(markup.value)} TND`} appliquée — les prix affichés sont les tarifs client
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: DS.gray900, margin: '0 0 3px' }}>
            {hotels.length} hôtel{hotels.length !== 1 ? 's' : ''} disponible{hotels.length !== 1 ? 's' : ''}
          </h2>
          <p style={{ fontSize: 13, color: DS.gray500, margin: 0 }}>{cityName} · {nightsCount} nuit{nightsCount > 1 ? 's' : ''} · {guestLabel}</p>
        </div>
        <button onClick={resetAll}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: DS.gray600, fontFamily: 'inherit', transition: 'border-color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = DS.gray400}
          onMouseLeave={e => e.currentTarget.style.borderColor = DS.gray200}
        ><RefreshCw size={12} /> Nouvelle recherche</button>
      </div>

      {hotels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 14, border: `1px solid ${DS.gray200}` }}>
          <div style={{ width: 56, height: 56, background: DS.gray100, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Search size={24} color={DS.gray400} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: DS.gray700, marginBottom: 5 }}>Aucun hôtel disponible</div>
          <div style={{ fontSize: 13, color: DS.gray400 }}>Essayez d'autres dates ou une autre destination</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {hotels.map((hotel, idx) => (
            <AgencyHotelCard key={hotel.Id || idx} hotel={hotel} nightsCount={nightsCount} cityName={cityName} markupEnabled={markupEnabled} onChoose={() => handlePickHotel(hotel)} />
          ))}
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: ROOMS — pension + room type selection
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'rooms') {
    const boardings = getBoardings(selectedHotel);
    const imgSrc    = selectedHotel.Image || selectedHotel.Images?.[0]?.Url || selectedHotel.Images?.[0] || null;

    return (
      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        <BackBtn onClick={() => { setStep('results'); setSelectedBoarding(null); setSelectedRoomTypes([]); }} label="Retour aux résultats" />

        {/* Hotel summary */}
        <div style={{ background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: `linear-gradient(135deg, ${DS.primary50}, ${DS.primary100})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imgSrc ? <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={22} color={DS.primary100} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: DS.gray900, marginBottom: 4 }}>{selectedHotel.Name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <StarsRow count={selectedHotel.Stars || selectedHotel.Category?.Star} />
              <span style={{ fontSize: 12, color: DS.gray400 }}>·</span>
              <span style={{ fontSize: 12, color: DS.gray500, display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{selectedHotel.City?.Name || cityName}</span>
              <span style={{ fontSize: 12, color: DS.gray400 }}>·</span>
              <span style={{ fontSize: 12, color: DS.gray500 }}>{nightsCount} nuit{nightsCount > 1 ? 's' : ''} · {guestLabel}</span>
            </div>
          </div>
        </div>

        {/* Step 1 — Pension */}
        <div style={{ background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 14, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${DS.gray100}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: selectedBoarding ? DS.primary700 : DS.primary700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
              {selectedBoarding ? <Check size={12} /> : '1'}
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: DS.gray900 }}>Choisissez la pension</div>
              <div style={{ fontSize: 12, color: DS.gray400 }}>Commune à toutes les chambres</div>
            </div>
          </div>

          <div style={{ padding: '16px 18px' }}>
            {boardings.length === 0
              ? <p style={{ color: DS.gray400, fontSize: 13 }}>Aucune pension disponible</p>
              : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {boardings.map(b => {
                    const bp = getMinPricePerBoarding(selectedHotel, b.Id);
                    const isActive = selectedBoarding?.Id === b.Id;
                    return (
                      <div key={b.Id} onClick={() => handlePickBoarding(b)}
                        style={{ background: isActive ? DS.primary50 : '#fff', border: `2px solid ${isActive ? DS.primary600 : DS.gray200}`, borderRadius: 12, padding: '12px 16px', cursor: 'pointer', minWidth: 130, position: 'relative', transition: 'all 0.15s', boxShadow: isActive ? DS.ring : 'none' }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = DS.gray300; e.currentTarget.style.background = DS.gray50; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = DS.gray200; e.currentTarget.style.background = '#fff'; } }}
                      >
                        {isActive && (
                          <div style={{ position: 'absolute', top: 8, right: 8, width: 17, height: 17, borderRadius: '50%', background: DS.primary700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={10} color="#fff" />
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                          <Utensils size={12} color={isActive ? DS.primary700 : DS.gray500} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? DS.primary700 : DS.gray700 }}>{b.Name || bName(b.Id)}</span>
                        </div>
                        {b.Code && (
                          <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, background: isActive ? DS.primary100 : DS.gray100, color: isActive ? DS.primary700 : DS.gray500, padding: '1px 6px', borderRadius: 5, marginBottom: 8, letterSpacing: '0.04em' }}>{b.Code}</span>
                        )}
                        {bp.clientPrice > 0 && (
                          <div>
                            {markupEnabled && bp.markupAmount > 0 && <div style={{ fontSize: 11, color: DS.gray400, textDecoration: 'line-through' }}>{fmt(bp.supplierPrice)} TND</div>}
                            <div style={{ fontSize: 16, fontWeight: 800, color: DS.primary700 }}>{fmt(bp.clientPrice)} <span style={{ fontSize: 11, fontWeight: 400, color: DS.gray400 }}>TND</span></div>
                            {markupEnabled && bp.markupAmount > 0 && <div style={{ fontSize: 10, background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: 20, fontWeight: 700, display: 'inline-block', marginTop: 3 }}>+{fmt(bp.markupAmount)} marge</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>

        {/* Step 2 — Room types per room */}
        {selectedBoarding && (
          <div style={{ background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${DS.gray100}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: allRoomsSelected ? DS.primary700 : DS.primary700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                {allRoomsSelected ? <Check size={12} /> : '2'}
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: DS.gray900 }}>Type de chambre</div>
                <div style={{ fontSize: 12, color: DS.gray400 }}>
                  Pension : <strong style={{ color: DS.primary700 }}>{selectedBoarding.Name || bName(selectedBoarding.Id)}</strong>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {roomsCfg.map((rc, roomIdx) => {
                const roomTypes = getRoomTypesForBoarding(selectedHotel, selectedBoarding.Id);
                const chosen    = selectedRoomTypes[roomIdx];
                return (
                  <div key={roomIdx}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: DS.gray700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: chosen ? DS.primary700 : DS.gray200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {chosen ? <Check size={11} color="#fff" /> : <span style={{ fontSize: 10, color: DS.gray500, fontWeight: 800 }}>{roomIdx + 1}</span>}
                      </div>
                      Chambre {roomIdx + 1}
                      {roomsCfg.length > 1 && <span style={{ color: DS.gray400 }}>— {rc.adults} adulte{rc.adults > 1 ? 's' : ''}{rc.children.length > 0 ? ` · ${rc.children.length} enfant${rc.children.length > 1 ? 's' : ''}` : ''}</span>}
                      {chosen && <span style={{ fontSize: 12, color: DS.primary700, fontWeight: 600 }}>· {chosen.roomName}</span>}
                    </div>
                    {roomTypes.length === 0
                      ? <p style={{ color: DS.gray400, fontSize: 13 }}>Aucun type disponible</p>
                      : (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {roomTypes.map(rt => {
                            const isChosen = chosen?.roomId === rt.roomId;
                            return (
                              <div key={rt.roomId} onClick={() => handlePickRoomType(roomIdx, rt)}
                                style={{ background: isChosen ? DS.primary50 : '#fff', border: `2px solid ${isChosen ? DS.primary600 : DS.gray200}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', minWidth: 140, position: 'relative', transition: 'all 0.15s', boxShadow: isChosen ? DS.ring : 'none' }}
                                onMouseEnter={e => { if (!isChosen) { e.currentTarget.style.borderColor = DS.gray300; e.currentTarget.style.background = DS.gray50; } }}
                                onMouseLeave={e => { if (!isChosen) { e.currentTarget.style.borderColor = DS.gray200; e.currentTarget.style.background = '#fff'; } }}
                              >
                                {isChosen && (
                                  <div style={{ position: 'absolute', top: 7, right: 7, width: 15, height: 15, borderRadius: '50%', background: DS.primary700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={9} color="#fff" />
                                  </div>
                                )}
                                <div style={{ fontSize: 13, fontWeight: 600, color: isChosen ? DS.primary700 : DS.gray800, marginBottom: 6, paddingRight: isChosen ? 18 : 0, lineHeight: 1.3 }}>{rt.roomName}</div>
                                {markupEnabled && rt.markupAmount > 0 && <div style={{ fontSize: 11, color: DS.gray400, textDecoration: 'line-through' }}>{fmt(rt.supplierPrice)} TND</div>}
                                <div style={{ fontSize: 16, fontWeight: 800, color: DS.primary700 }}>{fmt(rt.price)} <span style={{ fontSize: 11, fontWeight: 400, color: DS.gray400 }}>TND</span></div>
                                {markupEnabled && rt.markupAmount > 0 && <div style={{ fontSize: 10, background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: 20, fontWeight: 700, display: 'inline-block', marginTop: 3 }}>+{fmt(rt.markupAmount)} marge</div>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Total + CTA */}
        {allRoomsSelected && (
          <div style={{ background: DS.primary50, border: `1px solid ${DS.primary100}`, borderRadius: 14, padding: '16px 18px' }}>
            {roomsCfg.length > 1 && roomsCfg.map((rc, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: DS.gray700 }}>Chambre {i + 1} — {selectedRoomTypes[i]?.roomName}</span>
                <span style={{ fontWeight: 700, color: DS.gray900 }}>{fmt(selectedRoomTypes[i]?.price)} TND</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: roomsCfg.length > 1 ? `1px solid ${DS.primary100}` : 'none', paddingTop: roomsCfg.length > 1 ? 10 : 0 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: DS.gray900 }}>Total{roomsCfg.length > 1 ? ` — ${roomsCfg.length} chambres` : ''}</div>
                <div style={{ fontSize: 12, color: DS.gray500 }}>{selectedBoarding.Name || bName(selectedBoarding.Id)} · {nightsCount} nuit{nightsCount > 1 ? 's' : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {markupEnabled && totalMarkupAmount > 0 && <div style={{ fontSize: 12, color: DS.gray400, textDecoration: 'line-through' }}>{fmt(totalSupplierPrice)} TND</div>}
                <div style={{ fontSize: 20, fontWeight: 800, color: DS.primary700 }}>{fmt(totalClientPrice)} <span style={{ fontSize: 12, fontWeight: 400, color: DS.gray400 }}>TND</span></div>
                {markupEnabled && totalMarkupAmount > 0 && <div style={{ fontSize: 11, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 20, fontWeight: 700, display: 'inline-block', marginTop: 2 }}>+{fmt(totalMarkupAmount)} TND marge</div>}
              </div>
            </div>
            <button onClick={() => { setStep('booking'); setBError(''); }}
              style={{ width: '100%', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: DS.primary700, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: DS.shadowBtn, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = DS.primary800; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = DS.primary700; e.currentTarget.style.transform = 'translateY(0)'; }}
            ><Check size={15} /> Passer à la réservation <ChevronRight size={14} /></button>
          </div>
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: BOOKING FORM
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'booking') {
    const bookingCost  = totalSupplierPrice;
    const creditAfter  = availCredit - bookingCost;
    const enoughCredit = availCredit >= bookingCost;
    const updAdult = (i, f, v) => setPax(p => p.map((a, j) => j === i ? { ...a, [f]: v } : a));
    const updChild = (i, f, v) => setChildPax(c => c.map((ch, j) => j === i ? { ...ch, [f]: v } : ch));
    const inSt = { width: '100%', padding: '9px 11px', border: `1.5px solid ${DS.gray200}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff', color: DS.gray900, transition: 'border-color 0.15s' };
    const lbSt = { display: 'block', fontSize: 11, fontWeight: 600, color: DS.gray600, marginBottom: 5 };

    return (
      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        <BackBtn onClick={() => { setStep('rooms'); setBError(''); }} label="Retour aux chambres" />

        {/* Summary bar */}
        <div style={{ background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 12, padding: '14px 18px', marginBottom: 22, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
          <div style={{ flex: '1 1 150px' }}>
            <div style={{ fontSize: 10, color: DS.gray400, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3, letterSpacing: '0.06em' }}>Hôtel</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: DS.gray900 }}>{selectedHotel.Name}</div>
            <StarsRow count={selectedHotel.Stars || selectedHotel.Category?.Star} />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <div style={{ fontSize: 10, color: DS.gray400, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3, letterSpacing: '0.06em' }}>Pension</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: DS.gray900 }}>{selectedBoarding.Name || bName(selectedBoarding.Id)}</div>
            <div style={{ fontSize: 12, color: DS.gray500 }}>{roomsCfg.length} chambre{roomsCfg.length > 1 ? 's' : ''}</div>
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <div style={{ fontSize: 10, color: DS.gray400, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3, letterSpacing: '0.06em' }}>Séjour</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: DS.gray900 }}>{checkIn} → {checkOut}</div>
            <div style={{ fontSize: 12, color: DS.gray500 }}>{nightsCount} nuit{nightsCount > 1 ? 's' : ''} · {guestLabel}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: DS.gray400, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3, letterSpacing: '0.06em' }}>Prix client total</div>
            {markupEnabled && totalMarkupAmount > 0 && <div style={{ fontSize: 12, color: DS.gray400, textDecoration: 'line-through' }}>{fmt(totalSupplierPrice)} TND</div>}
            <div style={{ fontSize: 20, fontWeight: 800, color: DS.primary700 }}>{fmt(totalClientPrice)} <span style={{ fontSize: 12, fontWeight: 400, color: DS.gray400 }}>TND</span></div>
            {markupEnabled && totalMarkupAmount > 0 && <div style={{ fontSize: 11, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 20, fontWeight: 700, display: 'inline-block', marginTop: 2 }}>+{fmt(totalMarkupAmount)} TND marge</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, alignItems: 'start' }}>

          {/* Pax form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pax.map((adult, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, background: adult.holder ? DS.primary700 : DS.gray100, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={12} color={adult.holder ? '#fff' : DS.gray500} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: DS.gray700 }}>
                    {adult.holder ? 'Titulaire — responsable de la réservation' : `Adulte ${i + 1}`}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={lbSt}>Civilité</label>
                    <select value={adult.civility} onChange={e => updAdult(i, 'civility', e.target.value)} style={{ ...inSt, cursor: 'pointer' }}>
                      <option value="Mr">M.</option><option value="Mrs">Mme.</option><option value="Ms">Mlle.</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbSt}>Prénom *</label>
                    <input value={adult.name} onChange={e => updAdult(i, 'name', e.target.value)} placeholder="Prénom" style={inSt} onFocus={e => e.target.style.borderColor = DS.primary600} onBlur={e => e.target.style.borderColor = DS.gray200} />
                  </div>
                  <div>
                    <label style={lbSt}>Nom *</label>
                    <input value={adult.surname} onChange={e => updAdult(i, 'surname', e.target.value)} placeholder="Nom" style={inSt} onFocus={e => e.target.style.borderColor = DS.primary600} onBlur={e => e.target.style.borderColor = DS.gray200} />
                  </div>
                </div>
              </div>
            ))}

            {childPax.map((child, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, background: DS.primary50, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Baby size={12} color={DS.primary700} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: DS.gray700 }}>Enfant {i + 1} ({child.age} ans)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 10 }}>
                  <div><label style={lbSt}>Prénom *</label><input value={child.name} onChange={e => updChild(i, 'name', e.target.value)} placeholder="Prénom" style={inSt} onFocus={e => e.target.style.borderColor = DS.primary600} onBlur={e => e.target.style.borderColor = DS.gray200} /></div>
                  <div><label style={lbSt}>Nom *</label><input value={child.surname} onChange={e => updChild(i, 'surname', e.target.value)} placeholder="Nom" style={inSt} onFocus={e => e.target.style.borderColor = DS.primary600} onBlur={e => e.target.style.borderColor = DS.gray200} /></div>
                  <div><label style={lbSt}>Âge</label><input type="number" min={0} max={11} value={child.age} onChange={e => updChild(i, 'age', e.target.value)} style={inSt} /></div>
                </div>
              </div>
            ))}

            <div style={{ background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 12, padding: '16px 18px' }}>
              <label style={{ ...lbSt, marginBottom: 8 }}>Notes / demandes spéciales</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Chambre communicante, étage élevé, lit bébé…" style={{ ...inSt, resize: 'vertical', lineHeight: 1.5 }} onFocus={e => e.target.style.borderColor = DS.primary600} onBlur={e => e.target.style.borderColor = DS.gray200} />
            </div>
          </div>

          {/* Sticky credit sidebar */}
          <div style={{ position: 'sticky', top: 0 }}>
            <div style={{ background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${DS.gray100}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: DS.gray700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 4, height: 16, background: DS.primary700, borderRadius: 4 }} />Récapitulatif crédit
                </div>
                {roomsCfg.length > 1 && selectedRoomTypes.map((rt, i) => rt && (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, paddingBottom: 6, borderBottom: `1px dashed ${DS.gray100}` }}>
                    <span style={{ fontSize: 11, color: DS.gray400 }}>Ch.{i + 1} — {rt.roomName}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: DS.gray700 }}>{fmt(rt.supplierPrice)} TND</span>
                  </div>
                ))}
                {[
                  { label: 'Crédit disponible', value: `${fmt(availCredit)} TND`, color: DS.gray900 },
                  { label: 'Coût fournisseur',  value: `− ${fmt(bookingCost)} TND`, color: '#b91c1c' },
                  { label: 'Après réservation', value: `${fmt(creditAfter)} TND`, color: creditAfter >= 0 ? DS.primary700 : '#b91c1c', bold: true },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9 }}>
                    <span style={{ fontSize: 12, color: DS.gray500 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: row.bold ? 700 : 500, color: row.color }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${DS.gray100}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: DS.gray500 }}>Facturé au client</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: DS.primary700 }}>{fmt(totalClientPrice)} TND</span>
                </div>
                {markupEnabled && totalMarkupAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: DS.gray500 }}>Votre marge totale</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>+{fmt(totalMarkupAmount)} TND</span>
                  </div>
                )}
              </div>
              {!enoughCredit && (
                <div style={{ padding: '9px 18px', background: '#fef2f2', display: 'flex', gap: 8, fontSize: 12, color: '#b91c1c', alignItems: 'center' }}>
                  <AlertCircle size={13} />Crédit insuffisant. Contactez votre administrateur.
                </div>
              )}
              {bError && <div style={{ padding: '9px 18px', background: '#fef2f2', fontSize: 12, color: '#b91c1c' }}>{bError}</div>}
              <div style={{ padding: '14px 18px' }}>
                <button onClick={handleBook} disabled={bLoading || !enoughCredit}
                  style={{ width: '100%', padding: '12px', background: (bLoading || !enoughCredit) ? DS.gray300 : DS.primary700, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: (bLoading || !enoughCredit) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', boxShadow: (bLoading || !enoughCredit) ? 'none' : DS.shadowBtn, transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (!bLoading && enoughCredit) e.currentTarget.style.background = DS.primary800; }}
                  onMouseLeave={e => { if (!bLoading && enoughCredit) e.currentTarget.style.background = DS.primary700; }}
                >
                  {bLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />En cours…</> : <><Check size={14} />Confirmer la réservation</>}
                </button>
                <p style={{ fontSize: 11, color: DS.gray400, textAlign: 'center', marginTop: 7 }}>Le crédit est déduit à la confirmation.</p>
              </div>
            </div>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: CONFIRMED
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'confirmed') {
    const b = confirmed;
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '40px 0', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <CheckCircle size={34} color="#059669" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: DS.gray900, marginBottom: 5 }}>Réservation créée !</h2>
          <p style={{ fontSize: 13, color: DS.gray500 }}>La réservation sera confirmée par notre équipe sous peu.</p>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${DS.gray200}`, borderRadius: 14, padding: '20px 22px', marginBottom: 20 }}>
          {b?.confirmationCode && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ background: DS.primary50, border: `1px solid ${DS.primary100}`, borderRadius: 10, padding: '10px 20px', display: 'inline-block' }}>
                <div style={{ fontSize: 11, color: DS.gray500, marginBottom: 2 }}>Code de confirmation</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: DS.primary700, fontFamily: 'monospace', letterSpacing: '0.06em' }}>{b.confirmationCode}</div>
              </div>
            </div>
          )}
          {[
            ['Hôtel',      b?.hotelBooking?.HotelName ?? selectedHotel?.Name ?? '—'],
            ['Pension',    selectedBoarding?.Name || bName(selectedBoarding?.Id) || '—'],
            ['Arrivée',    b?.hotelBooking?.CheckIn  ?? checkIn],
            ['Départ',     b?.hotelBooking?.CheckOut ?? checkOut],
            ['Chambres',   `${roomsCfg.length} chambre${roomsCfg.length > 1 ? 's' : ''}`],
            ['Prix client',`${fmt(b?.totalPrice ?? totalClientPrice)} TND`],
            markupEnabled && totalMarkupAmount > 0 ? ['Votre marge', `+${fmt(totalMarkupAmount)} TND`] : null,
            ['Statut',     b?.status ?? 'pending'],
          ].filter(Boolean).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${DS.gray100}`, fontSize: 13 }}>
              <span style={{ color: DS.gray500 }}>{k}</span>
              <span style={{ fontWeight: 600, color: k === 'Votre marge' ? '#065f46' : DS.gray900 }}>{v}</span>
            </div>
          ))}
        </div>

        <button onClick={resetAll}
          style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto', padding: '11px 24px', background: DS.primary700, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: DS.shadowBtn }}>
          <Search size={14} /> Nouvelle recherche
        </button>
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  return null;
}
