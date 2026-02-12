import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, Filter, Eye, Check, X, 
  Clock, DollarSign, Hotel, Users, Mail, Phone,
  MapPin, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';

const BookingsManager = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, filterStatus, filterPaymentStatus, bookings]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      
      const response = await fetch(`${API_ENDPOINTS.BOOKINGS_ADMIN_ALL}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setBookings(data.data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      alert('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.hotelBooking?.Hotel?.toString().includes(searchTerm.toLowerCase()) ||
        booking.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by booking status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }

    // Filter by payment status
    if (filterPaymentStatus !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === filterPaymentStatus);
    }

    setFilteredBookings(filtered);
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!window.confirm('Confirmer cette réservation et l\'envoyer à myGo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert(`Réservation confirmée!\nID myGo: ${data.data.myGoBookingId || 'N/A'}`);
        loadBookings();
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Erreur lors de la confirmation');
    }
  };

  const handleUpdatePaymentStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: newStatus })
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Statut de paiement mis à jour');
        loadBookings();
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Erreur lors de la mise à jour du paiement');
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    const confirmMessage = newStatus === 'cancelled' 
      ? 'Voulez-vous vraiment annuler cette réservation?'
      : `Voulez-vous changer le statut à "${newStatus}"?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Statut mis à jour avec succès');
        loadBookings();
        setShowDetailsModal(false);
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulée' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Terminée' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (method) => {
    return method === 'online' ? (
      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
        En ligne
      </span>
    ) : (
      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
        Agence
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Réservations</h2>
          <p className="text-gray-600 mt-1">{filteredBookings.length} réservation(s)</p>
        </div>
        <button
          onClick={() => {/* Export to Excel */}}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg"
        >
          <Download size={20} />
          Exporter
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par hôtel, email, ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
              <option value="completed">Terminée</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="relative">
            <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les paiements</option>
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Réservation
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Hôtel
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Aucune réservation trouvée
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <React.Fragment key={booking.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">#{booking._id?.slice(-8) || 'N/A'}</p>
                          <p className="text-xs text-gray-500">
                            {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Hotel size={16} className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-800">Hôtel #{booking.hotelBooking?.Hotel || 'N/A'}</p>
                            <p className="text-xs text-gray-500">Chambre {booking.hotelBooking?.Rooms?.[0]?.Id || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-800">
                            {booking.hotelBooking?.CheckIn ? new Date(booking.hotelBooking.CheckIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'N/A'}
                          </p>
                          <p className="text-gray-500">
                            {booking.hotelBooking?.CheckOut ? new Date(booking.hotelBooking.CheckOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-800">
                            {booking.user?.fullName || booking.user?.email || booking.contactEmail || 'N/A'}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail size={12} />
                            {booking.contactEmail || booking.user?.email || 'N/A'}
                          </div>
                          {(booking.contactPhone || booking.user?.phone) && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone size={12} />
                              {booking.contactPhone || booking.user?.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-800">
                            {booking.hotelBooking?.TotalPrice || booking.totalPrice || 0} TND
                          </p>
                          {getPaymentBadge(booking.paymentMethod)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye size={18} />
                          </button>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirmBooking(booking._id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Confirmer et envoyer à myGo"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Annuler"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            {expandedBooking === booking._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {expandedBooking === booking._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Informations de pension</h4>
                              <p className="text-sm text-gray-600">
                                <strong>Type:</strong> {booking.pensionType || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Adultes:</strong> {booking.hotelBooking?.TotalAdults || 0}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Enfants:</strong> {booking.hotelBooking?.TotalChildren || 0}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Informations de contact</h4>
                              <p className="text-sm text-gray-600">
                                <strong>Email:</strong> {booking.contactEmail || booking.user?.email || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Téléphone:</strong> {booking.contactPhone || booking.user?.phone || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Actions de paiement</h4>
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => handleUpdatePaymentStatus(booking._id, 'paid')}
                                  disabled={booking.paymentStatus === 'paid'}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                  Marquer comme payé
                                </button>
                                <button
                                  onClick={() => handleUpdatePaymentStatus(booking._id, 'failed')}
                                  disabled={booking.paymentStatus === 'failed'}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                  Marquer comme échoué
                                </button>
                                <button
                                  onClick={() => handleUpdatePaymentStatus(booking._id, 'refunded')}
                                  disabled={booking.paymentStatus === 'refunded'}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                  Marquer comme remboursé
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                Détails de la réservation #{selectedBooking.bookingId || selectedBooking.id}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Payment */}
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedBooking.status)}
                {getPaymentBadge(selectedBooking.paymentMethod)}
              </div>

              {/* Hotel Info */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Hotel size={18} />
                  Informations de l'hôtel
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">{selectedBooking.hotel?.name}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.room?.name}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.boarding?.name}</p>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar size={18} />
                  Dates du séjour
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Check-in</p>
                      <p className="font-semibold">
                        {selectedBooking.checkIn ? new Date(selectedBooking.checkIn).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Check-out</p>
                      <p className="font-semibold">
                        {selectedBooking.checkOut ? new Date(selectedBooking.checkOut).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">{selectedBooking.nights || 0} nuit(s)</p>
                </div>
              </div>

              {/* Guest Info */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users size={18} />
                  Informations du client
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">{selectedBooking.guestName}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} />
                    {selectedBooking.guestEmail}
                  </div>
                  {selectedBooking.guestPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      {selectedBooking.guestPhone}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedBooking.adults || 0} Adulte(s), {selectedBooking.children || 0} Enfant(s)
                  </p>
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DollarSign size={18} />
                  Tarification
                </h4>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90 mb-1">Total</p>
                  <p className="text-3xl font-bold">{selectedBooking.totalPrice || 0} TND</p>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedBooking.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, 'confirmed');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, 'cancelled');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManager;
