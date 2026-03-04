import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar, Moon, Plus, Minus, Check } from 'lucide-react';

/* ── Utilities ──────────────────────────────────────────────────────────── */
const pad      = n => String(n).padStart(2, '0');
const toISO    = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = s => (s ? new Date(s + 'T00:00:00') : null);
const sameDay  = (a, b) => a && b && toISO(a) === toISO(b);
const startOfDay = d => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c; };
const addDays  = (d, n) => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };

function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0).getDate();
  let dow = first.getDay();
  dow = dow === 0 ? 6 : dow - 1;
  const cells = [];
  for (let i = 0; i < dow; i++) cells.push(null);
  for (let d = 1; d <= last; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/* ── i18n ─────────────────────────────────────────────────────────────────── */
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
  en: { checkIn:'Check-in', checkOut:'Check-out', select:'Select dates', nights: n=>`${n} night${n!==1?'s':''}`, datesTab:'Dates', nightsTab:'Nights', confirm:'Done', reset:'Reset' },
  fr: { checkIn:'Arrivée',  checkOut:'Départ',    select:'Sélectionner les dates', nights: n=>`${n} nuit${n!==1?'s':''}`, datesTab:'Dates', nightsTab:'Nuits', confirm:'Confirmer', reset:'Réinitialiser' },
  ar: { checkIn:'الوصول',   checkOut:'المغادرة',   select:'اختر التواريخ', nights: n=>`${n} ${n===1?'ليلة':'ليالي'}`, datesTab:'تواريخ', nightsTab:'ليالي', confirm:'تأكيد', reset:'إعادة تعيين' },
};

/* ════════════════════════════════════════════════════════════════════════════ */

/**
 * DateRangePicker
 *
 * Props:
 *   checkIn         'YYYY-MM-DD' | ''
 *   checkOut        'YYYY-MM-DD' | ''
 *   onChange        ({ checkIn, checkOut }) => void
 *   language        'fr' | 'ar' | 'en'
 *   minDate         Date (defaults to today)
 *   className       outer wrapper className
 *   allowNightsMode bool — show Dates/Nuits toggle (default false)
 *   variant         'default' | 'flush' — flush = borderless trigger for inline bars
 */
const DateRangePicker = ({
  checkIn         = '',
  checkOut        = '',
  onChange,
  language        = 'en',
  minDate,
  className       = '',
  allowNightsMode = false,
  variant         = 'default',
}) => {
  const isRTL = language === 'ar';
  const ui    = UI[language] || UI.en;
  const today = startOfDay(new Date());
  const min   = minDate ? startOfDay(minDate) : today;

  const startD = parseISO(checkIn)  ? startOfDay(parseISO(checkIn))  : null;
  const endD   = parseISO(checkOut) ? startOfDay(parseISO(checkOut)) : null;

  /* ── State ── */
  const [open,       setOpen]      = useState(false);
  const [mode,       setMode]      = useState('dates');   // 'dates' | 'nights'
  const [phase,      setPhase]     = useState('start');   // 'start' | 'end'  (dates mode)
  const [nightsCount,setNightsCount] = useState(() => {
    if (startD && endD) return Math.max(1, Math.round((endD - startD) / 86400000));
    return 2;
  });
  const [hover,      setHover]     = useState(null);
  const [viewYear,   setViewYear]  = useState(() => (startD || today).getFullYear());
  const [viewMonth,  setViewMonth] = useState(() => (startD || today).getMonth());

  /* modal scroll-lock handled in effect below */

  const wrapRef    = useRef(null);
  const triggerRef = useRef(null);
  const popupRef   = useRef(null);

  /* ── Sync view when checkIn changes ── */
  useEffect(() => {
    if (startD) { setViewYear(startD.getFullYear()); setViewMonth(startD.getMonth()); }
  }, [checkIn]); // eslint-disable-line

  /* ── Sync nightsCount when external values change ── */
  useEffect(() => {
    if (startD && endD) {
      const n = Math.max(1, Math.round((endD - startD) / 86400000));
      setNightsCount(n);
    }
  }, [checkIn, checkOut]); // eslint-disable-line

  /* ── Lock body scroll while modal is open ── */
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else      document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* ── Calendar navigation ── */
  const prevMonth = useCallback(() => {
    setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
  }, []);
  const nextMonth = useCallback(() => {
    setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });
  }, []);
  const rightYear  = viewMonth === 11 ? viewYear + 1 : viewYear;
  const rightMonth = viewMonth === 11 ? 0 : viewMonth + 1;

  /* ── Nights mode helpers ── */
  const pickingNights = mode === 'nights' && !!startD; // waiting for nights count after check-in picked
  const nightsEndD   = startD ? startOfDay(addDays(startD, nightsCount)) : null;

  const applyNights = useCallback((n) => {
    if (!startD) return;
    const co = startOfDay(addDays(startD, n));
    onChange({ checkIn: toISO(startD), checkOut: toISO(co) });
  }, [startD, onChange]);

  const changeNights = useCallback((delta) => {
    setNightsCount(prev => {
      const n = Math.max(1, Math.min(30, prev + delta));
      applyNights(n);
      return n;
    });
  }, [applyNights]);

  /* ── Date selection (dates mode) ── */
  const handleDayClick = useCallback((day) => {
    const d = startOfDay(day);
    if (d < min) return;

    if (mode === 'nights') {
      // In nights mode: clicking always sets check-in, then show counter
      onChange({ checkIn: toISO(d), checkOut: toISO(addDays(d, nightsCount)) });
      // phase stays 'start' but pickingNights becomes true
      return;
    }

    // dates mode
    if (phase === 'start') {
      onChange({ checkIn: toISO(d), checkOut: '' });
      setPhase('end');
    } else {
      if (startD && d < startD) {
        onChange({ checkIn: toISO(d), checkOut: '' });
        setPhase('end');
      } else if (startD && sameDay(d, startD)) {
        const next = startOfDay(addDays(startD, 1));
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
  }, [mode, phase, startD, min, nightsCount, onChange]);

  /* ── Range state helpers ── */
  const activeEnd   = mode === 'nights' ? nightsEndD : (phase === 'end' && hover && startD && hover >= startD ? hover : endD);
  const isStart_    = d => sameDay(d, startD);
  const isEnd_      = d => sameDay(d, activeEnd);
  const isInRange_  = d => startD && activeEnd && d > startD && d < activeEnd;
  const isPast_     = d => d < min;

  const datesNights  = startD && endD ? Math.round((endD - startD) / 86400000) : null;
  const displayNights = mode === 'nights' ? nightsCount : datesNights;

  /* ── Cell renderer ── */
  const renderDay = (day, key) => {
    if (!day) return <div key={key} />;

    const _s   = isStart_(day);
    const _e   = isEnd_(day);
    const _ir  = isInRange_(day);
    const past = isPast_(day);
    const sameStartEnd = _s && _e;

    const showLeftBg  = !sameStartEnd && (_ir || (_e && startD));
    const showRightBg = !sameStartEnd && (_ir || (_s && activeEnd));

    const isPreview = mode === 'dates' && phase === 'end' && hover && startD && !_s && !_e &&
      day >= startD && day < hover;

    let btnCls = 'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-100 relative z-10 select-none ';
    if (past) {
      btnCls += 'text-gray-300 cursor-not-allowed';
    } else if (_s || _e) {
      btnCls += 'bg-primary-700 text-white shadow-lg font-bold scale-110 cursor-pointer';
    } else if (_ir) {
      btnCls += 'text-primary-900 font-medium hover:bg-primary-200 cursor-pointer';
    } else if (sameDay(day, today)) {
      btnCls += 'border-2 border-primary-400 text-primary-700 font-bold hover:bg-primary-50 cursor-pointer';
    } else {
      btnCls += 'text-gray-700 hover:bg-primary-100 hover:text-primary-900 cursor-pointer';
    }

    return (
      <div key={key} className="relative flex items-center justify-center h-8">
        {(showLeftBg || isPreview) && (
          <div className={`absolute left-0 top-1 bottom-1 w-1/2 transition-colors duration-100 ${showLeftBg ? 'bg-primary-100' : 'bg-primary-50'}`} />
        )}
        {(showRightBg || isPreview) && (
          <div className={`absolute right-0 top-1 bottom-1 w-1/2 transition-colors duration-100 ${showRightBg ? 'bg-primary-100' : 'bg-primary-50'}`} />
        )}
        <button
          type="button"
          disabled={past}
          onClick={() => !past && handleDayClick(day)}
          onMouseEnter={() => !past && mode === 'dates' && phase === 'end' && startD && setHover(startOfDay(day))}
          onMouseLeave={() => setHover(null)}
          className={btnCls}
          tabIndex={past ? -1 : 0}
        >
          {day.getDate()}
        </button>
      </div>
    );
  };

  /* ── Single month ── */
  const renderMonth = (year, month, showPrev, showNext) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2 px-1">
        {showPrev ? (
          <button type="button" onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={16} />
          </button>
        ) : <div className="w-8" />}
        <span className="text-sm font-bold text-gray-900">
          {MONTHS[language]?.[month] || MONTHS.en[month]} {year}
        </span>
        {showNext ? (
          <button type="button" onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronRight size={16} />
          </button>
        ) : <div className="w-8" />}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {(WDAYS[language] || WDAYS.en).map(w => (
          <div key={w} className="h-6 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthGrid(year, month).map((day, i) => renderDay(day, i))}
      </div>
    </div>
  );

  /* ── Format display ── */
  const fmtDate = d => d
    ? d.toLocaleDateString(
        language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : 'en-US',
        { day: 'numeric', month: 'short' }
      )
    : null;

  /* ── Open handler ── */
  const handleOpen = () => {
    const nowOpen = !open;
    setOpen(nowOpen);
    if (nowOpen) {
      setPhase(startD && !endD && mode === 'dates' ? 'end' : 'start');
      if (startD) { setViewYear(startD.getFullYear()); setViewMonth(startD.getMonth()); }
    } else {
      setHover(null);
    }
  };

  /* ══════════════════════════════════ TRIGGER ════════════════════════════ */
  const triggerContent = variant === 'flush' ? (
    /* Flush: two-section bar-style trigger */
    <div className={`flex items-stretch w-full h-full ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Check-in */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-center">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          {ui.checkIn}
        </div>
        <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Calendar size={12} className="text-gray-400 flex-shrink-0" />
          <span className={`text-sm font-semibold ${startD ? 'text-gray-800' : 'text-gray-400'}`}>
            {startD ? fmtDate(startD) : '—'}
          </span>
        </div>
      </div>
      <div className="w-px bg-gray-200 my-2.5 flex-shrink-0" />
      {/* Check-out */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-center">
        <div className={`flex items-center gap-1 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ui.checkOut}</span>
          {displayNights !== null && (
            <span className="text-[9px] font-bold text-primary-600 bg-primary-50 px-1 py-0.5 rounded-full leading-none whitespace-nowrap">
              {ui.nights(displayNights)}
            </span>
          )}
        </div>
        <span className={`text-sm font-semibold ${endD ? 'text-gray-800' : startD ? 'text-primary-500' : 'text-gray-400'}`}>
          {endD ? fmtDate(endD) : (startD ? '...' : '—')}
        </span>
      </div>
    </div>
  ) : (
    /* Default: single-button trigger */
    <>
      <Calendar size={18} className="text-gray-400 flex-shrink-0" />
      {startD ? (
        <div className={`flex items-center gap-2 flex-1 min-w-0 justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex flex-col items-center`}>
            <span className="text-[10px] text-gray-400 uppercase font-semibold leading-none mb-0.5">{ui.checkIn}</span>
            <span className="font-semibold text-gray-900 text-sm leading-none whitespace-nowrap">{fmtDate(startD)}</span>
          </div>
          <div className={`flex items-center gap-1 px-1 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="h-px w-3 bg-gray-300" />
            {displayNights !== null && (
              <span className="text-[10px] text-primary-600 font-bold bg-primary-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                {ui.nights(displayNights)}
              </span>
            )}
            <div className="h-px w-3 bg-gray-300" />
          </div>
          <div className={`flex flex-col items-center flex-shrink-0`}>
            <span className="text-[10px] text-gray-400 uppercase font-semibold leading-none mb-0.5">{ui.checkOut}</span>
            {endD
              ? <span className="font-semibold text-gray-900 text-sm leading-none whitespace-nowrap">{fmtDate(endD)}</span>
              : <span className="text-sm text-primary-500 font-semibold animate-pulse leading-none">—</span>
            }
          </div>
        </div>
      ) : (
        <span className={`text-gray-400 flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{ui.select}</span>
      )}
    </>
  );

  /* ── Popup content (modal card) ── */
  const popupContent = (
    <div
      ref={popupRef}
      className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-3 sm:p-4 select-none overflow-y-auto"
      style={{ maxHeight: '90vh', width: 'min(calc(100vw - 32px), 486px)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Mode tabs (if allowed) ── */}
      {allowNightsMode && (
        <div className="flex items-center gap-1 mb-4 pb-3 border-b border-gray-100">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setMode('dates');
                setPhase(startD && !endD ? 'end' : 'start');
                // If switching from nights to dates, keep the dates as-is
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'dates' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar size={12} />
              {ui.datesTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('nights');
                // If switching to nights mode, compute nights from existing start/end or keep nightsCount
                if (startD && endD) {
                  setNightsCount(Math.max(1, Math.round((endD - startD) / 86400000)));
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'nights' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Moon size={12} />
              {ui.nightsTab}
            </button>
          </div>

          {/* Phase / info pill */}
          {mode === 'dates' ? (
            <>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                phase === 'start' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[8px]">1</span>
                {ui.checkIn}
              </div>
              <div className="h-px flex-1 bg-gray-200 mx-1" />
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                phase === 'end' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[8px]">2</span>
                {ui.checkOut}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 ml-1 text-xs font-bold text-primary-700">
              {startD
                ? <span className="bg-primary-50 px-2 py-1 rounded-lg">
                    {fmtDate(startD)} + {ui.nights(nightsCount)}
                  </span>
                : <span className="text-gray-400">{ui.checkIn} ?</span>
              }
            </div>
          )}

          {displayNights !== null && mode === 'dates' && (
            <span className="ml-1 text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
              {ui.nights(displayNights)}
            </span>
          )}
        </div>
      )}

      {/* ── Phase indicator (no mode tab row) ── */}
      {!allowNightsMode && (
        <div className={`flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            phase === 'start' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[8px]">1</span>
            {ui.checkIn}
          </div>
          <div className="h-px flex-1 bg-gray-200" />
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            phase === 'end' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[8px]">2</span>
            {ui.checkOut}
          </div>
          {displayNights !== null && (
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
              {ui.nights(displayNights)}
            </span>
          )}
        </div>
      )}

      {/* ── Calendars ── */}
      <div className="flex gap-4 sm:gap-6">
        {renderMonth(viewYear, viewMonth, true, true)}
        <div className="hidden sm:flex">
          {renderMonth(rightYear, rightMonth, false, true)}
        </div>
      </div>

      {/* ── Nights counter (nights mode + check-in picked) ── */}
      {mode === 'nights' && startD && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <p className="text-xs font-bold text-gray-700 mb-0.5">{ui.nightsTab}</p>
              <p className="text-[10px] text-gray-400">
                {fmtDate(startD)} → {fmtDate(nightsEndD)}
              </p>
            </div>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button type="button" onClick={() => changeNights(-1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0">
                <Minus size={14} />
              </button>
              <div className="flex flex-col items-center min-w-[3rem]">
                <span className="text-xl font-bold text-primary-700 leading-none">{nightsCount}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">{ui.nightsTab}</span>
              </div>
              <button type="button" onClick={() => changeNights(1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0">
                <Plus size={14} />
              </button>
              <button type="button"
                onClick={() => { setOpen(false); setHover(null); }}
                className="ml-2 flex items-center gap-1 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0">
                <Check size={13} />
                {ui.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset ── */}
      {(startD || endD) && (
        <div className={`mt-3 pt-3 border-t border-gray-100 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <button type="button"
            onClick={() => {
              onChange({ checkIn: '', checkOut: '' });
              setPhase('start');
              setHover(null);
            }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            {ui.reset}
          </button>
        </div>
      )}
    </div>
  );

  /* ════════════════════════════════════════════════ RENDER ══════════════════ */
  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Trigger ── */}
      {variant === 'flush' ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className="w-full h-full flex items-stretch outline-none bg-transparent hover:bg-gray-50/60 transition-colors"
        >
          {triggerContent}
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={`w-full flex items-center gap-3 px-4 py-3.5 border rounded-xl text-sm bg-white transition-all outline-none
            ${open
              ? 'border-primary-600 ring-2 ring-primary-100 shadow-sm'
              : 'border-gray-300 hover:border-gray-400'
            }`}
        >
          {triggerContent}
        </button>
      )}

      {/* ── Modal portal (backdrop + centered card) ── */}
      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 99998,
              backgroundColor: open ? 'rgba(0,0,0,0.45)' : 'transparent',
              backdropFilter:       open ? 'blur(4px)' : 'none',
              WebkitBackdropFilter: open ? 'blur(4px)' : 'none',
              pointerEvents: open ? 'auto' : 'none',
              transition: 'background-color 180ms ease, backdrop-filter 180ms ease',
            }}
          />
          {/* Centered card — click outside the card closes the modal */}
          <div
            onClick={() => { setOpen(false); setHover(null); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: open ? 'auto' : 'none',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                opacity:   open ? 1 : 0,
                transform: open ? 'scale(1)' : 'scale(0.95)',
                transition: 'opacity 180ms ease, transform 180ms ease',
                pointerEvents: open ? 'auto' : 'none',
              }}
            >
              {popupContent}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default DateRangePicker;
