import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

/* ── Utilities ─────────────────────────────────────────────────────────── */
const pad    = n => String(n).padStart(2, '0');
const toISO  = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = s => (s ? new Date(s + 'T00:00:00') : null);
const sameDay  = (a, b) => a && b && toISO(a) === toISO(b);
const startOfDay = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c; };

/** Monday-first week grid for a given year/month. Nulls fill empty slots. */
function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0).getDate();
  let dow = first.getDay(); // 0 = Sun
  dow = dow === 0 ? 6 : dow - 1; // Mon = 0 … Sun = 6
  const cells = [];
  for (let i = 0; i < dow; i++) cells.push(null);
  for (let d = 1; d <= last; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/* ── i18n ────────────────────────────────────────────────────────────────── */
const MONTHS = {
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
};
const WDAYS = {
  en: ['Mo','Tu','We','Th','Fr','Sa','Su'],
  fr: ['Lu','Ma','Me','Je','Ve','Sa','Di'],
  ar: ['إث','ثل','أر','خم','جم','سب','أح'],
};
const UI = {
  en: { checkIn: 'Check-in', checkOut: 'Check-out', select: 'Select check-in', nights: n => `${n} night${n !== 1 ? 's' : ''}` },
  fr: { checkIn: 'Arrivée',  checkOut: 'Départ',    select: "Sélectionner l'arrivée", nights: n => `${n} nuit${n !== 1 ? 's' : ''}` },
  ar: { checkIn: 'الوصول',   checkOut: 'المغادرة',   select: 'اختر تاريخ الوصول',     nights: n => `${n} ${n === 1 ? 'ليلة' : 'ليالي'}` },
};

/* ════════════════════════════════════════════════════════════════════════ */

/**
 * DateRangePicker
 *
 * Props:
 *   checkIn    — 'YYYY-MM-DD' | ''
 *   checkOut   — 'YYYY-MM-DD' | ''
 *   onChange   — ({ checkIn, checkOut }) => void
 *   language   — 'fr' | 'ar' | 'en'
 *   minDate    — Date (defaults to today)
 *   className  — extra class on the outer wrapper
 *   inputClassName — extra class on the trigger button
 */
const DateRangePicker = ({
  checkIn      = '',
  checkOut     = '',
  onChange,
  language     = 'en',
  minDate,
  className    = '',
  inputClassName = '',
}) => {
  const isRTL = language === 'ar';
  const ui    = UI[language] || UI.en;
  const today = startOfDay(new Date());
  const min   = minDate ? startOfDay(minDate) : today;

  /* ── Parse controlled values ── */
  const startD = parseISO(checkIn)  ? startOfDay(parseISO(checkIn))  : null;
  const endD   = parseISO(checkOut) ? startOfDay(parseISO(checkOut)) : null;

  /* ── Local state ── */
  const [open,       setOpen]      = useState(false);
  const [phase,      setPhase]     = useState('start'); // 'start' | 'end'
  const [hover,      setHover]     = useState(null);    // Date | null
  const [viewYear,   setViewYear]  = useState(() => (startD || today).getFullYear());
  const [viewMonth,  setViewMonth] = useState(() => (startD || today).getMonth());

  const wrapRef = useRef(null);

  /* ── Sync view when checkIn changes from outside ── */
  useEffect(() => {
    if (startD) { setViewYear(startD.getFullYear()); setViewMonth(startD.getMonth()); }
  }, [checkIn]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setHover(null);
      }
    };
    document.addEventListener('mousedown',  handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown',  handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  /* ── Navigation ── */
  const prevMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 0) { setViewYear(y => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 11) { setViewYear(y => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  /* Right calendar = one month after left */
  const rightYear  = viewMonth === 11 ? viewYear + 1 : viewYear;
  const rightMonth = viewMonth === 11 ? 0 : viewMonth + 1;

  /* ── Date selection ── */
  const handleDayClick = useCallback((day) => {
    const d = startOfDay(day);
    if (d < min) return; // before minDate — ignore

    if (phase === 'start') {
      onChange({ checkIn: toISO(d), checkOut: '' });
      setPhase('end');
    } else {
      // phase === 'end'
      if (startD && d < startD) {
        // selected before start → restart
        onChange({ checkIn: toISO(d), checkOut: '' });
        setPhase('end');
      } else if (startD && sameDay(d, startD)) {
        // same as start → treat as single night
        const next = new Date(startD);
        next.setDate(next.getDate() + 1);
        onChange({ checkIn: toISO(startD), checkOut: toISO(next) });
        setPhase('start');
        setOpen(false);
        setHover(null);
      } else {
        onChange({ checkIn: toISO(startD), checkOut: toISO(d) });
        setPhase('start');
        setOpen(false);
        setHover(null);
      }
    }
  }, [phase, startD, min, onChange]);

  /* ── Range state helpers ── */
  const effectiveEnd = phase === 'end' && hover && startD
    ? (hover >= startD ? hover : null)
    : endD;

  const isStart     = d => sameDay(d, startD);
  const isEnd       = d => sameDay(d, effectiveEnd);
  const isInRange   = d => startD && effectiveEnd && d > startD && d < effectiveEnd;
  const isPast      = d => d < min;
  const isHoverPrev = d => phase === 'end' && hover && startD && d >= hover && d < startD;

  /* ── Night count ── */
  const nights = startD && endD
    ? Math.round((endD - startD) / 86400000)
    : null;

  /* ── Cell renderer ── */
  const renderDay = (day, key) => {
    if (!day) return <div key={key} />;

    const _s  = isStart(day);
    const _e  = isEnd(day);
    const _ir = isInRange(day);
    const past = isPast(day);
    const sameStartEnd = _s && _e;

    // Half-background (snake effect)
    const showLeftBg  = !sameStartEnd && (_ir || (_e && startD));
    const showRightBg = !sameStartEnd && (_ir || (_s && effectiveEnd));

    // Preview range when hovering (lighter shade)
    const isPreview = phase === 'end' && hover && startD && !_s && !_e &&
      day >= startD && day < hover;

    let circleClass = 'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-100 relative z-10 ';
    if (past) {
      circleClass += 'text-gray-300 cursor-not-allowed';
    } else if (_s || _e) {
      circleClass += 'bg-primary-700 text-white shadow-lg font-bold scale-110 cursor-pointer';
    } else if (_ir) {
      circleClass += 'text-primary-900 font-medium hover:bg-primary-200 cursor-pointer';
    } else if (sameDay(day, today)) {
      circleClass += 'border-2 border-primary-400 text-primary-700 font-bold hover:bg-primary-50 cursor-pointer';
    } else {
      circleClass += 'text-gray-700 hover:bg-primary-100 hover:text-primary-900 cursor-pointer';
    }

    const bgLeft  = showLeftBg  ? 'bg-primary-100' : (isPreview ? 'bg-primary-50' : '');
    const bgRight = showRightBg ? 'bg-primary-100' : (isPreview ? 'bg-primary-50' : '');

    return (
      <div key={key} className="relative flex items-center justify-center h-9">
        {/* Left-half snake background */}
        {(showLeftBg || isPreview) && (
          <div className={`absolute left-0 top-1 bottom-1 w-1/2 ${bgLeft} transition-colors duration-100`} />
        )}
        {/* Right-half snake background */}
        {(showRightBg || isPreview) && (
          <div className={`absolute right-0 top-1 bottom-1 w-1/2 ${bgRight} transition-colors duration-100`} />
        )}
        <button
          type="button"
          disabled={past}
          onClick={() => !past && handleDayClick(day)}
          onMouseEnter={() => !past && phase === 'end' && startD && setHover(startOfDay(day))}
          onMouseLeave={() => setHover(null)}
          className={circleClass}
          tabIndex={past ? -1 : 0}
        >
          {day.getDate()}
        </button>
      </div>
    );
  };

  /* ── Single month calendar ── */
  const renderMonth = (year, month, showPrev, showNext) => {
    const cells = monthGrid(year, month);
    return (
      <div className="flex-1 min-w-0">
        {/* Month header */}
        <div className="flex items-center justify-between mb-3 px-1">
          {showPrev ? (
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          ) : <div className="w-8" />}

          <span className="text-sm font-bold text-gray-900">
            {MONTHS[language]?.[month] || MONTHS.en[month]} {year}
          </span>

          {showNext ? (
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          ) : <div className="w-8" />}
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {(WDAYS[language] || WDAYS.en).map(w => (
            <div key={w} className="h-7 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => renderDay(day, i))}
        </div>
      </div>
    );
  };

  /* ── Trigger button label ── */
  const fmtDate = d => d
    ? d.toLocaleDateString(
        language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : 'en-US',
        { day: 'numeric', month: 'short' }
      )
    : null;

  /* ════════════════════════════════════════════ RENDER ════════════════════════════ */
  return (
    <div ref={wrapRef} className={`relative ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => {
          setOpen(o => !o);
          if (!open) {
            setPhase(startD && !endD ? 'end' : 'start');
            if (startD) { setViewYear(startD.getFullYear()); setViewMonth(startD.getMonth()); }
          }
        }}
        className={`w-full flex items-center gap-3 px-4 py-3.5 border rounded-xl text-sm bg-white
          transition-all outline-none
          ${open
            ? 'border-primary-600 ring-2 ring-primary-100 shadow-sm'
            : 'border-gray-300 hover:border-gray-400'}
          ${inputClassName}`}
      >
        <Calendar size={18} className="text-gray-400 flex-shrink-0" />

        {startD ? (
          <div className={`flex items-center gap-2 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Check-in */}
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-gray-400 uppercase font-semibold leading-none mb-0.5">{ui.checkIn}</span>
              <span className="font-semibold text-gray-900 text-sm leading-none">{fmtDate(startD)}</span>
            </div>

            {/* Arrow / nights */}
            <div className="flex items-center gap-1 px-2 text-gray-300">
              <div className="h-px w-5 bg-gray-200" />
              {nights !== null && (
                <span className="text-[10px] text-primary-600 font-bold bg-primary-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {ui.nights(nights)}
                </span>
              )}
              <div className="h-px w-5 bg-gray-200" />
            </div>

            {/* Check-out */}
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-gray-400 uppercase font-semibold leading-none mb-0.5">{ui.checkOut}</span>
              {endD
                ? <span className="font-semibold text-gray-900 text-sm leading-none">{fmtDate(endD)}</span>
                : <span className="text-sm text-primary-500 font-semibold animate-pulse leading-none">—</span>
              }
            </div>
          </div>
        ) : (
          <span className="text-gray-400 flex-1 text-left">{ui.select}</span>
        )}
      </button>

      {/* ── Popup ────────────────────────────────────────────────────────── */}
      <div
        style={{
          transition: 'opacity 150ms ease, transform 150ms ease',
          opacity:    open ? 1 : 0,
          transform:  open ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(-8px)',
          pointerEvents: open ? 'auto' : 'none',
          transformOrigin: 'top center',
        }}
        className="absolute z-[300] top-[calc(100%+8px)] left-0 right-0 sm:right-auto sm:w-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 sm:p-5 select-none"
      >
        {/* Phase indicator */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            phase === 'start' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[9px]">1</span>
            {ui.checkIn}
          </div>
          <div className="h-px flex-1 bg-gray-200" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            phase === 'end' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[9px]">2</span>
            {ui.checkOut}
          </div>
          {nights !== null && (
            <span className="ml-1 text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full whitespace-nowrap">
              {ui.nights(nights)}
            </span>
          )}
        </div>

        {/* Calendars */}
        <div className="flex gap-8">
          {/* LEFT — always visible */}
          {renderMonth(viewYear, viewMonth, true, true /* show next on mobile single-month */)}

          {/* RIGHT — desktop only */}
          <div className="hidden sm:flex">
            {renderMonth(rightYear, rightMonth, false, true)}
          </div>
        </div>

        {/* Reset link */}
        {(startD || endD) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                onChange({ checkIn: '', checkOut: '' });
                setPhase('start');
                setHover(null);
              }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              {language === 'fr' ? 'Réinitialiser' : language === 'ar' ? 'إعادة تعيين' : 'Reset dates'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
