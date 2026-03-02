import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Loader2, Home, FileText, AlertCircle 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getPaymentStatus } from '../services/paymentService';

const PaymentCallback = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    validatePayment();
  }, []);

  const validatePayment = async () => {
    try {
      setLoading(true);
      
      // Get payment reference from URL params or localStorage
      const paymentRef = searchParams.get('payment_ref') || 
                        searchParams.get('paymentRef') || 
                        localStorage.getItem('pendingPaymentRef');
      
      if (!paymentRef) {
        setError('No payment reference found');
        setLoading(false);
        return;
      }
      
      // Poll for payment status
      const result = await getPaymentStatus(paymentRef);
      
      setPaymentStatus(result.paymentStatus);
      setBooking(result.booking);
      
      // Clear pending payment data from localStorage
      localStorage.removeItem('pendingPaymentRef');
      localStorage.removeItem('pendingBookingId');
      
    } catch (err) {
      console.error('Payment validation error:', err);
      setError(err.message || 'Failed to validate payment');
    } finally {
      setLoading(false);
    }
  };

  const t = {
    checking: language === 'fr' ? 'Vérification du paiement...' : language === 'ar' ? 'التحقق من الدفع...' : 'Checking payment...',
    checkingDesc: language === 'fr' 
      ? 'Veuillez patienter pendant que nous vérifions le statut de votre paiement.' 
      : language === 'ar'
      ? 'يرجى الانتظار بينما نتحقق من حالة الدفع الخاصة بك.'
      : 'Please wait while we verify your payment status.',
    
    success: language === 'fr' ? 'Paiement réussi !' : language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!',
    successDesc: language === 'fr' 
      ? 'Votre paiement a été traité avec succès. Votre réservation est maintenant confirmée.' 
      : language === 'ar'
      ? 'تم معالجة الدفع بنجاح. تم تأكيد حجزك الآن.'
      : 'Your payment has been processed successfully. Your booking is now confirmed.',
    
    failed: language === 'fr' ? 'Paiement échoué' : language === 'ar' ? 'فشل الدفع' : 'Payment Failed',
    failedDesc: language === 'fr' 
      ? 'Votre paiement n\'a pas pu être traité. Veuillez réessayer.' 
      : language === 'ar'
      ? 'لم يتم معالجة الدفع الخاص بك. يرجى المحاولة مرة أخرى.'
      : 'Your payment could not be processed. Please try again.',
    
    pending: language === 'fr' ? 'Paiement en attente' : language === 'ar' ? 'الدفع قيد الانتظار' : 'Payment Pending',
    pendingDesc: language === 'fr' 
      ? 'Votre paiement est en cours de traitement. Cela peut prendre quelques instants.' 
      : language === 'ar'
      ? 'دفعك قيد المعالجة. قد يستغرق ذلك بضع لحظات.'
      : 'Your payment is being processed. This may take a few moments.',
    
    error: language === 'fr' ? 'Erreur' : language === 'ar' ? 'خطأ' : 'Error',
    errorDesc: language === 'fr' 
      ? 'Une erreur s\'est produite lors de la vérification de votre paiement.' 
      : language === 'ar'
      ? 'حدث خطأ أثناء التحقق من الدفع الخاص بك.'
      : 'An error occurred while checking your payment.',
    
    bookingNumber: language === 'fr' ? 'Numéro de réservation' : language === 'ar' ? 'رقم الحجز' : 'Booking Number',
    confirmationCode: language === 'fr' ? 'Code de confirmation' : language === 'ar' ? 'رمز التأكيد' : 'Confirmation Code',
    
    backHome: language === 'fr' ? 'Retour à l\'accueil' : language === 'ar' ? 'العودة للرئيسية' : 'Back to Home',
    viewBookings: language === 'fr' ? 'Mes réservations' : language === 'ar' ? 'حجوزاتي' : 'My Bookings',
    tryAgain: language === 'fr' ? 'Réessayer le paiement' : language === 'ar' ? 'حاول الدفع مرة أخرى' : 'Try Payment Again',
    contactSupport: language === 'fr' ? 'Contacter le support' : language === 'ar' ? 'اتصل بالدعم' : 'Contact Support',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {t.checking}
          </h1>
          <p className="text-gray-600">
            {t.checkingDesc}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-600" size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {t.error}
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Home size={20} />
              {t.backHome}
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              {t.viewBookings}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'paid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {t.success}
            </h1>
            <p className="text-gray-600 mb-6">
              {t.successDesc}
            </p>
            
            {booking && (
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">{t.confirmationCode}</p>
                <p className="text-2xl font-bold text-green-600 font-mono tracking-wider" dir="ltr">
                  {booking.confirmationCode}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Home size={20} />
                {t.backHome}
              </button>
              <button
                onClick={() => navigate('/my-bookings')}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                {t.viewBookings}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-600" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {t.failed}
            </h1>
            <p className="text-gray-600 mb-6">
              {t.failedDesc}
            </p>
            
            {booking && (
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">{t.bookingNumber}</p>
                <p className="text-xl font-bold text-gray-900 font-mono" dir="ltr">
                  {booking._id?.slice(-8).toUpperCase()}
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/my-bookings')}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                {t.tryAgain}
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Home size={20} />
                {t.backHome}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending status
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-gray-100 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="text-yellow-600 animate-spin" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t.pending}
          </h1>
          <p className="text-gray-600 mb-6">
            {t.pendingDesc}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Home size={20} />
              {t.backHome}
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              {t.viewBookings}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
