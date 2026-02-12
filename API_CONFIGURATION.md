# API Configuration Guide

## Overview
All API endpoints are now centralized in `src/config/api.js`. This allows easy switching between development and production environments.

## Configuration Structure

### Main Configuration File: `src/config/api.js`

The configuration file manages:
- **Environment Detection**: Automatically switches between development and production
- **Base URLs**: 
  - Development: `http://localhost:5000`
  - Production: `https://easy2book-backend.vercel.app`
- **Endpoint Definitions**: All API endpoints are predefined and exported

### Available Endpoints

All endpoints are exported via `API_ENDPOINTS`:

#### Authentication Endpoints
- `AUTH` - Base auth URL
- `AUTH_ME` - Get current user
- `AUTH_LOGIN` - User login
- `AUTH_REGISTER` - User registration
- `AUTH_LOGOUT` - User logout
- `AUTH_REFRESH_TOKEN` - Refresh access token
- `AUTH_UPDATE_PROFILE` - Update user profile
- `AUTH_UPDATE_PASSWORD` - Update password
- `AUTH_FORGOT_PASSWORD` - Forgot password
- `AUTH_RESET_PASSWORD` - Reset password
- `AUTH_VERIFY_EMAIL` - Email verification
- `AUTH_DELETE_ACCOUNT` - Delete user account
- `AUTH_ADMIN_LOGIN` - Admin login

#### Hotels Endpoints
- `MYGO_HOTELS` - Search hotels
- `MYGO_HOTELS_SEARCH` - Advanced hotel search
- `MYGO_HOTELS_DETAILS` - Get hotel details

#### Bookings Endpoints
- `BOOKINGS` - Create/Get bookings
- `BOOKINGS_ADMIN_ALL` - Admin view all bookings

#### Admin Endpoints
- `ADMIN_STATS` - Get admin statistics
- `ADMIN_USERS` - Manage users

## How to Switch Environments

### Method 1: Environment Variable (Recommended)

1. Create a `.env.local` file in the frontend root:
   ```bash
   cp .env.example .env.local
   ```

2. Set the environment:
   ```env
   # For development (local backend)
   REACT_APP_ENV=development
   
   # For production (deployed backend)
   REACT_APP_ENV=production
   ```

3. Restart the development server

### Method 2: Direct Configuration

Edit `src/config/api.js` and change the default ENV:

```javascript
const ENV = process.env.REACT_APP_ENV || 'production'; // Change default here
```

### Method 3: Build-time Configuration

For production builds:
```bash
# Build for production
REACT_APP_ENV=production npm run build

# Build for development testing
REACT_APP_ENV=development npm run build
```

## Usage Examples

### In Components/Services

```javascript
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

// Use predefined endpoints
const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Use base URL for dynamic endpoints
const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
  method: 'GET'
});
```

### Helper Function

For endpoints with dynamic parameters:
```javascript
import { getEndpoint } from '../config/api';

const url = getEndpoint('AUTH_RESET_PASSWORD', { token: resetToken });
```

## Migrated Files

The following files have been updated to use the centralized configuration:

### Context Files
- `src/context/AuthContext.js`
- `src/context/HotelsContext.js`

### Services
- `src/services/authService.js`

### Pages
- `src/pages/BookingPage.js`
- `src/pages/HotelDetails.js`
- `src/pages/MyBookings.js`
- `src/pages/admin/AdminLogin.js`
- `src/pages/admin/Dashboard.js`
- `src/pages/admin/BookingsManager.js`
- `src/pages/admin/UsersManager.js`

### Components
- `src/components/landing/SearchBox.js`

## Best Practices

1. **Always use `API_ENDPOINTS`** for defined endpoints
2. **Use `API_BASE_URL`** for custom/dynamic endpoints
3. **Never hardcode URLs** in component files
4. **Test both environments** before deployment
5. **Keep `.env.local`** out of version control (already in `.gitignore`)

## Adding New Endpoints

To add a new endpoint:

1. Open `src/config/api.js`
2. Add the endpoint to the `API_ENDPOINTS` object:
   ```javascript
   export const API_ENDPOINTS = {
     // ... existing endpoints
     NEW_ENDPOINT: `${API_BASE_URL}/api/new/endpoint`,
   };
   ```
3. Use it in your components:
   ```javascript
   import { API_ENDPOINTS } from '../config/api';
   
   fetch(API_ENDPOINTS.NEW_ENDPOINT)
   ```

## Troubleshooting

### Issue: API calls failing
- Check that `REACT_APP_ENV` is set correctly
- Verify the backend URL in `src/config/api.js`
- Ensure the development server was restarted after changing `.env.local`

### Issue: Environment not switching
- Environment variables must start with `REACT_APP_`
- Restart the development server after changing `.env.local`
- Clear browser cache and rebuild if needed

## Production Deployment

For production deployment:

1. Ensure production URL is correct in `src/config/api.js`
2. Build with production environment:
   ```bash
   REACT_APP_ENV=production npm run build
   ```
3. Deploy the `build` folder

The app will automatically use the production backend URL.
