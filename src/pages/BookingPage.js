import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, CreditCard, Building2, Calendar,
  Users, Home, Loader2, MapPin, Star, Utensils, Info, Shield, Clock, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAgency } from '../context/AgencyContext';
import { API_ENDPOINTS } from '../config/api';

const BookingPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { isAgencyUser } = useAgency();
  const navigate = useNavigate();
  const location = useLocation();
  const { hotel, room, boarding, checkIn, checkOut, adults, children, nights } = location.state || {};

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Guest information state - pre-filled with correct counts
  const [guestInfo, setGuestInfo] = useState({
    adults: Array(adults || 2).fill(0).map(() => ({ civility: 'Mr', name: '', surname: '', holder: false })),
    children: Array(children || 0).fill(0).map(() => ({ name: '', surname: '', age: 0 }))
  });

  // Contact information
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: ''
  });

  // Guest booking information (for non-logged-in users)
  const [guestBookingInfo, setGuestBookingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: ''
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUserInfo();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    // Set first adult as holder by default
    if (guestInfo.adults.length > 0 && !guestInfo.adults.some(a => a.holder)) {
      const updatedAdults = [...guestInfo.adults];
      updatedAdults[0] = { ...updatedAdults[0], holder: true };
      setGuestInfo({ ...guestInfo, adults: updatedAdults });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(API_ENDPOINTS.AUTH_ME, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContactInfo({
          email: data.data.user.email || '',
          phone: data.data.user.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleAdultChange = (index, field, value) => {
    const updatedAdults = [...guestInfo.adults];
    if (field === 'holder') {
      // Only one holder allowed
      updatedAdults.forEach((adult, i) => {
        updatedAdults[i] = { ...adult, holder: i === index };
      });
    } else {
      updatedAdults[index] = { ...updatedAdults[index], [field]: value };
    }
    setGuestInfo({ ...guestInfo, adults: updatedAdults });
  };

  const handleChildChange = (index, field, value) => {
    const updatedChildren = [...guestInfo.children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setGuestInfo({ ...guestInfo, children: updatedChildren });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    // Validate guest information if not logged in
    if (!isLoggedIn) {
      if (!guestBookingInfo.name || !guestBookingInfo.email || !guestBookingInfo.phone) {
        alert(language === 'fr' 
          ? 'Veuillez remplir votre nom, email et téléphone.' 
          : language === 'ar'
          ? 'يرجى ملء اسمك والبريد الإلكتروني والهاتف.'
          : 'Please fill in your name, email and phone.');
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // Build booking payload
      const bookingData = {
        hotelBooking: {
          PreBooking: true,
          City: hotel.City?.Id?.toString() || hotel.CityId?.toString(),
          Hotel: parseInt(hotel.Id),
          CheckIn: checkIn,
          CheckOut: checkOut,
          Option: [],
          Source: hotel.SearchData?.Source || 'local-2',
          Rooms: [
            {
              Id: room.Id,
              Boarding: boarding.Id.toString(),
              View: [],
              Supplement: [],
              Pax: {
                Adult: guestInfo.adults.map(adult => ({
                  Civility: adult.civility,
                  Name: adult.name,
                  Surname: adult.surname,
                  Holder: adult.holder
                })),
                ...(guestInfo.children.length > 0 && {
                  Child: guestInfo.children.map(child => ({
                    Name: child.name,
                    Surname: child.surname,
                    Age: child.age.toString()
                  }))
                })
              }
            }
          ]
        },
        paymentMethod: paymentMethod,
        totalPrice: parseFloat(room.Price),
        notes: notes
      };

      // Add guest information if not logged in
      if (!isLoggedIn) {
        bookingData.guestInfo = {
          name: guestBookingInfo.name,
          email: guestBookingInfo.email,
          phone: guestBookingInfo.phone,
          ...(guestBookingInfo.country && { country: guestBookingInfo.country }),
          ...(guestBookingInfo.address && { address: guestBookingInfo.address })
        };
      } else {
        // For logged-in users, add contact override if provided
        if (contactInfo.email) {
          bookingData.contactEmail = contactInfo.email;
        }
        if (contactInfo.phone) {
          bookingData.contactPhone = contactInfo.phone;
        }
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add Authorization header only if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // For ONLINE payment: Don't create booking yet, initiate payment first
      // (Agency users always pay via credit — skip online payment gateway)
      if (paymentMethod === 'online' && !isAgencyUser) {
        // Import payment service at the top of the file
        const { initiatePayment } = await import('../services/paymentService');

        try {
          const { payUrl, paymentRef } = await initiatePayment(bookingData);

          // Store payment reference for validation
          localStorage.setItem('pendingPaymentRef', paymentRef);

          // Redirect to payment gateway
          window.location.href = payUrl;
          return;
        } catch (paymentError) {
          console.error('Payment initiation error:', paymentError);
          alert(language === 'fr'
            ? `Erreur de paiement: ${paymentError.message}`
            : language === 'ar'
            ? `خطأ في الدفع: ${paymentError.message}`
            : `Payment error: ${paymentError.message}`);
          setLoading(false);
          return;
        }
      }

      // For agency users: always use credit (overwrite payment method)
      if (isAgencyUser) {
        bookingData.paymentMethod = 'agency';
      }

      // Create booking (B2C endpoint or B2B agency endpoint)
      const bookingEndpoint = isAgencyUser ? API_ENDPOINTS.AGENCY_BOOKINGS : API_ENDPOINTS.BOOKINGS;
      const response = await fetch(bookingEndpoint, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Save booking ID for guest users
        if (!isLoggedIn && result.data?.booking?._id) {
          localStorage.setItem('guestBookingId', result.data.booking._id);
          localStorage.setItem('guestBookingEmail', guestBookingInfo.email);
        }
        
        // Navigate to confirmation page
        navigate('/booking-confirmation', { 
          state: { 
            booking: result.data.booking,
            paymentMethod,
            isGuest: !isLoggedIn
          } 
        });
      } else {
        alert(language === 'fr' ? `Erreur: ${result.message}` : language === 'ar' ? `خطأ: ${result.message}` : `Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(language === 'fr' ? 'Erreur lors de la création de la réservation' : language === 'ar' ? 'خطأ في إنشاء الحجز' : 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Save booking data to resume after login
    sessionStorage.setItem('pendingBooking', JSON.stringify(location.state));
    navigate('/login');
  };

  if (!hotel || !room || !boarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="text-red-600" size={32} />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">
            {language === 'fr' ? 'Aucune réservation sélectionnée' : language === 'ar' ? 'لم يتم اختيار حجز' : 'No booking selected'}
          </p>
          <p className="text-gray-600 mb-6">
            {language === 'fr' ? 'Veuillez sélectionner un hôtel et une chambre d\'abord' : language === 'ar' ? 'يرجى اختيار فندق وغرفة أولاً' : 'Please select a hotel and room first'}
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

  const calculatedNights = nights || Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  
  // Get translations
  const t = {
    title: language === 'fr' ? 'Finaliser votre réservation' : language === 'ar' ? 'إنهاء حجزك' : 'Complete Your Booking',
    subtitle: language === 'fr' ? 'Quelques étapes simples pour confirmer votre séjour' : language === 'ar' ? 'خطوات بسيطة لتأكيد إقامتك' : 'A few simple steps to confirm your stay',
    back: language === 'fr' ? 'Retour' : language === 'ar' ? 'رجوع' : 'Back',
    step: language === 'fr' ? 'Étape' : language === 'ar' ? 'خطوة' : 'Step',
    travelers: language === 'fr' ? 'Informations des voyageurs' : language === 'ar' ? 'معلومات المسافرين' : 'Traveler Information',
    yourInfo: language === 'fr' ? 'Vos informations' : language === 'ar' ? 'معلوماتك' : 'Your Information',
    paymentMethod: language === 'fr' ? 'Mode de paiement' : language === 'ar' ? 'طريقة الدفع' : 'Payment Method',
    bookingSummary: language === 'fr' ? 'Récapitulatif' : language === 'ar' ? 'الملخص' : 'Summary',
    hotel: language === 'fr' ? 'Hôtel' : language === 'ar' ? 'الفندق' : 'Hotel',
    room: language === 'fr' ? 'Chambre' : language === 'ar' ? 'الغرفة' : 'Room',
    boarding: language === 'fr' ? 'Pension' : language === 'ar' ? 'نظام الإقامة' : 'Board Type',
    checkIn: language === 'fr' ? 'Arrivée' : language === 'ar' ? 'الوصول' : 'Check-in',
    checkOut: language === 'fr' ? 'Départ' : language === 'ar' ? 'المغادرة' : 'Check-out',
    nights: language === 'fr' ? 'nuits' : language === 'ar' ? 'ليالي' : 'nights',
    night: language === 'fr' ? 'nuit' : language === 'ar' ? 'ليلة' : 'night',
    guests: language === 'fr' ? 'Voyageurs' : language === 'ar' ? 'المسافرين' : 'Guests',
    adults: language === 'fr' ? 'adultes' : language === 'ar' ? 'كبار' : 'adults',
    adult: language === 'fr' ? 'adulte' : language === 'ar' ? 'كبير' : 'adult',
    children: language === 'fr' ? 'enfants' : language === 'ar' ? 'أطفال' : 'children',
    child: language === 'fr' ? 'enfant' : language === 'ar' ? 'طفل' : 'child',
    total: language === 'fr' ? 'Prix total' : language === 'ar' ? 'السعر الإجمالي' : 'Total Price',
    continue: language === 'fr' ? 'Continuer' : language === 'ar' ? 'متابعة' : 'Continue',
    confirmBooking: language === 'fr' ? 'Confirmer la réservation' : language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking',
    processing: language === 'fr' ? 'Traitement en cours...' : language === 'ar' ? 'جاري المعالجة...' : 'Processing...',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50" dir={isRTL ?'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors group ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                <ArrowLeft size={16} className={`text-gray-600 group-hover:text-primary-600 ${isRTL ? 'rotate-180' : ''}`} />
              </div>
              <span className="font-semibold text-sm">{t.back}</span>
            </button>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {t.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Guest Login Banner */}
        {!isLoggedIn && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Info size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  {language === 'fr' 
                    ? 'Vous réservez en tant qu\'invité. ' 
                    : language === 'ar'
                    ? 'تقوم بالحجز كضيف. '
                    : 'You are booking as a guest. '}
                  <button
                    onClick={handleLogin}
                    className="text-primary-600 hover:text-primary-700 font-bold underline"
                  >
                    {language === 'fr' ? 'Se connecter' : language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </button>
                  {language === 'fr' ? ' pour gérer facilement vos réservations.' : language === 'ar' ? ' لإدارة حجوزاتك بسهولة.' : ' to easily manage your bookings.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Summary - Fixed on large screens */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden lg:sticky lg:top-24">
              {/* Hotel Image */}
              {hotel.Image && (
                <div className="h-48 sm:h-56 overflow-hidden relative">
                  <img 
                    src={hotel.Image} 
                    alt={hotel.Name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    {hotel.Category && (
                      <div className={`flex items-center gap-1 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {Array.from({ length: hotel.Category.Star || 0 }).map((_, i) => (
                          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  {t.bookingSummary}
                </h2>
                
                <div className="space-y-5">
                  {/* Hotel */}
                  <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Home size={16} className="text-primary-600" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.hotel}</p>
                    </div>
                    <p className="font-bold text-gray-900">{hotel.Name}</p>
                    {hotel.City && (
                      <div className={`flex items-center gap-1 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <MapPin size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-600">{hotel.City.Name}, {hotel.City.Country?.Name}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Dates */}
                  <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar size={16} className="text-primary-600" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{language === 'fr' ? 'Dates' : language === 'ar' ? 'التواريخ' : 'Dates'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-gray-600">{t.checkIn}</span>
                        <span className="font-semibold text-gray-900" dir="ltr">{checkIn}</span>
                      </div>
                      <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-gray-600">{t.checkOut}</span>
                        <span className="font-semibold text-gray-900" dir="ltr">{checkOut}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-primary-600 font-semibold pt-1">
                        <Clock size={12} />
                        <span>{calculatedNights} {calculatedNights === 1 ? t.night : t.nights}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Room */}
                  <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Home size={16} className="text-primary-600" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.room}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{room.Name}</p>
                  </div>

                  {/* Boarding */}
                  <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Utensils size={16} className="text-primary-600" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.boarding}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg border border-primary-200">
                      <span className="font-bold text-sm">{boarding.Code}</span>
                      {boarding.Name && <span className="text-xs">• {boarding.Name}</span>}
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Users size={16} className="text-primary-600" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.guests}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-900">
                        {adults} {adults === 1 ? t.adult : t.adults}
                      </span>
                      {children > 0 && (
                        <>
                          <span className="text-gray-400">+</span>
                          <span className="text-gray-900">
                            {children} {children === 1 ? t.child : t.children}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-300"></div>

                  {/* Total */}
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 -mx-6 -mb-6 p-6 mt-6">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-lg font-bold text-gray-900">{t.total}</span>
                      <div className="text-right" dir="ltr">
                        <div className="text-3xl font-bold text-primary-600">
                          {parseFloat(room.Price).toFixed(2)} <span className="text-lg">TND</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {(parseFloat(room.Price) / calculatedNights).toFixed(2)} TND × {calculatedNights} {calculatedNights === 1 ? t.night : t.nights}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <Shield size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-900">
                  {language === 'fr' ? 'Réservation sécurisée' : language === 'ar' ? 'حجز آمن' : 'Secure Booking'}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {language === 'fr' ? 'Vos informations sont protégées' : language === 'ar' ? 'معلوماتك محمية' : 'Your information is protected'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              {/* Step 1: Traveler Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Users size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-white">{t.travelers}</h2>
                      <p className="text-xs text-primary-100 mt-0.5">
                        {language === 'fr' ? 'Informations de tous les voyageurs' : language === 'ar' ? 'معلومات جميع المسافرين' : 'Information for all travelers'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Adults */}
                  {guestInfo.adults.map((adult, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors bg-gradient-to-br from-gray-50 to-white">
                      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          {language === 'fr' ? `Adulte ${index + 1}` : language === 'ar' ? `البالغ ${index + 1}` : `Adult ${index + 1}`}
                        </h3>
                        <label className={`flex items-center gap-2 text-sm cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <input
                            type="checkbox"
                            checked={adult.holder}
                            onChange={(e) => handleAdultChange(index, 'holder', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-700 font-medium">
                            {language === 'fr' ? 'Titulaire' : language === 'ar' ? 'صاحب الحجز' : 'Holder'}
                          </span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {language === 'fr' ? 'Civilité' : language === 'ar' ? 'اللقب' : 'Title'}
                          </label>
                          <select
                            value={adult.civility}
                            onChange={(e) => handleAdultChange(index, 'civility', e.target.value)}
                            required
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          >
                            <option value="Mr">Mr</option>
                            <option value="Ms">Ms</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Mde">Mde</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {language === 'fr' ? 'Prénom' : language === 'ar' ? 'الاسم الأول' : 'First Name'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={language === 'fr' ? 'Prénom' : language === 'ar' ? 'الاسم' : 'First name'}
                            value={adult.name}
                            onChange={(e) => handleAdultChange(index, 'name', e.target.value)}
                            required
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            dir={isRTL ? 'rtl' : 'ltr'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {language === 'fr' ? 'Nom' : language === 'ar' ? 'اسم العائلة' : 'Last Name'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={language === 'fr' ? 'Nom' : language === 'ar' ? 'اللقب' : 'Last name'}
                            value={adult.surname}
                            onChange={(e) => handleAdultChange(index, 'surname', e.target.value)}
                            required
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            dir={isRTL ? 'rtl' : 'ltr'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Children */}
                  {guestInfo.children.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {guestInfo.children.map((child, index) => (
                        <div key={index} className="border-2 border-blue-200 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-white">
                          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            {language === 'fr' ? `Enfant ${index + 1}` : language === 'ar' ? `الطفل ${index + 1}` : `Child ${index + 1}`}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {language === 'fr' ? 'Prénom' : language === 'ar' ? 'الاسم الأول' : 'First Name'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder={language === 'fr' ? 'Prénom' : language === 'ar' ? 'الاسم' : 'First name'}
                                value={child.name}
                                onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                                required
                                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                dir={isRTL ? 'rtl' : 'ltr'}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {language === 'fr' ? 'Nom' : language === 'ar' ? 'اسم العائلة' : 'Last Name'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder={language === 'fr' ? 'Nom' : language === 'ar' ? 'اللقب' : 'Last name'}
                                value={child.surname}
                                onChange={(e) => handleChildChange(index, 'surname', e.target.value)}
                                required
                                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                dir={isRTL ? 'rtl' : 'ltr'}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {language === 'fr' ? 'Âge' : language === 'ar' ? 'العمر' : 'Age'} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                placeholder={language === 'fr' ? 'Âge' : language === 'ar' ? 'العمر' : 'Age'}
                                value={child.age || ''}
                                onChange={(e) => handleChildChange(index, 'age', parseInt(e.target.value) || 0)}
                                min="0"
                                max="17"
                                required
                                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                dir="ltr"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Contact/Guest Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 px-6 py-4">
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Mail size={20} className="text-secondary-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-white">{t.yourInfo}</h2>
                      <p className="text-xs text-secondary-100 mt-0.5">
                        {language === 'fr' ? 'Pour la confirmation de réservation' : language === 'ar' ? 'لتأكيد الحجز' : 'For booking confirmation'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {!isLoggedIn ? (
                    // Guest Information Form
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {language === 'fr' ? 'Nom complet' : language === 'ar' ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={18} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                          <input
                            type="text"
                            placeholder={language === 'fr' ? 'Votre nom complet' : language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                            value={guestBookingInfo.name}
                            onChange={(e) => setGuestBookingInfo({ ...guestBookingInfo, name: e.target.value })}
                            required
                            className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {language === 'fr' ? 'Email' : language === 'ar' ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail size={18} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                            <input
                              type="email"
                              placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
                              value={guestBookingInfo.email}
                              onChange={(e) => setGuestBookingInfo({ ...guestBookingInfo, email: e.target.value })}
                              required
                              className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                              dir="ltr"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {language === 'fr' ? 'Téléphone' : language === 'ar' ? 'الهاتف' : 'Phone'} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone size={18} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                            <input
                              type="tel"
                              placeholder="+216 XX XXX XXX"
                              value={guestBookingInfo.phone}
                              onChange={(e) => setGuestBookingInfo({ ...guestBookingInfo, phone: e.target.value })}
                              required
                              className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'fr' ? 'Pays' : language === 'ar' ? 'البلد' : 'Country'} <span className="text-xs text-gray-400">({language === 'fr' ? 'optionnel' : language === 'ar' ? 'اختياري' : 'optional'})</span>
                          </label>
                          <input
                            type="text"
                            placeholder={language === 'fr' ? 'Tunisie' : language === 'ar' ? 'تونس' : 'Tunisia'}
                            value={guestBookingInfo.country}
                            onChange={(e) => setGuestBookingInfo({ ...guestBookingInfo, country: e.target.value })}
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            dir={isRTL ? 'rtl' : 'ltr'}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'fr' ? 'Adresse' : language === 'ar' ? 'العنوان' : 'Address'} <span className="text-xs text-gray-400">({language === 'fr' ? 'optionnel' : language === 'ar' ? 'اختياري' : 'optional'})</span>
                          </label>
                          <input
                            type="text"
                            placeholder={language === 'fr' ? 'Votre adresse' : language === 'ar' ? 'عنوانك' : 'Your address'}
                            value={guestBookingInfo.address}
                            onChange={(e) => setGuestBookingInfo({ ...guestBookingInfo, address: e.target.value })}
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            dir={isRTL ? 'rtl' : 'ltr'}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3 mt-4">
                        <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0" />
                        <p className="text-sm text-blue-900">
                          {language === 'fr' 
                            ? 'Vous recevrez un email de confirmation avec votre numéro de réservation.'
                            : language === 'ar'
                            ? 'ستتلقى بريدًا إلكترونيًا للتأكيد مع رقم حجزك.'
                            : 'You will receive a confirmation email with your booking number.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Logged-in User Contact Override
                    <div className="space-y-4">
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3 mb-6">
                        <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-green-900">
                            {language === 'fr' 
                              ? 'Vous êtes connecté' 
                              : language === 'ar'
                              ? 'أنت متصل'
                              : 'You are logged in'}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            {language === 'fr' 
                              ? 'Vos informations seront utilisées automatiquement.'
                              : language === 'ar'
                              ? 'سيتم استخدام معلوماتك تلقائيًا.'
                              : 'Your information will be used automatically.'}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        {language === 'fr' ? 'Modifier les informations de contact (optionnel)' : language === 'ar' ? 'تعديل معلومات الاتصال (اختياري)' : 'Update contact information (optional)'}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'fr' ? 'Email de contact' : language === 'ar' ? 'بريد التواصل' : 'Contact Email'}
                          </label>
                          <div className="relative">
                            <Mail size={18} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                            <input
                              type="email"
                              placeholder={language === 'fr' ? 'Email' : language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                              value={contactInfo.email}
                              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                              className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                              dir="ltr"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'fr' ? 'Téléphone' : language === 'ar' ? 'الهاتف' : 'Phone'}
                          </label>
                          <div className="relative">
                            <Phone size={18} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                            <input
                              type="tel"
                              placeholder={language === 'fr' ? 'Téléphone' : language === 'ar' ? 'الهاتف' : 'Phone'}
                              value={contactInfo.phone}
                              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                              className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <CreditCard size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-white">{t.paymentMethod}</h2>
                      <p className="text-xs text-green-100 mt-0.5">
                        {language === 'fr' ? 'Choisissez votre mode de paiement' : language === 'ar' ? 'اختر طريقة الدفع' : 'Choose your payment method'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <label className={`flex items-center gap-4 p-4 border-3 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'online' 
                      ? 'border-primary-600 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  } ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                    />
                    <div className={`flex items-center gap-3 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        paymentMethod === 'online' ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        <CreditCard size={24} className={paymentMethod === 'online' ? 'text-primary-600' : 'text-gray-600'} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">
                          {language === 'fr' ? 'Paiement en ligne' : language === 'ar' ? 'الدفع عبر الإنترنت' : 'Online Payment'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'fr' ? 'Payer maintenant par carte bancaire' : language === 'ar' ? 'ادفع الآن ببطاقة الائتمان' : 'Pay now with credit card'}
                        </p>
                      </div>
                      {paymentMethod === 'online' && (
                        <CheckCircle2 size={24} className="text-primary-600" />
                      )}
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-4 p-4 border-3 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'agency' 
                      ? 'border-primary-600 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  } ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="agency"
                      checked={paymentMethod === 'agency'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                    />
                    <div className={`flex items-center gap-3 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        paymentMethod === 'agency' ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        <Building2 size={24} className={paymentMethod === 'agency' ? 'text-primary-600' : 'text-gray-600'} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">
                          {language === 'fr' ? 'Paiement à l\'agence' : language === 'ar' ? 'الدفع في الوكالة' : 'Pay at Agency'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'fr' ? 'Payer plus tard à l\'agence' : language === 'ar' ? 'ادفع لاحقًا في الوكالة' : 'Pay later at the agency'}
                        </p>
                      </div>
                      {paymentMethod === 'agency' && (
                        <CheckCircle2 size={24} className="text-primary-600" />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {language === 'fr' ? 'Demandes spéciales' : language === 'ar' ? 'طلبات خاصة' : 'Special Requests'} 
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    ({language === 'fr' ? 'optionnel' : language === 'ar' ? 'اختياري' : 'optional'})
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  placeholder={language === 'fr' 
                    ? 'Ex: Chambre en étage élevé, vue sur mer, arrivée tardive...' 
                    : language === 'ar'
                    ? 'مثال: غرفة في طابق عالٍ، إطلالة على البحر، وصول متأخر...'
                    : 'E.g., High floor room, sea view, late arrival...'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={24} />
                    {t.confirmBooking}
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className={`flex flex-wrap items-center justify-center gap-6 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Shield size={16} className="text-green-600" />
                  <span>{language === 'fr' ? 'Paiement sécurisé' : language === 'ar' ? 'دفع آمن' : 'Secure payment'}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span>{language === 'fr' ? 'Confirmation instantanée' : language === 'ar' ? 'تأكيد فوري' : 'Instant confirmation'}</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
