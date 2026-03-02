import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Mail, FileText, Loader2, Calendar, 
  Hotel, MapPin, DollarSign, Users, CheckCircle, 
  XCircle, AlertCircle, Clock, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';

const GuestBookingLookup = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [email, setEmail] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  // Load saved guest booking info on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('guestBookingEmail');
    const savedBookingId = localStorage.getItem('guestBookingId');
    if (savedEmail) setEmail(savedEmail);
    if (savedBookingId) setBookingId(savedBookingId);
  }, []);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const response = await fetch(`${API_ENDPOINTS.BOOKINGS}/guest/lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          bookingId: bookingId.trim()
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setBooking(data.data.booking);
      } else {
        setError(data.message || (language === 'fr' 
          ? 'Réservation non trouvée. Vérifiez votre email et ID de réservation.'
          : 'Booking not found. Please check your email and booking ID.'));
      }
    } catch (err) {
      console.error('Error looking up booking:', err);
      setError(language === 'fr' 
        ? 'Erreur lors de la recherche de la réservation.'
        : 'Error looking up booking.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700', 
        icon: Clock,
        label: language === 'fr' ? 'En attente' : 'Pending' 
      },
      confirmed: { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        icon: CheckCircle,
        label: language === 'fr' ? 'Confirmée' : 'Confirmed' 
      },
      cancelled: { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        icon: XCircle,
        label: language === 'fr' ? 'Annulée' : 'Cancelled' 
      },
      completed: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        icon: CheckCircle,
        label: language === 'fr' ? 'Terminée' : 'Completed' 
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.text} font-semibold`}>
        <Icon size={18} />
        <span>{config.label}</span>
      </div>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const paymentConfig = {
      pending: { 
        bg: 'bg-orange-100', 
        text: 'text-orange-700',
        label: language === 'fr' ? 'En attente' : 'Pending' 
      },
      paid: { 
        bg: 'bg-green-100', 
        text: 'text-green-700',
        label: language === 'fr' ? 'Payé' : 'Paid' 
      },
      failed: { 
        bg: 'bg-red-100', 
        text: 'text-red-700',
        label: language === 'fr' ? 'Échoué' : 'Failed' 
      }
    };

    const config = paymentConfig[paymentStatus] || paymentConfig.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
          <span className="font-semibold">
            {language === 'fr' ? 'Retour' : language === 'ar' ? 'رجوع' : 'Back'}
          </span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'fr' ? 'Rechercher votre réservation' : language === 'ar' ? 'البحث عن حجزك' : 'Lookup Your Booking'}
          </h1>
          <p className="text-gray-600">
            {language === 'fr' 
              ? 'Entrez votre email et ID de réservation pour vérifier le statut'
              : language === 'ar' 
              ? 'أدخل بريدك الإلكتروني ورقم الحجز للتحقق من الحالة'
              : 'Enter your email and booking ID to check status'}
          </p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'fr' ? 'Adresse email' : language === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
                  className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'fr' ? 'ID de réservation' : language === 'ar' ? 'رقم الحجز' : 'Booking ID'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <FileText className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  required
                  placeholder="65f4a2b3c1d2e3f4a5b6c7d8"
                  className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm`}
                  dir="ltr"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3" dir={isRTL ? 'rtl' : 'ltr'}>
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {language === 'fr' ? 'Recherche...' : language === 'ar' ? 'جاري البحث...' : 'Searching...'}
                </>
              ) : (
                <>
                  <Search size={20} />
                  {language === 'fr' ? 'Rechercher' : language === 'ar' ? 'بحث' : 'Search'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Booking Details */}
        {booking && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary-700 to-primary-800 text-white p-6">
              <h2 className="text-2xl font-bold mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'fr' ? 'Détails de la réservation' : language === 'ar' ? 'تفاصيل الحجز' : 'Booking Details'}
              </h2>
              <p className="text-primary-100 text-sm font-mono" dir="ltr">
                ID: {booking._id}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex flex-wrap items-center gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'fr' ? 'Statut' : language === 'ar' ? 'الحالة' : 'Status'}
                  </p>
                  {getStatusBadge(booking.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'fr' ? 'Paiement' : language === 'ar' ? 'الدفع' : 'Payment'}
                  </p>
                  {getPaymentStatusBadge(booking.paymentStatus)}
                </div>
              </div>

              {/* Hotel Information */}
              {booking.hotelBooking && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
                    <Hotel size={20} className="text-primary-600" />
                    {language === 'fr' ? 'Informations de l\'hôtel' : language === 'ar' ? 'معلومات الفندق' : 'Hotel Information'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="flex items-start gap-3">
                      <Calendar className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">
                          {language === 'fr' ? 'Dates' : language === 'ar' ? 'التواريخ' : 'Dates'}
                        </p>
                        <p className="font-semibold text-gray-900" dir="ltr">
                          {booking.hotelBooking.CheckIn} → {booking.hotelBooking.CheckOut}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">
                          {language === 'fr' ? 'Prix total' : language === 'ar' ? 'السعر الإجمالي' : 'Total Price'}
                        </p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {booking.totalPrice} TND
                        </p>
                      </div>
                    </div>

                    {booking.paymentMethod && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                        <div>
                          <p className="text-sm text-gray-500">
                            {language === 'fr' ? 'Méthode de paiement' : language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                          </p>
                          <p className="font-semibold text-gray-900">
                            {booking.paymentMethod === 'online' 
                              ? (language === 'fr' ? 'Paiement en ligne' : 'Online Payment')
                              : (language === 'fr' ? 'Paiement à l\'agence' : 'Pay at Agency')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Guest Information */}
              {booking.guestInfo && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
                    <Users size={20} className="text-primary-600" />
                    {language === 'fr' ? 'Informations du client' : language === 'ar' ? 'معلومات العميل' : 'Guest Information'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'fr' ? 'Nom' : language === 'ar' ? 'الاسم' : 'Name'}
                      </p>
                      <p className="font-semibold text-gray-900">{booking.guestInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'fr' ? 'Email' : language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </p>
                      <p className="font-semibold text-gray-900" dir="ltr">{booking.guestInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'fr' ? 'Téléphone' : language === 'ar' ? 'الهاتف' : 'Phone'}
                      </p>
                      <p className="font-semibold text-gray-900" dir="ltr">{booking.guestInfo.phone}</p>
                    </div>
                    {booking.guestInfo.country && (
                      <div>
                        <p className="text-sm text-gray-500">
                          {language === 'fr' ? 'Pays' : language === 'ar' ? 'البلد' : 'Country'}
                        </p>
                        <p className="font-semibold text-gray-900">{booking.guestInfo.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Important Notes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" dir={isRTL ? 'rtl' : 'ltr'}>
                <p className="text-sm text-blue-900">
                  {language === 'fr' 
                    ? '💡 Conservez votre ID de réservation pour future référence. Vous recevrez également un email de confirmation.'
                    : language === 'ar'
                    ? '💡 احتفظ برقم الحجز للرجوع إليه مستقبلاً. سوف تتلقى أيضاً بريد إلكتروني للتأكيد.'
                    : '💡 Keep your booking ID for future reference. You will also receive a confirmation email.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!booking && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <h3 className="font-bold text-blue-900 mb-2">
              {language === 'fr' ? 'Besoin d\'aide?' : language === 'ar' ? 'تحتاج مساعدة؟' : 'Need help?'}
            </h3>
            <p className="text-sm text-blue-800">
              {language === 'fr' 
                ? 'Si vous avez des questions concernant votre réservation, contactez-nous.'
                : language === 'ar'
                ? 'إذا كان لديك أسئلة حول حجزك، اتصل بنا.'
                : 'If you have questions about your booking, contact us.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestBookingLookup;
