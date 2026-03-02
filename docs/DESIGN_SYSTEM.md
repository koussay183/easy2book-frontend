# Easy2Book — Design System

Reference this file when building or updating any page or component.
The goal is a **simple, formal, clean** look. One accent color. No decorative noise.

---

## 1. Color Palette

Defined in `tailwind.config.js`:

| Token | Hex | Use |
|---|---|---|
| `primary-50` | `#e6eef5` | Light background tints, notices |
| `primary-100` | `#ccdcea` | Borders on tinted backgrounds |
| `primary-600` | `#003d78` | Focus rings, active borders |
| `primary-700` | `#002d5f` | **Main accent** — buttons, nav bars, icons, badges |
| `primary-800` | `#002d5f` | Button hover state |
| `primary-900` | `#001d3f` | Deep hover / pressed |
| `secondary-400` | `#ffeb85` | **Stars only** (hotel star ratings) |
| `gray-50` | — | Page background, sub-section tints |
| `gray-100` | — | Dividers, subtle borders |
| `gray-200` | — | Card borders, input borders |
| `gray-300` | — | Input borders (default state) |
| `gray-400` | — | Placeholder icons, muted text |
| `gray-500/600` | — | Secondary text |
| `gray-900` | — | Headings, primary text |

**Rule:** Use only `primary-*` and `gray-*`. Do NOT introduce emerald, amber, blue, slate, or purple sections for decorative purposes. `red-*` is reserved for errors only.

---

## 2. Page Layout

```
bg-gray-50 min-h-screen
  ↳ Sticky primary-700 top nav bar (shadow-md)
  ↳ max-w-7xl mx-auto px-4 py-6 md:py-8
      ↳ Content (full-width or grid)
```

**Container:** `max-w-7xl mx-auto px-4`
**Section spacing:** `py-6 md:py-8` for page, `space-y-4` between form sections
**Two-column layout:** `grid grid-cols-1 lg:grid-cols-3 gap-6 items-start` (1/3 sidebar + 2/3 main)

---

## 3. Navigation Bar (Sub-page)

Used on booking flows, search results, detail pages — NOT the main Header.

```jsx
<div className="bg-primary-700 text-white sticky top-0 z-40 shadow-md">
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    {/* Back button */}
    <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium">
      <ArrowLeft size={16} />
      <span className="hidden sm:inline">Back</span>
    </button>

    {/* Title */}
    <h1 className="text-sm font-semibold">Page Title</h1>

    {/* Optional right content (step pills, count, etc.) */}
    <div className="hidden md:flex items-center gap-1 text-xs">...</div>
  </div>
</div>
```

---

## 4. White Cards (Surfaces)

All cards and panels use the same base — white background, subtle gray border, rounded corners:

```jsx
// Standard card
<div className="bg-white rounded-2xl border border-gray-200">
  {/* content */}
</div>

// Card with header section and body
<div className="bg-white rounded-2xl border border-gray-200">
  <div className="px-6 py-4 border-b border-gray-100">
    <h2 className="text-sm font-semibold text-gray-900">Title</h2>
    <p className="text-xs text-gray-400 mt-0.5">Subtitle</p>
  </div>
  <div className="px-6 py-5">
    {/* body */}
  </div>
</div>

// Card with step number badge
<div className="bg-white rounded-2xl border border-gray-200">
  <div className="px-6 py-4 border-b border-gray-100">
    <div className="flex items-center gap-2.5">
      <span className="w-6 h-6 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        1
      </span>
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Section Title</h2>
        <p className="text-xs text-gray-400 mt-0.5">Optional subtitle</p>
      </div>
    </div>
  </div>
  <div className="px-6 py-5">{children}</div>
</div>
```

**Do NOT use:** `border-t-4` colored top borders, gradient headers, multiple accent colors per card.

---

## 5. Form Inputs

All inputs share the same visual language:

```jsx
// Input class helper
const inputCls = (error) =>
  `w-full px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors outline-none
   focus:ring-2 focus:ring-primary-100 focus:border-primary-600
   ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`;

// Input with icon
<div className="relative">
  <Mail size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 pointer-events-none" />
  <input type="email" className={`${inputCls()} pl-9 pr-3`} />
</div>

// Select
<select className="w-full px-3 py-2.5 text-sm border border-gray-300 hover:border-gray-400 rounded-lg
  transition-colors outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600 bg-white">
```

**Field wrapper:**
```jsx
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);
```

---

## 6. Buttons

```jsx
// Primary (main CTA)
<button className="bg-primary-700 hover:bg-primary-800 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">
  Label
</button>

// Primary full-width (submit / confirm)
<button className="w-full py-3.5 rounded-xl font-semibold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors flex items-center justify-center gap-2">
  <Icon size={16} />
  <span>Confirm Booking</span>
  <span className="font-normal opacity-70">— 450 TND</span>
</button>

// Ghost / secondary
<button className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
  Cancel
</button>

// Disabled state
<button disabled className="bg-gray-200 text-gray-400 cursor-not-allowed py-3.5 rounded-xl font-semibold text-sm w-full">
  Processing...
</button>
```

---

## 7. Badges & Pills

```jsx
// Nights / info pill (primary tint)
<div className="inline-flex items-center gap-1.5 bg-primary-50 border border-primary-100 text-primary-700 rounded-lg px-3 py-1.5">
  <Icon size={12} />
  <span className="text-xs font-semibold">2 nuits</span>
</div>

// Status notice (logged in, info)
<div className="flex items-center gap-2.5 bg-primary-50 border border-primary-100 rounded-xl p-3">
  <CheckCircle2 size={15} className="text-primary-600 flex-shrink-0" />
  <p className="text-sm font-medium text-primary-900">You are logged in</p>
</div>

// Error inline
<p className="text-xs text-red-500 mt-1">Required field</p>
```

---

## 8. Sub-section rows (inside cards)

```jsx
// Traveler / child row
<div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
  <span className="block text-xs font-semibold text-gray-700 mb-3">Adult 1</span>
  {/* fields */}
</div>

// Summary label → value row
const Row = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
    <span className="text-xs font-medium text-gray-800 text-right">{value}</span>
  </div>
);

// Date display tile
<div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Check-in</p>
  <p className="text-xs font-semibold text-gray-800 mt-0.5">12 Jan 2025</p>
</div>
```

---

## 9. Selectable Option Cards (radio/choice)

```jsx
// Payment method / option selector
<label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
  active ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'
}`}>
  <input type="radio" className="sr-only" />
  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
    active ? 'bg-primary-700' : 'bg-gray-100'
  }`}>
    <Icon size={16} className={active ? 'text-white' : 'text-gray-500'} />
  </div>
  <div className="flex-1">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-gray-900">Option Label</p>
      {active && <CheckCircle2 size={14} className="text-primary-600" />}
    </div>
    <p className="text-xs text-gray-400 mt-0.5">Description</p>
  </div>
</label>
```

---

## 10. Trust / footer row

```jsx
<div className="flex flex-wrap items-center justify-center gap-4">
  {[
    { icon: Shield, text: 'Secure payment' },
    { icon: CheckCircle2, text: 'Instant confirmation' },
    { icon: Calendar, text: 'Free cancellation' },
  ].map(({ icon: Ic, text }) => (
    <div key={text} className="flex items-center gap-1.5 text-xs text-gray-400">
      <Ic size={12} className="text-gray-400" />
      <span>{text}</span>
    </div>
  ))}
</div>
```

---

## 11. Hotel image with overlay

Used in summary cards and result cards:

```jsx
<div className="relative h-40 overflow-hidden">
  <img src={hotel.Image} alt={hotel.Name} className="w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
  <div className="absolute bottom-0 left-0 right-0 p-3">
    {/* gold stars */}
    <div className="flex items-center gap-0.5 mb-1">
      {Array.from({ length: starRating }).map((_, i) => (
        <Star key={i} size={11} className="fill-secondary-400 text-secondary-400" />
      ))}
    </div>
    <p className="text-white font-semibold text-sm leading-tight">{hotel.Name}</p>
    <div className="flex items-center gap-1 mt-0.5">
      <MapPin size={10} className="text-white/70" />
      <p className="text-white/80 text-xs">{city}</p>
    </div>
  </div>
</div>
```

---

## 12. Typography scale

| Use | Class |
|---|---|
| Page heading (nav bar) | `text-sm font-semibold text-white` |
| Section title | `text-sm font-semibold text-gray-900` |
| Card / item title | `text-sm font-semibold text-gray-900` |
| Body text | `text-sm text-gray-700` |
| Secondary / muted | `text-xs text-gray-400` |
| Field label | `text-xs font-medium text-gray-600` |
| Input text | `text-sm text-gray-900` |
| Price (large) | `text-xl font-bold text-primary-700` |
| Price (small inline) | `text-sm font-medium text-gray-700` |

---

## 13. RTL support

Every flex row that could be RTL must include:
```jsx
className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
```

Text inputs: add `dir={isRTL ? 'rtl' : 'ltr'}`.
Numeric inputs (prices, phone, codes): always `dir="ltr"`.

---

## 14. What NOT to do

- Do not use `border-t-4` colored top borders on cards — creates "rainbow" sections
- Do not use gradient headers (`bg-gradient-to-r from-emerald-... to-...`) as section titles
- Do not introduce new accent colors (emerald, amber, blue, slate) as structural colors
- Do not add `shadow-xl` to form cards — use `border border-gray-200` only
- Do not use `text-2xl` or larger inside form sections
- Do not add decorative background patterns or textures
- `secondary-*` (gold) is for **star ratings only** — not buttons, headers, or badges
