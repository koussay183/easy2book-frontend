import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, CreditCard, Building2, Check, Calendar, Users, Home, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';

const BookingPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { hotel, room, boarding, checkIn, checkOut, adults, children, rooms } = location.state || {};

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

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Fetch user info and populate email/phone
      fetchUserInfo();
    }
  }, []);

  useEffect(() => {
    // Set first adult as holder by default
    if (guestInfo.adults.length > 0 && !guestInfo.adults.some(a => a.holder)) {
      const updatedAdults = [...guestInfo.adults];
      updatedAdults[0] = { ...updatedAdults[0], holder: true };
      setGuestInfo({ ...guestInfo, adults: updatedAdults });
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
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

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
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
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone,
        notes: notes
      };

      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add Authorization header only if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Navigate to confirmation page
        navigate('/booking-confirmation', { 
          state: { 
            booking: result.data.booking,
            paymentMethod 
          } 
        });
      } else {
        alert(language === 'fr' ? `Erreur: ${result.message}` : `Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(language === 'fr' ? 'Erreur lors de la création de la réservation' : 'Error creating booking');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">{language === 'fr' ? 'Aucune réservation sélectionnée' : 'No booking selected'}</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            {language === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
          </button>
        </div>
      </div>
    );
  }

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">{language === 'fr' ? 'Retour' : 'Back'}</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === 'fr' ? 'Finaliser la réservation' : 'Complete booking'}
        </h1>
        <p className="text-gray-600 mb-2">
          {language === 'fr' ? 'Remplissez les informations ci-dessous' : 'Fill in the information below'}
        </p>
        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm text-blue-900">
                {language === 'fr' 
                  ? 'Vous pouvez réserver en tant qu\'invité ou ' 
                  : 'You can book as a guest or '}
                <button
                  onClick={handleLogin}
                  className="text-primary-600 hover:text-primary-700 font-semibold underline"
                >
                  {language === 'fr' ? 'vous connecter' : 'login'}
                </button>
                {language === 'fr' ? ' pour suivre vos réservations.' : ' to track your bookings.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              {/* Guest Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users size={24} className="text-primary-600" />
                  {language === 'fr' ? 'Informations des voyageurs' : 'Guest information'}
                </h2>

                {/* Adults */}
                <div className="space-y-4">
                  {guestInfo.adults.map((adult, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          {language === 'fr' ? `Adulte ${index + 1}` : `Adult ${index + 1}`}
                        </h3>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={adult.holder}
                            onChange={(e) => handleAdultChange(index, 'holder', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-700">{language === 'fr' ? 'Titulaire' : 'Holder'}</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                          value={adult.civility}
                          onChange={(e) => handleAdultChange(index, 'civility', e.target.value)}
                          required
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="Mr">Mr</option>
                          <option value="Ms">Ms</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Mde">Mde</option>
                        </select>
                        <input
                          type="text"
                          placeholder={language === 'fr' ? 'Prénom' : 'Name'}
                          value={adult.name}
                          onChange={(e) => handleAdultChange(index, 'name', e.target.value)}
                          required
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder={language === 'fr' ? 'Nom' : 'Surname'}
                          value={adult.surname}
                          onChange={(e) => handleAdultChange(index, 'surname', e.target.value)}
                          required
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Children */}
                {guestInfo.children.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {guestInfo.children.map((child, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          {language === 'fr' ? `Enfant ${index + 1}` : `Child ${index + 1}`}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder={language === 'fr' ? 'Prénom' : 'Name'}
                            value={child.name}
                            onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            placeholder={language === 'fr' ? 'Nom' : 'Surname'}
                            value={child.surname}
                            onChange={(e) => handleChildChange(index, 'surname', e.target.value)}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <input
                            type="number"
                            placeholder={language === 'fr' ? 'Âge' : 'Age'}
                            value={child.age}
                            onChange={(e) => handleChildChange(index, 'age', parseInt(e.target.value))}
                            min="0"
                            max="11"
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail size={24} className="text-primary-600" />
                  {language === 'fr' ? 'Informations de contact' : 'Contact information'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder={language === 'fr' ? 'Email' : 'Email'}
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder={language === 'fr' ? 'Téléphone' : 'Phone'}
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={24} className="text-primary-600" />
                  {language === 'fr' ? 'Mode de paiement' : 'Payment method'}
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <CreditCard size={20} className="text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{language === 'fr' ? 'Paiement en ligne' : 'Online payment'}</p>
                      <p className="text-sm text-gray-500">{language === 'fr' ? 'Payer maintenant' : 'Pay now'}</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="agency"
                      checked={paymentMethod === 'agency'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <Building2 size={20} className="text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{language === 'fr' ? 'Paiement à l\'agence' : 'Pay at agency'}</p>
                      <p className="text-sm text-gray-500">{language === 'fr' ? 'Payer plus tard' : 'Pay later'}</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {language === 'fr' ? 'Notes (optionnel)' : 'Notes (optional)'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder={language === 'fr' ? 'Demandes spéciales...' : 'Special requests...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    {language === 'fr' ? 'Traitement...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Check size={24} />
                    {language === 'fr' ? 'Confirmer la réservation' : 'Confirm booking'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'fr' ? 'Résumé' : 'Summary'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">{language === 'fr' ? 'Hôtel' : 'Hotel'}</p>
                  <p className="font-semibold text-gray-900">{hotel.Name}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar size={16} />
                    <span>{checkIn} → {checkOut}</span>
                  </div>
                  <p className="text-sm text-gray-500">{nights} {language === 'fr' ? 'nuit(s)' : 'night(s)'}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-1">{language === 'fr' ? 'Chambre' : 'Room'}</p>
                  <p className="font-semibold text-gray-900 text-sm">{room.Name}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500 mb-1">{language === 'fr' ? 'Pension' : 'Boarding'}</p>
                  <p className="font-semibold text-gray-900 text-sm">{boarding.Name}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{adults} {language === 'fr' ? 'adulte(s)' : 'adult(s)'}</span>
                    {children > 0 && <span>, {children} {language === 'fr' ? 'enfant(s)' : 'child(ren)'}</span>}
                  </div>
                </div>

                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{language === 'fr' ? 'Total' : 'Total'}</span>
                    <span className="text-2xl font-bold text-primary-600">{room.Price} TND</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
