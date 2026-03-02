# Online Payment Gateway Integration

This document describes the implementation of the online payment gateway (Konnect) integration in the Easy2Book frontend application.

## Overview

The payment flow allows users to pay for their hotel bookings online through a secure payment gateway. When a user selects "online" as the payment method during booking, they are automatically redirected to the payment gateway to complete the transaction.

**Important:** For online payments, the booking is **only created AFTER successful payment**. This prevents having abandoned unpaid bookings in the system and ensures all online bookings have confirmed payments.

### Benefits of this approach:
- ✅ No unpaid bookings cluttering the database
- ✅ All online bookings are guaranteed to be paid
- ✅ Cleaner booking management for admins
- ✅ Better inventory control
- ✅ Reduced manual cleanup of abandoned bookings

## Flow Diagram

```
User creates booking with paymentMethod: "online"
    ↓
BookingPage collects booking data (does NOT create booking yet)
    ↓
BookingPage → POST /api/payments/initiate with bookingData
    ↓
Backend stores temporary booking data and returns { payUrl, paymentRef }
    ↓
User redirected to payUrl (Konnect payment gateway)
    ↓
User completes payment on gateway
    ↓
Gateway sends webhook to backend → POST /api/payments/webhook
    ↓
Backend creates actual booking with paymentStatus: "paid" (only if payment succeeds)
    ↓
Gateway redirects user to /payment/callback?payment_ref=XXX
    ↓
PaymentCallback page → GET /api/payments/:paymentRef/status
    ↓
Display success/failure message with newly created booking details

For agency payment:
User creates booking with paymentMethod: "agency"
    ↓
BookingPage → POST /api/bookings (creates booking immediately)
    ↓
Navigate to BookingConfirmation page with booking details
```

## Files Modified/Created

### 1. `/src/config/api.js`
**Changes:** Added payment API endpoints
```javascript
PAYMENT_INITIATE: `${API_BASE_URL}/api/payments/initiate`,
PAYMENT_STATUS: `${API_BASE_URL}/api/payments`, // /:paymentRef/status
PAYMENT_WEBHOOK: `${API_BASE_URL}/api/payments/webhook`,
```

### 2. `/src/services/paymentService.js` (NEW)
**Purpose:** Service layer for payment operations

**Functions:**
- `initiatePayment(bookingIdOrData)` - Initiates payment with either:
  - Booking data (object) for new bookings → Backend stores temp data
  - Booking ID (string) for existing bookings → Backend uses existing booking
- `getPaymentStatus(paymentRef)` - Gets payment status and booking details by reference
- `pollPaymentStatus(paymentRef, maxAttempts, interval)` - Polls payment status until it changes from pending

### 3. `/src/pages/BookingPage.js`
**Changes:**
- Added conditional logic based on payment method
- **For online payments:**
  - Does NOT create booking via POST /api/bookings
  - Calls `initiatePayment(bookingData)` with full booking data
  - Redirects immediately to payment gateway
- **For agency payments:**
  - Creates booking normally via POST /api/bookings
  - Shows BookingConfirmation page

**Key Logic:**
```javascript
if (paymentMethod === 'online') {
  // Don't create booking yet, initiate payment with booking data
  const { payUrl, paymentRef } = await initiatePayment(bookingData);
  localStorage.setItem('pendingPaymentRef', paymentRef);
  window.location.href = payUrl; // Redirect to gateway
  return;
}

// For agency payment, create booking normally
const response = await fetch(API_ENDPOINTS.BOOKINGS, {...});
navigate('/booking-confirmation', { state: { booking, paymentMethod, isGuest } });
```

### 3. `/src/pages/BookingConfirmation.js`
**Changes:** 
- Now only used for **agency payments** (bookings created immediately)
- Online payments don't use this page anymore
- Removed auto-payment initiation logic

### 4. `/src/pages/MyBookings.js`
**Changes:**
- Added "Pay Now" button for bookings with `paymentMethod: "online"` and `paymentStatus: "pending"`
- Imports payment service
- Handles payment initiation with loading state
- Shows payment status badges

**Key Features:**
- Green "Pay Now" button appears next to "View Details" for unpaid online bookings
- Button shows loading spinner during payment initiation
- Users can retry failed payments

### 5. `/src/pages/PaymentCallback.js` (NEW)
**Purpose:** Handles redirect from payment gateway after payment completion

**Features:**
- Validates payment status on mount
- Retrieves payment reference from URL params or localStorage
- Shows different UI based on payment status:
  - **Success (paid):** Green checkmark, confirmation code, links to home/bookings
  - **Failed:** Red X, error message, retry payment button
  - **Pending:** Yellow spinner, processing message
  - **Error:** Alert icon, error details
- Clears pending payment data from localStorage after validation

### 6. `/src/App.js`
**Changes:**
- Added route for payment callback: `/payment/callback`
- Imported PaymentCallback component

## Backend Requirements

The frontend expects the following backend endpoints:

### POST /api/payments/initiate
**Purpose:** Initiates payment for a new booking OR an existing unpaid booking

**Request (for NEW booking - online payment):**
```json
{
  "bookingData": {
    "hotelBooking": {
      "PreBooking": true,
      "City": "123",
      "Hotel": 456,
      "CheckIn": "2026-03-15",
      "CheckOut": "2026-03-20",
      "Rooms": [...],
      "Source": "local-2"
    },
    "paymentMethod": "online",
    "totalPrice": 500.00,
    "guestInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+21612345678"
    }
  }
}
```

**Request (for EXISTING unpaid booking):**
```json
{
  "bookingId": "64f9a1b2c3d4e5f6a7b8c9d0"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "payUrl": "https://gateway.konnect.network/payment/xxx",
    "paymentRef": "PAY_REF_123456"
  }
}
```

**Backend should:**
1. If `bookingData` is provided (new booking):
   - Store booking data temporarily (in-memory, Redis, or temp DB collection)
   - Create payment session with Konnect
   - Associate paymentRef with temporary booking data
   - Return payment URL
   - **Do NOT create actual booking yet**
   
2. If `bookingId` is provided (existing booking):
   - Find booking by ID
   - Verify payment is still pending
   - Create payment session with booking amount
   - Associate paymentRef with bookingId
   - Return payment URL

### GET /api/payments/:paymentRef/status
**Response:**
```json
{
  "status": "success",
  "data": {
    "paymentStatus": "paid", // or "pending", "failed"
    "booking": {
      "_id": "64f9a1b2c3d4e5f6a7b8c9d0",
      "confirmationCode": "ABC123",
      "paymentStatus": "paid",
      // ... other booking details
    }
  }
}
```

### POST /api/payments/webhook
**Konnect sends webhook to this endpoint:**
```json
{
  "payment_ref": "PAY_REF_123456",
  "status": "paid", // or "failed"
  "amount": 500.00,
  "currency": "TND",
  // ... other Konnect payment details
}
```

**Backend should:**
1. Verify webhook authenticity (signature validation)
2. Find temporary booking data or existing booking by payment reference
3. **If NEW booking (from temp data):**
   - Create actual booking in database with paymentStatus: "paid"
   - Generate confirmation code
   - Send confirmation email
   - Clear temporary booking data
4. **If EXISTING booking:**
   - Update booking.paymentStatus to "paid"
   - Send confirmation email
5. **If payment failed:**
   - For new bookings: Just clear temp data (don't create booking)
   - For existing bookings: Keep booking with paymentStatus: "failed"

## User Experience

### For New Online Bookings:
1. User fills booking form and selects "Online Payment"
2. User clicks "Confirm Booking"
3. **Booking is NOT created yet** - booking data is sent to payment initiation
4. User is immediately redirected to Konnect payment gateway
5. User completes payment on gateway
6. Backend receives webhook and **creates booking ONLY if payment succeeds**
7. User is redirected back to `/payment/callback`
8. Success message is displayed with newly created booking details

### For New Agency Bookings:
1. User fills booking form and selects "Pay at Agency"
2. Booking is created immediately with status "pending"
3. User sees BookingConfirmation page with all details
4. User can pay later at the agency

### For Existing Unpaid Bookings:
1. User goes to "My Bookings" page
2. Unpaid online bookings show a green "Pay Now" button
3. Clicking "Pay Now" initiates payment with existing booking ID
4. User is redirected to gateway
5. After payment, booking status is updated
6. User returns to callback page

## LocalStorage Usage

The integration uses localStorage to track pending payments:

- `pendingPaymentRef`: Payment reference for validation
- `pendingBookingId`: Associated booking ID

These are cleared after successful validation on the callback page.

## Error Handling

### Payment Initiation Errors:
- Network errors
- Invalid booking ID
- Backend errors

**Handling:** Shows error alert with retry button on BookingConfirmation page

### Payment Status Validation Errors:
- No payment reference found
- Network errors during status check
- Invalid payment reference

**Handling:** Shows error page with navigation options

### Failed Payments:
- Payment declined by gateway
- Insufficient funds
- User cancellation

**Handling:** Shows failure page with "Try Again" button that returns to My Bookings

## Testing Checklist

- [ ] Create booking with online payment method
- [ ] Verify redirect to payment gateway
- [ ] Complete payment successfully on gateway
- [ ] Verify redirect back to success callback page
- [ ] Check booking status updated to "paid"
- [ ] Cancel payment on gateway
- [ ] Verify redirect to failure callback page
- [ ] Retry payment from My Bookings page
- [ ] Test with network errors during initiation
- [ ] Test with invalid payment references
- [ ] Verify payment status polling works
- [ ] Test multi-language support (FR/AR/EN)
- [ ] Test RTL layout in Arabic

## Security Considerations

1. **Payment Reference Validation:** Backend must verify payment references are valid
2. **Webhook Signature:** Backend must validate Konnect webhook signatures
3. **Amount Verification:** Backend must verify payment amount matches booking total
4. **Idempotency:** Backend must handle duplicate webhook calls
5. **HTTPS Only:** All payment URLs must use HTTPS
6. **No Sensitive Data:** Never store card details in frontend

## Configuration

Payment gateway configuration is done on the backend. The frontend only needs the API base URL which is configured in `/src/config/api.js`:

```javascript
const API_URLS = {
  development: 'http://localhost:5000',
  production: 'https://easy2book-backend.vercel.app'
};
```

Change `process.env.REACT_APP_ENV` to switch environments.

## Future Enhancements

1. **Payment History:** Show detailed payment history per booking
2. **Multiple Payment Methods:** Support credit card, wallet, etc.
3. **Partial Payments:** Allow deposits or installments
4. **Payment Receipts:** Generate PDF receipts
5. **Refund Handling:** Process refunds through the gateway
6. **Payment Reminders:** Email reminders for unpaid bookings
7. **Currency Conversion:** Support multiple currencies with real-time rates

## Support

For issues or questions:
- Frontend: Check browser console for errors
- Backend: Check backend logs for payment webhook processing
- Gateway: Contact Konnect support for payment gateway issues
