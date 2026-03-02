import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Home, Mail, Phone, Calendar, Users, CreditCard, 
  Building2, Copy, ExternalLink, ArrowRight, Star, MapPin, Clock,
  FileText, User, Utensils
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BookingConfirmation = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, paymentMethod, isGuest } = location.state || {};

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    // Note: For online payments, booking is created AFTER payment
    // So this page is only used for agency payments
    // Online payment confirmation happens in PaymentCallback page
  }, []);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(language === 'fr' 
      ? 'Code de confirmation copié !' 
      : language === 'ar' 
      ? 'تم نسخ رمز التأكيد!' 
      : 'Confirmation code copied!');
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="text-red-600" size={32} />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">
            {language === 'fr' ? 'Aucune réservation trouvée' : language === 'ar' ? 'لم يتم العثور على حجز' : 'No booking found'}
          </p>
          <p className="text-gray-600 mb-6">
            {language === 'fr' ? 'Cette page est accessible uniquement après une réservation' : language === 'ar' ? 'هذه الصفحة متاحة فقط بعد الحجز' : 'This page is only accessible after booking'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            {language === 'fr' ? 'Retour à l\'accueil' : language === 'ar' ? 'العودة للرئيسية' : 'Back to home'}
          </button>
        </div>
      </div>
    );
  }

  const t = {
    success: language === 'fr' ? 'Réservation confirmée !' : language === 'ar' ? 'تم تأكيد الحجز!' : 'Booking Confirmed!',
    successMsg: language === 'fr' 
      ? 'Votre réservation a été créée avec succès. Vous recevrez un email de confirmation.' 
      : language === 'ar'
      ? 'تم إنشاء حجزك بنجاح. ستتلقى بريدًا إلكترونيًا للتأكيد.'
      : 'Your booking has been created successfully. You will receive a confirmation email.',
    confirmationCode: language === 'fr' ? 'Code de confirmation' : language === 'ar' ? 'رمز التأكيد' : 'Confirmation Code',
    copy: language === 'fr' ? 'Copier' : language === 'ar' ? 'نسخ' : 'Copy',
    bookingDetails: language === 'fr' ? 'Détails de la réservation' : language === 'ar' ? 'تفاصيل الحجز' : 'Booking Details',
    hotelInfo: language === 'fr' ? 'Informations de l\'hôtel' : language === 'ar' ? 'معلومات الفندق' : 'Hotel Information',
    stayDates: language === 'fr' ? 'Dates de séjour' : language === 'ar' ? 'تواريخ الإقامة' : 'Stay Dates',
    checkIn: language === 'fr' ? 'Arrivée' : language === 'ar' ? 'الوصول' : 'Check-in',
    checkOut: language === 'fr' ? 'Départ' : language === 'ar' ? 'المغادرة' : 'Check-out',
    nights: language === 'fr' ? 'nuits' : language === 'ar' ? 'ليالي' : 'nights',
    night: language === 'fr' ? 'nuit' : language === 'ar' ? 'ليلة' : 'night',
    guests: language === 'fr' ? 'Voyageurs' : language === 'ar' ? 'المسافرين' : 'Guests',
    adults: language === 'fr' ? 'adultes' : language === 'ar' ? 'كبار' : 'adults',
    adult: language === 'fr' ? 'adulte' : language === 'ar' ? 'كبير' : 'adult',
    children: language === 'fr' ? 'enfants' : language === 'ar' ? 'أطفال' : 'children',
    child: language === 'fr' ? 'enfant' : language === 'ar' ? 'طفل' : 'child',
    paymentInfo: language === 'fr' ? 'Informations de paiement' : language === 'ar' ? 'معلومات الدفع' : 'Payment Information',
    paymentMethod: language === 'fr' ? 'Mode de paiement' : language === 'ar' ? 'طريقة الدفع' : 'Payment Method',
    paymentStatus: language === 'fr' ? 'Statut' : language === 'ar' ? 'الحالة' : 'Status',
    totalAmount: language === 'fr' ? 'Montant total' : language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount',
    contactInfo: language === 'fr' ? 'Coordonnées de contact' : language === 'ar' ? 'معلومات الاتصال' : 'Contact Information',
    specialRequests: language === 'fr' ? 'Demandes spéciales' : language === 'ar' ? 'طلبات خاصة' : 'Special Requests',
    travelerInfo: language === 'fr' ? 'Informations des voyageurs' : language === 'ar' ? 'معلومات المسافرين' : 'Traveler Information',
    backHome: language === 'fr' ? 'Retour à l\'accueil' : language === 'ar' ? 'العودة للرئيسية' : 'Back to Home',
    viewBookings: language === 'fr' ? 'Mes réservations' : language === 'ar' ? 'حجوزاتي' : 'My Bookings',
    trackBooking: language === 'fr' ? 'Suivre ma réservation' : language === 'ar' ? 'تتبع حجزي' : 'Track My Booking',
    whatNext: language === 'fr' ? 'Prochaines étapes' : language === 'ar' ? 'الخطوات التالية' : 'What\'s Next',
    step1: language === 'fr' ? 'Vérifiez votre email' : language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check your email',
    step1Desc: language === 'fr' 
      ? 'Vous recevrez un email de confirmation avec tous les détails' 
      : language === 'ar'
      ? 'ستتلقى بريدًا إلكترونيًا للتأكيد مع جميع التفاصيل'
      : 'You will receive a confirmation email with all details',
    step2: language === 'fr' ? 'Complétez le paiement' : language === 'ar' ? 'أكمل الدفع' : 'Complete Payment',
    step2Desc: language === 'fr' 
      ? 'Suivez les instructions pour finaliser le paiement' 
      : language === 'ar'
      ? 'اتبع التعليمات لإتمام الدفع'
      : 'Follow the instructions to finalize payment',
    step3: language === 'fr' ? 'Préparez votre voyage' : language === 'ar' ? 'جهز رحلتك' : 'Prepare Your Trip',
    step3Desc: language === 'fr' 
      ? 'Gardez votre code de confirmation pour le check-in' 
      : language === 'ar'
      ? 'احتفظ برمز التأكيد لتسجيل الوصول'
      : 'Keep your confirmation code for check-in',
    online: language === 'fr' ? 'Paiement en ligne' : language === 'ar' ? 'الدفع عبر الإنترنت' : 'Online Payment',
    agency: language === 'fr' ? 'Paiement à l\'agence' : language === 'ar' ? 'الدفع في الوكالة' : 'Pay at Agency',
    pending: language === 'fr' ? 'En attente' : language === 'ar' ? 'قيد الانتظار' : 'Pending',
    confirmed: language === 'fr' ? 'Confirmé' : language === 'ar' ? 'مؤكد' : 'Confirmed',
    holder: language === 'fr' ? 'Titulaire' : language === 'ar' ? 'صاحب الحجز' : 'Holder',
    boarding: language === 'fr' ? 'Pension' : language === 'ar' ? 'نظام الإقامة' : 'Board Type',
  };

  // Calculate nights
  const checkIn = new Date(booking.hotelBooking.CheckIn);
  const checkOut = new Date(booking.hotelBooking.CheckOut);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  // Get room info
  const room = booking.hotelBooking.Rooms[0];
  const adults = room?.Pax?.Adult || [];
  const children = room?.Pax?.Child || [];

  // Get payment method text
  const paymentMethodText = paymentMethod === 'online' ? t.online : t.agency;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6 border-4 border-green-500">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {t.success}
            </h1>
            <p className="text-green-100 text-lg max-w-2xl mx-auto">
              {t.successMsg}
            </p>
          </div>

          {/* Confirmation Code */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 border-b-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-600 text-center mb-2 uppercase tracking-wide">
              {t.confirmationCode}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="bg-white border-4 border-green-500 rounded-xl px-6 py-4 inline-flex items-center gap-3 shadow-lg">
                <span className="text-3xl sm:text-4xl font-bold text-green-600 font-mono tracking-wider" dir="ltr">
                  {booking.confirmationCode}
                </span>
                <button
                  onClick={() => copyToClipboard(booking.confirmationCode)}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
                  title={t.copy}
                >
                  <Copy size={24} className="text-green-600 group-hover:text-green-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ArrowRight size={24} className="text-primary-600" />
            {t.whatNext}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <Mail className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">1. {t.step1}</h3>
              <p className="text-sm text-gray-700">{t.step1Desc}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3">
                <CreditCard className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2. {t.step2}</h3>
              <p className="text-sm text-gray-700">{t.step2Desc}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">3. {t.step3}</h3>
              <p className="text-sm text-gray-700">{t.step3Desc}</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText size={24} />
              {t.bookingDetails}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Stay Dates */}
            <div className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar size={20} className="text-primary-600" />
                <h3 className="font-bold text-gray-900">{t.stayDates}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t.checkIn}</p>
                  <p className="text-lg font-bold text-gray-900" dir="ltr">
                    {booking.hotelBooking.CheckIn}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t.checkOut}</p>
                  <p className="text-lg font-bold text-gray-900" dir="ltr">
                    {booking.hotelBooking.CheckOut}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-primary-600">
                <Clock size={16} />
                <span className="font-semibold">
                  {nights} {nights === 1 ? t.night : t.nights}
                </span>
              </div>
            </div>

            {/* Room & Boarding */}
            <div className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Home size={20} className="text-primary-600" />
                <h3 className="font-bold text-gray-900">{t.hotelInfo}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'fr' ? 'Chambre' : language === 'ar' ? 'الغرفة' : 'Room'}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {language === 'fr' ? 'Chambre' : language === 'ar' ? 'غرفة' : 'Room'} #{room.Id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t.boarding}</p>
                  <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg border border-primary-300">
                    <Utensils size={16} />
                    <span className="font-bold">
                      {language === 'fr' ? 'Pension' : language === 'ar' ? 'نظام' : 'Boarding'} {room.Boarding}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Users size={20} className="text-primary-600" />
                <h3 className="font-bold text-gray-900">{t.guests}</h3>
              </div>
              <div className="flex items-center gap-4 text-gray-900">
                <span className="font-semibold">
                  {adults.length} {adults.length === 1 ? t.adult : t.adults}
                </span>
                {children.length > 0 && (
                  <>
                    <span className="text-gray-400">+</span>
                    <span className="font-semibold">
                      {children.length} {children.length === 1 ? t.child : t.children}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Traveler Information */}
            {adults.length > 0 && (
              <div className="border-2 border-blue-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-white">
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <User size={20} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">{t.travelerInfo}</h3>
                </div>
                <div className="space-y-3">
                  {adults.map((adult, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div>
                          <span className="font-semibold text-gray-900">
                            {adult.Civility} {adult.Name} {adult.Surname}
                          </span>
                        </div>
                        {adult.Holder && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold border border-green-300">
                            {t.holder}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {children.map((child, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="font-semibold text-gray-900">
                          {child.Name} {child.Surname}
                        </span>
                        <span className="text-sm text-gray-600">
                          {language === 'fr' ? 'Âge' : language === 'ar' ? 'العمر' : 'Age'}: {child.Age}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail size={20} className="text-primary-600" />
                <h3 className="font-bold text-gray-900">{t.contactInfo}</h3>
              </div>
              <div className="space-y-3">
                {booking.isGuest && booking.guestInfo && (
                  <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <User size={16} className="text-gray-600" />
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Nom' : language === 'ar' ? 'الاسم' : 'Name'}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">{booking.guestInfo.name}</p>
                  </div>
                )}
                <div>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Mail size={16} className="text-gray-600" />
                    <p className="text-sm text-gray-600">Email</p>
                  </div>
                  <p className="font-semibold text-gray-900" dir="ltr">{booking.contactEmail}</p>
                </div>
                <div>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Phone size={16} className="text-gray-600" />
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Téléphone' : language === 'ar' ? 'الهاتف' : 'Phone'}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900" dir="ltr">{booking.contactPhone}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border-2 border-green-200 rounded-xl p-5 bg-gradient-to-br from-green-50 to-white">
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CreditCard size={20} className="text-green-600" />
                <h3 className="font-bold text-gray-900">{t.paymentInfo}</h3>
              </div>
              <div className="space-y-3">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{t.paymentMethod}</span>
                  <span className="font-bold text-gray-900 flex items-center gap-2">
                    {paymentMethod === 'online' ? <CreditCard size={16} /> : <Building2 size={16} />}
                    {paymentMethodText}
                  </span>
                </div>
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{t.paymentStatus}</span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-bold border border-yellow-300">
                    {t.pending}
                  </span>
                </div>
                <div className="border-t-2 border-green-300 pt-3 mt-3">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-lg font-bold text-gray-900">{t.totalAmount}</span>
                    <div className="text-right" dir="ltr">
                      <div className="text-3xl font-bold text-green-600">
                        {parseFloat(booking.totalPrice).toFixed(2)} <span className="text-lg">{booking.currency}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {(parseFloat(booking.totalPrice) / nights).toFixed(2)} {booking.currency} × {nights} {nights === 1 ? t.night : t.nights}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.notes && (
              <div className="border-2 border-purple-200 rounded-xl p-5 bg-gradient-to-br from-purple-50 to-white">
                <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <FileText size={20} className="text-purple-600" />
                  <h3 className="font-bold text-gray-900">{t.specialRequests}</h3>
                </div>
                <p className="text-gray-700 italic">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/')}
            className={`bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 px-6 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Home size={20} />
            {t.backHome}
          </button>

          {isGuest ? (
            <button
              onClick={() => navigate('/guest-booking-lookup')}
              className={`bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ExternalLink size={20} />
              {t.trackBooking}
            </button>
          ) : (
            <button
              onClick={() => navigate('/my-bookings')}
              className={`bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileText size={20} />
              {t.viewBookings}
            </button>
          )}

          <button
            onClick={() => window.print()}
            className={`bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 sm:col-span-2 lg:col-span-1 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <FileText size={20} />
            {language === 'fr' ? 'Imprimer' : language === 'ar' ? 'طباعة' : 'Print'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
