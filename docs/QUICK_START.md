# API Configuration - Quick Start

## What Changed?

All API URLs have been centralized into one configuration file: `src/config/api.js`

## How to Use

### Switch to Production Backend

Create a `.env.local` file in the frontend root:

```env
REACT_APP_ENV=production
```

Then restart your development server:
```bash
npm start
```

### Switch to Development Backend

In `.env.local`:
```env
REACT_APP_ENV=development
```

Or simply delete the `.env.local` file (development is the default).

## Backend URLs

- **Development**: `http://localhost:5000`
- **Production**: `https://easy2book-backend.vercel.app`

## Files Modified

✅ All 15+ files with API calls have been updated
✅ No more hardcoded URLs
✅ Single source of truth: `src/config/api.js`

## For More Details

See `API_CONFIGURATION.md` for complete documentation.

---

**Production URL**: https://easy2book-backend.vercel.app/
