import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Hotel, MapPin, DollarSign, Clock, 
  Phone, Mail, Users, CheckCircle, XCircle, 
  AlertCircle, Loader2, Eye, Download
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';

const MyBookings = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      let allBookings = [];

      // Load logged-in user bookings from API
      if (token) {
        try {
          const response = await fetch(API_ENDPOINTS.BOOKINGS, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.status === 'success') {
            allBookings = data.data.bookings || [];
          }
        } catch (error) {
          console.error('Error loading user bookings:', error);
        }
      }

      // Load guest bookings from localStorage
      const guestBookings = JSON.parse(localStorage.getItem('guestBookings') || '[]');
      
      // Combine bookings (avoid duplicates by checking _id)
      const userBookingIds = allBookings.map(b => b._id);
      const uniqueGuestBookings = guestBookings.filter(
        gb => !userBookingIds.includes(gb._id)
      );
      
      allBookings = [...allBookings, ...uniqueGuestBookings];
      
      // Sort by creation date (newest first)
      allBookings.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
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
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        <Icon size={16} />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      pending: { bg: 'bg-orange-100', text: 'text-orange-700', label: language === 'fr' ? 'En attente' : 'Pending' },
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: language === 'fr' ? 'Payé' : 'Paid' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: language === 'fr' ? 'Échoué' : 'Failed' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: language === 'fr' ? 'Remboursé' : 'Refunded' }
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'fr' ? 'Chargement de vos réservations...' : 'Loading your bookings...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'fr' ? 'Mes Réservations' : 'My Bookings'}
          </h1>
          <p className="text-gray-600">
            {bookings.length} {language === 'fr' ? 'réservation(s)' : 'booking(s)'}
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {language === 'fr' ? 'Aucune réservation' : 'No bookings'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'fr' ? 'Vous n\'avez pas encore effectué de réservation.' : 'You haven\'t made any bookings yet.'}
            </p>
            <button
              onClick={() => navigate('/hotels')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
            >
              {language === 'fr' ? 'Rechercher des hôtels' : 'Search Hotels'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {language === 'fr' ? 'Réservation' : 'Booking'} #{booking._id?.slice(-8)}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {language === 'fr' ? 'Créée le' : 'Created on'} {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                      {language === 'fr' ? 'Détails' : 'Details'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Hotel Info */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Hotel size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {language === 'fr' ? 'Hôtel' : 'Hotel'}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {booking.hotelBooking?.Hotel || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {language === 'fr' ? 'Séjour' : 'Stay'}
                        </p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatDate(booking.hotelBooking?.CheckIn)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {calculateNights(booking.hotelBooking?.CheckIn, booking.hotelBooking?.CheckOut)} {language === 'fr' ? 'nuit(s)' : 'night(s)'}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <DollarSign size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {language === 'fr' ? 'Montant' : 'Amount'}
                        </p>
                        <p className="font-bold text-gray-900">
                          {booking.totalPrice} {booking.currency || 'TND'}
                        </p>
                        <div className="mt-1">
                          {getPaymentStatusBadge(booking.paymentStatus)}
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertCircle size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {language === 'fr' ? 'Paiement' : 'Payment'}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {booking.paymentMethod === 'online' 
                            ? (language === 'fr' ? 'En ligne' : 'Online')
                            : (language === 'fr' ? 'À l\'agence' : 'At agency')
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        {booking.contactEmail}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        {booking.contactPhone}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="text-xl font-bold text-gray-800">
                  {language === 'fr' ? 'Détails de la réservation' : 'Booking Details'}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Booking ID & Status */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    {language === 'fr' ? 'Numéro de réservation' : 'Booking ID'}
                  </p>
                  <p className="text-lg font-mono font-bold text-gray-900 mb-3">
                    {selectedBooking._id}
                  </p>
                  <div className="flex gap-3">
                    {getStatusBadge(selectedBooking.status)}
                    {getPaymentStatusBadge(selectedBooking.paymentStatus)}
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {language === 'fr' ? 'Informations de l\'hôtel' : 'Hotel Information'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">{language === 'fr' ? 'Hôtel:' : 'Hotel:'}</span> <span className="font-semibold">{selectedBooking.hotelBooking?.Hotel}</span></p>
                    <p><span className="text-gray-600">{language === 'fr' ? 'Check-in:' : 'Check-in:'}</span> <span className="font-semibold">{formatDate(selectedBooking.hotelBooking?.CheckIn)}</span></p>
                    <p><span className="text-gray-600">{language === 'fr' ? 'Check-out:' : 'Check-out:'}</span> <span className="font-semibold">{formatDate(selectedBooking.hotelBooking?.CheckOut)}</span></p>
                    <p><span className="text-gray-600">{language === 'fr' ? 'Durée:' : 'Duration:'}</span> <span className="font-semibold">{calculateNights(selectedBooking.hotelBooking?.CheckIn, selectedBooking.hotelBooking?.CheckOut)} {language === 'fr' ? 'nuit(s)' : 'night(s)'}</span></p>
                  </div>
                </div>

                {/* Room Details */}
                {selectedBooking.hotelBooking?.Rooms?.map((room, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {language === 'fr' ? 'Chambre' : 'Room'} {idx + 1}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">{language === 'fr' ? 'Type:' : 'Type:'}</span> <span className="font-semibold">{room.Id}</span></p>
                      <p><span className="text-gray-600">{language === 'fr' ? 'Pension:' : 'Board:'}</span> <span className="font-semibold">{room.Boarding}</span></p>
                      <div>
                        <p className="text-gray-600 mb-1">{language === 'fr' ? 'Adultes:' : 'Adults:'}</p>
                        {room.Pax?.Adult?.map((adult, adultIdx) => (
                          <p key={adultIdx} className="ml-3 text-sm">
                            • {adult.Name} {adult.Surname} {adult.Holder && '(Holder)'}
                          </p>
                        ))}
                      </div>
                      {room.Pax?.Child && room.Pax.Child.length > 0 && (
                        <div>
                          <p className="text-gray-600 mb-1">{language === 'fr' ? 'Enfants:' : 'Children:'}</p>
                          {room.Pax.Child.map((child, childIdx) => (
                            <p key={childIdx} className="ml-3 text-sm">
                              • {child.Name} {child.Surname} ({child.Age} {language === 'fr' ? 'ans' : 'years'})
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Contact & Payment */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {language === 'fr' ? 'Contact & Paiement' : 'Contact & Payment'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <span>{selectedBooking.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <span>{selectedBooking.contactPhone}</span>
                    </div>
                    <div className="pt-3 border-t border-purple-200">
                      <p className="text-gray-600 mb-1">{language === 'fr' ? 'Mode de paiement:' : 'Payment method:'}</p>
                      <p className="font-semibold">
                        {selectedBooking.paymentMethod === 'online' 
                          ? (language === 'fr' ? 'Paiement en ligne' : 'Online payment')
                          : (language === 'fr' ? 'Paiement à l\'agence' : 'Payment at agency')
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Price */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">
                    {language === 'fr' ? 'Prix total' : 'Total Price'}
                  </p>
                  <p className="text-3xl font-bold">
                    {selectedBooking.totalPrice} {selectedBooking.currency || 'TND'}
                  </p>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === 'fr' ? 'Notes' : 'Notes'}
                    </h4>
                    <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
