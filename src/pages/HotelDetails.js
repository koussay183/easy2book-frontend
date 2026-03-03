import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  ArrowLeft, MapPin, Star, Phone, Mail, Wifi, Car, Utensils,
  Waves, Coffee, Wind, Dumbbell, Droplets, Users, Palmtree, Baby,
  Heart, TreePine, PartyPopper, Briefcase, Home, ChevronDown, ChevronUp,
  Calendar, Check, X, Info, DollarSign, Loader2, AlertCircle, Navigation,
  Shield, Award, Image as ImageIcon, ChevronRight, CheckCircle2,
  MessageSquare, ThumbsUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useHotels } from '../context/HotelsContext';
import GuestSelector from '../components/landing/GuestSelector';
import { API_ENDPOINTS } from '../config/api';
import useTripAdvisor from '../hooks/useTripAdvisor';
import tripadvisorLogo from '../assets/images/tripadvasor_logo.png';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { getHotelById, searchParams: cachedSearchParams } = useHotels();
  const isRTL = language === 'ar';

  // Get search context - prioritize URL params, fallback to cached
  const checkIn = searchParams.get('checkIn') || cachedSearchParams.checkIn;
  const checkOut = searchParams.get('checkOut') || cachedSearchParams.checkOut;
  
  // Parse roomsConfig from URL or build from old params
  const getInitialRoomsConfig = () => {
    const roomsConfigParam = searchParams.get('roomsConfig');
    if (roomsConfigParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(roomsConfigParam));
        console.log('Parsed roomsConfig from URL:', parsed);
        return parsed;
      } catch (e) {
        console.error('Error parsing roomsConfig:', e);
      }
    }
    // Fallback to old format
    const adultsParam = searchParams.get('adults');
    const childrenParam = searchParams.get('children');
    const roomsParam = searchParams.get('rooms');
    
    if (adultsParam || childrenParam || roomsParam) {
      const adults = parseInt(adultsParam) || 2;
      const children = parseInt(childrenParam) || 0;
      const rooms = parseInt(roomsParam) || 1;
      const adultsPerRoom = Math.max(Math.floor(adults / rooms), 1);
      console.log('Using old format params:', { adults, children, rooms });
      return [{ adults: adultsPerRoom, children: [] }];
    }
    
    // Default
    console.log('Using default roomsConfig');
    return [{ adults: 2, children: [] }];
  };

  const [hotel, setHotel] = useState(null);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── TripAdvisor (full: also loads reviews + photos) ── */
  // Include city + address for maximum TA search accuracy
  const taQuery = hotel
    ? [hotel.Name, hotel.City?.Name, hotel.Adress || hotel.Address].filter(Boolean).join(' ')
    : null;
  const { taData, reviews: taReviews, photos: taPhotos } = useTripAdvisor(
    taQuery,
    { fetchFull: true }
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedBoarding, setSelectedBoarding] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    facilities: true,
    rooms: true,
    location: false,
    notes: true
  });

  // Booking stepper state
  const [bookingStep, setBookingStep] = useState(1);
  const [guestInfo, setGuestInfo] = useState({
    adults: [],
    children: [],
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Search form state
  const [searchCheckIn, setSearchCheckIn] = useState(checkIn || '');
  const [searchCheckOut, setSearchCheckOut] = useState(checkOut || '');
  const [searchRoomsConfig, setSearchRoomsConfig] = useState(getInitialRoomsConfig());
  const [searchRooms, setSearchRooms] = useState(() => getInitialRoomsConfig().length);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Handle availability search
  const handleSearchAvailability = async () => {
    if (!searchCheckIn || !searchCheckOut) {
      alert('Veuillez sélectionner les dates de check-in et check-out');
      return;
    }

    setSearchLoading(true);
    try {
      // Build rooms array for API from roomsConfig
      const roomsArray = searchRoomsConfig.map(room => ({
        Adult: room.adults,
        Child: room.children || []
      }));

      // POST request to search API
      const response = await fetch(API_ENDPOINTS.MYGO_HOTELS_SEARCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          SearchDetails: {
            BookingDetails: {
              CheckIn: searchCheckIn,
              CheckOut: searchCheckOut,
              Hotels: [parseInt(id)] // Search only this hotel
            },
            Filters: {
              OnlyAvailable: true
            },
            Rooms: roomsArray
          }
        })
      });

      const result = await response.json();
      
      if (result.status === 'success' && result.data?.HotelSearch) {
        // Find the updated hotel in the results
        const updatedHotelData = result.data.HotelSearch.find(h => h.Hotel?.Id === parseInt(id));
        if (updatedHotelData) {
          // Merge the search results with existing hotel data
          const updatedHotel = {
            ...hotel,
            ...updatedHotelData.Hotel,
            SearchData: {
              Token: updatedHotelData.Token,
              Price: updatedHotelData.Price,
              Source: updatedHotelData.Source,
              Currency: updatedHotelData.Currency
            }
          };
          setHotel(updatedHotel);
          // Update URL params
          const encodedRoomsConfig = encodeURIComponent(JSON.stringify(searchRoomsConfig));
          navigate(`/hotel/${id}?checkIn=${searchCheckIn}&checkOut=${searchCheckOut}&roomsConfig=${encodedRoomsConfig}`, { replace: true });
        } else {
          alert(language === 'fr' ? 'Aucune disponibilité trouvée pour ces dates' : 'No availability found for these dates');
        }
      } else {
        alert(language === 'fr' ? 'Erreur lors de la recherche' : 'Error during search');
      }
    } catch (error) {
      console.error('Error searching availability:', error);
      alert(language === 'fr' ? 'Erreur lors de la recherche de disponibilité' : 'Error searching availability');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const loadHotelData = async () => {
      // Get hotel from context
      const hotelData = getHotelById(id);
      
      if (hotelData) {
        console.log('Hotel loaded from context:', hotelData);
        setHotel(hotelData);
        
        // Fetch full hotel details from API
        try {
          const response = await fetch(API_ENDPOINTS.MYGO_HOTELS_DETAILS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ HotelId: id })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('Hotel details API response:', result);
            
            if (result.status === 'success' && result.data?.HotelDetail) {
              console.log('Hotel details loaded:', result.data.HotelDetail);
              setHotelDetails(result.data.HotelDetail);
            }
          }
        } catch (error) {
          console.error('Error fetching hotel details:', error);
        }
      } else {
        // Fallback: direct URL access — fetch hotel from MyGo using URL params (or defaults)
        const today    = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const toISO    = (d) => d.toISOString().split('T')[0];

        const urlCheckIn  = searchParams.get('checkIn')  || toISO(today);
        const urlCheckOut = searchParams.get('checkOut') || toISO(tomorrow);

        // Always attempt the fetch with real or default dates
        // eslint-disable-next-line no-lone-blocks
        {
          try {
            // Parse roomsConfig from URL (default: 1 room, 2 adults)
            const roomsConfigParam = searchParams.get('roomsConfig');
            let roomsConfig = [{ adults: 2, children: [] }];
            if (roomsConfigParam) {
              try { roomsConfig = JSON.parse(decodeURIComponent(roomsConfigParam)); } catch (_) {}
            }
            const roomsArray = roomsConfig.map(room => ({
              Adult: room.adults,
              Child: room.children || []
            }));

            const response = await fetch(API_ENDPOINTS.MYGO_HOTELS_SEARCH, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                SearchDetails: {
                  BookingDetails: {
                    CheckIn: urlCheckIn,
                    CheckOut: urlCheckOut,
                    Hotels: [parseInt(id)]
                  },
                  Filters: { OnlyAvailable: true },
                  Rooms: roomsArray
                }
              })
            });

            const result = await response.json();

            if (result.status === 'success' && result.data?.HotelSearch?.length > 0) {
              const found = result.data.HotelSearch.find(h => h.Hotel?.Id === parseInt(id))
                            || result.data.HotelSearch[0];
              if (found) {
                const hotelObj = {
                  ...found.Hotel,
                  SearchData: {
                    Token: found.Token,
                    Price: found.Price,
                    Source: found.Source,
                    Currency: found.Currency
                  }
                };
                setHotel(hotelObj);
                setSearchCheckIn(urlCheckIn);
                setSearchCheckOut(urlCheckOut);

                // Also fetch hotel details
                try {
                  const detailRes = await fetch(API_ENDPOINTS.MYGO_HOTELS_DETAILS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ HotelId: id })
                  });
                  if (detailRes.ok) {
                    const detailResult = await detailRes.json();
                    if (detailResult.status === 'success' && detailResult.data?.HotelDetail) {
                      setHotelDetails(detailResult.data.HotelDetail);
                    }
                  }
                } catch (_) {}
              }
            }
          } catch (error) {
            console.error('Error fetching hotel from API on direct access:', error);
          }
        }
      }

      setLoading(false);
    };

    loadHotelData();
  }, [id, getHotelById]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play gallery effect
  useEffect(() => {
    if (!hotel || !isAutoPlaying) return;
    
    const displayData = hotelDetails || hotel;
    const album = displayData.Album || displayData.Images || [];
    const mainImage = displayData.Image || hotel.Image;
    const allImages = mainImage ? [{ Url: mainImage, Alt: hotel.Name }, ...album] : album;
    
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % allImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [hotel, hotelDetails, isAutoPlaying]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getFacilityIcon = (facilityName) => {
    const name = typeof facilityName === 'string' 
      ? facilityName.toLowerCase() 
      : (facilityName?.Name || '').toString().toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <Wifi size={18} />;
    if (name.includes('parking') || name.includes('car')) return <Car size={18} />;
    if (name.includes('restaurant') || name.includes('dining')) return <Utensils size={18} />;
    if (name.includes('pool') || name.includes('swimming')) return <Waves size={18} />;
    if (name.includes('breakfast') || name.includes('coffee')) return <Coffee size={18} />;
    if (name.includes('ac') || name.includes('air')) return <Wind size={18} />;
    if (name.includes('gym') || name.includes('fitness')) return <Dumbbell size={18} />;
    if (name.includes('spa')) return <Droplets size={18} />;
    return <Check size={18} />;
  };

  const getThemeIcon = (themeName) => {
    const name = typeof themeName === 'string' 
      ? themeName.toLowerCase() 
      : (themeName?.Name || '').toString().toLowerCase();
    if (name.includes('affaires') || name.includes('business')) return <Briefcase size={18} />;
    if (name.includes('noces') || name.includes('honeymoon') || name.includes('romance')) return <Heart size={18} />;
    if (name.includes('famille') || name.includes('family') || name.includes('enfant')) return <Baby size={18} />;
    if (name.includes('week') || name.includes('weekend')) return <Palmtree size={18} />;
    if (name.includes('réveillon') || name.includes('noël') || name.includes('fête') || name.includes('party')) return <PartyPopper size={18} />;
    if (name.includes('bien') || name.includes('spa') || name.includes('wellness')) return <Droplets size={18} />;
    if (name.includes('charme') || name.includes('charm') || name.includes('luxe')) return <Award size={18} />;
    if (name.includes('sport') || name.includes('loisir') || name.includes('activity')) return <Dumbbell size={18} />;
    if (name.includes('tourisme') || name.includes('tourism') || name.includes('découverte')) return <Navigation size={18} />;
    if (name.includes('nature') || name.includes('montagne') || name.includes('mountain')) return <TreePine size={18} />;
    return <Star size={18} />;
  };

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return re.test(phone);
  };

  const validateGuestInfo = () => {
    const errors = {};
    
    // Calculate totals from roomsConfig
    const totalAdults = searchRoomsConfig.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = searchRoomsConfig.reduce((sum, room) => sum + (room.children?.length || 0), 0);
    
    // Validate adults
    for (let i = 0; i < totalAdults; i++) {
      const adult = guestInfo.adults[i] || {};
      if (!adult.firstName || adult.firstName.trim() === '') {
        errors[`adult${i}FirstName`] = language === 'fr' ? 'Prénom requis' : 'First name required';
      }
      if (!adult.lastName || adult.lastName.trim() === '') {
        errors[`adult${i}LastName`] = language === 'fr' ? 'Nom requis' : 'Last name required';
      }
      if (!adult.age || adult.age < 18) {
        errors[`adult${i}Age`] = language === 'fr' ? 'Âge invalide (min 18)' : 'Invalid age (min 18)';
      }
    }

    // Validate children if any
    for (let i = 0; i < totalChildren; i++) {
      const child = guestInfo.children[i] || {};
      if (!child.firstName || child.firstName.trim() === '') {
        errors[`child${i}FirstName`] = language === 'fr' ? 'Prénom requis' : 'First name required';
      }
      if (!child.lastName || child.lastName.trim() === '') {
        errors[`child${i}LastName`] = language === 'fr' ? 'Nom requis' : 'Last name required';
      }
      if (!child.age || child.age < 0 || child.age >= 18) {
        errors[`child${i}Age`] = language === 'fr' ? 'Âge invalide (0-17)' : 'Invalid age (0-17)';
      }
    }

    // Validate email
    if (!guestInfo.email || guestInfo.email.trim() === '') {
      errors.email = language === 'fr' ? 'Email requis' : 'Email required';
    } else if (!validateEmail(guestInfo.email)) {
      errors.email = language === 'fr' ? 'Email invalide' : 'Invalid email';
    }

    // Validate phone
    if (!guestInfo.phone || guestInfo.phone.trim() === '') {
      errors.phone = language === 'fr' ? 'Téléphone requis' : 'Phone required';
    } else if (!validatePhone(guestInfo.phone)) {
      errors.phone = language === 'fr' ? 'Numéro invalide' : 'Invalid number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToConfirmation = () => {
    if (!validateGuestInfo()) {
      alert(language === 'fr' ? 'Veuillez remplir tous les champs correctement' : 'Please fill all fields correctly');
      return;
    }
    setBookingStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteBooking = async () => {
    if (!paymentMethod) {
      alert(language === 'fr' ? 'Veuillez choisir un mode de paiement' : 'Please choose a payment method');
      return;
    }

    setLoading(true);

    try {
      // Build Pax data according to API structure
      const buildPaxData = () => {
        const pax = {
          Adult: []
        };

        // Add adults - mark first adult as holder
        guestInfo.adults.forEach((adult, idx) => {
          pax.Adult.push({
            Civility: "Mr", // You might want to add this field to the form
            Name: adult.firstName,
            Surname: adult.lastName,
            Holder: idx === 0 // First adult is the holder
          });
        });

        // Add children if any
        if (guestInfo.children && guestInfo.children.length > 0) {
          pax.Child = guestInfo.children.map(child => ({
            Name: child.firstName,
            Surname: child.lastName,
            Age: child.age.toString()
          }));
        }

        return pax;
      };

      // Build the booking request according to API documentation
      const bookingRequest = {
        hotelBooking: {
          PreBooking: true,
          City: hotel.City?.toString() || searchParams.get('city') || cachedSearchParams.city,
          Hotel: parseInt(hotel.Id || id),
          CheckIn: searchCheckIn,
          CheckOut: searchCheckOut,
          Option: [], // Add options if available
          Source: hotel.SearchData?.Source || "local-2",
          Rooms: [
            {
              Id: selectedRoom.room.Id?.toString() || selectedRoom.room.RoomType,
              Boarding: selectedRoom.boarding.Id?.toString() || selectedRoom.boarding.Name,
              View: [], // Add view options if selected
              Supplement: [], // Add supplements if selected
              Pax: buildPaxData()
            }
          ]
        },
        paymentMethod: paymentMethod,
        totalPrice: parseFloat(selectedRoom.totalPrice),
        contactEmail: guestInfo.email,
        contactPhone: guestInfo.phone,
        notes: ""
      };

      console.log('Sending booking request:', bookingRequest);

      // Get token from localStorage (optional - backend allows guest bookings)
      const token = localStorage.getItem('accessToken');
      
      // Build headers with or without token
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Send booking request to backend
      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(bookingRequest)
      });

      const data = await response.json();

      if (data.status === 'success') {
        const bookingId = data.data.booking._id;
        
        // Check if user is logged in
        const isLoggedIn = !!token;
        
        // If not logged in, save booking to localStorage for tracking
        if (!isLoggedIn) {
          const guestBookings = JSON.parse(localStorage.getItem('guestBookings') || '[]');
          guestBookings.push({
            _id: bookingId,
            ...data.data.booking,
            savedAt: new Date().toISOString()
          });
          localStorage.setItem('guestBookings', JSON.stringify(guestBookings));
        }
        
        // Clear the form
        setBookingStep(1);
        setSelectedRoom(null);
        setSelectedBoarding(null);
        setGuestInfo({ adults: [], children: [], email: '', phone: '' });
        setPaymentMethod(null);

        // Show success message based on payment method
        if (paymentMethod === 'online') {
          alert(language === 'fr' ? 
            `Réservation créée avec succès!\n\nID: ${bookingId}\n\nRedirection vers le paiement...` : 
            `Booking created successfully!\n\nID: ${bookingId}\n\nRedirecting to payment...`);
        } else {
          alert(language === 'fr' ? 
            `Réservation confirmée!\n\nID: ${bookingId}\n\nVeuillez visiter notre agence pour finaliser le paiement.` : 
            `Booking confirmed!\n\nID: ${bookingId}\n\nPlease visit our agency to complete payment.`);
        }
        
        // Redirect to my bookings page
        navigate('/my-bookings');
      } else {
        // Handle error from backend
        alert(language === 'fr' ? 
          `Erreur: ${data.message || 'Une erreur est survenue'}` : 
          `Error: ${data.message || 'An error occurred'}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(language === 'fr' ? 
        'Erreur de connexion. Veuillez réessayer.' : 
        'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-primary-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'fr' ? 'Chargement...' : language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">
            {language === 'fr' ? 'Hôtel non trouvé' : language === 'ar' ? 'الفندق غير موجود' : 'Hotel not found'}
          </h3>
          <p className="text-red-700 mb-4">
            {language === 'fr' ? 'Veuillez d\'abord rechercher des hôtels' : language === 'ar' ? 'يرجى البحث عن الفنادق أولاً' : 'Please search for hotels first'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            {language === 'fr' ? 'Retour à l\'accueil' : language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  // Use hotelDetails if available, otherwise fall back to hotel data
  const displayData = hotelDetails || hotel;
  const album = displayData.Album || displayData.Images || [];
  const mainImage = displayData.Image || hotel.Image;
  const allImages = mainImage ? [{ Url: mainImage, Alt: hotel.Name }, ...album] : album;
  
  // Handle both Facilitie (from details API) and Facilities (from search API)
  const facilities = displayData.Facilitie || displayData.Facilities || hotel.Facilities || [];
  const rawTags = displayData.Tag || [];
  // Fix tag image URLs
  const tags = rawTags.map(tag => ({
    ...tag,
    Image: tag.Image && !tag.Image.startsWith('http') 
      ? `https://admin.mygo.co/${tag.Image}` 
      : tag.Image
  }));
  const themes = displayData.Theme || hotel.Theme || [];
  const starRating = displayData.Category?.Star || hotel.Category?.Star || 0;
  const currency = hotel.SearchData?.Currency || 'TND';
  const longDescription = displayData.LongDescription || '';
  const note = displayData.Note || hotel.Note || '';
  const checkInTime = displayData.CheckIn || '14:00';
  const checkOutTime = displayData.CheckOut || '12:00';
  const email = displayData.Email || '';
  const phone = displayData.Phone || '';
  const address = displayData.Adress || hotel.Adress || hotel.Address || '';
  const cityName = displayData.City?.Name || hotel.City?.Name || '';
  const countryName = displayData.City?.Country?.Name || hotel.City?.Country?.Name || '';
  const latitude = displayData.Localization?.Latitude || hotel.Localization?.Latitude || displayData.Latitude || hotel.Latitude;
  const longitude = displayData.Localization?.Longitude || hotel.Localization?.Longitude || displayData.Longitude || hotel.Longitude;
  
  // Get minimum price
  let minimumPrice = null;
  if (hotel.SearchData?.Price?.Boarding) {
    let minPrice = Infinity;
    hotel.SearchData.Price.Boarding.forEach(boarding => {
      boarding.Pax?.forEach(pax => {
        pax.Rooms?.forEach(room => {
          const price = parseFloat(room.Price || room.BasePrice || 0);
          if (price < minPrice) minPrice = price;
        });
      });
    });
    if (minPrice !== Infinity) minimumPrice = minPrice;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Loading Overlay */}
      {searchLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <Loader2 size={48} className="animate-spin text-primary-600" />
            <p className="text-lg font-semibold text-gray-900">
              {language === 'fr' ? 'Recherche en cours...' : language === 'ar' ? 'جاري البحث...' : 'Searching...'}
            </p>
          </div>
        </div>
      )}
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      {/* Full-Width Photo Gallery */}
      <div className="relative bg-black">
        {allImages.length > 0 ? (
          <>
            {/* Main Image */}
            <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
              <img
                src={allImages[selectedImage]?.Url || allImages[selectedImage]}
                alt={allImages[selectedImage]?.Alt || hotel.Name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent"></div>

              {/* ── Hotel info overlay ──────────────────────────────── */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8">
                <div className="max-w-7xl mx-auto">
                  {/* Stars */}
                  {starRating > 0 && (
                    <div className={`flex items-center gap-1 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {Array.from({ length: starRating }, (_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                      {Array.from({ length: 5 - starRating }, (_, i) => (
                        <Star key={`e${i}`} size={14} className="fill-white/30 text-white/30" />
                      ))}
                      <span className="text-white/70 text-xs ml-1">
                        {starRating} {language === 'fr' ? 'étoiles' : language === 'ar' ? 'نجوم' : 'stars'}
                      </span>
                    </div>
                  )}
                  {/* Hotel name */}
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2 drop-shadow-md">
                    {hotel.Name}
                  </h1>
                  {/* Address */}
                  {address && (
                    <div className={`flex items-center gap-1.5 text-white/80 text-sm md:text-base mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <MapPin size={15} className="flex-shrink-0" />
                      <span>{address}</span>
                    </div>
                  )}
                  {/* TripAdvisor badge */}
                  {taData?.rating && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg px-2.5 py-1">
                        {taData.ratingImageUrl
                          ? <img src={taData.ratingImageUrl} alt={`${taData.rating}`} className="h-4" />
                          : <span className="text-xs font-bold text-white">{taData.rating.toFixed(1)}</span>
                        }
                        {taData.numReviews && (
                          <span className="text-xs text-white/80">
                            · {taData.numReviews.toLocaleString()} {language === 'fr' ? 'avis' : language === 'ar' ? 'تقييم' : 'reviews'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo counter chip */}
              {allImages.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {selectedImage + 1} / {allImages.length}
                </div>
              )}
              
              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      setSelectedImage((selectedImage - 1 + allImages.length) % allImages.length);
                      setIsAutoPlaying(false);
                    }}
                    className={`absolute ${isRTL ? 'right-2 md:right-4' : 'left-2 md:left-4'} top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all`}
                  >
                    <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedImage((selectedImage + 1) % allImages.length);
                      setIsAutoPlaying(false);
                    }}
                    className={`absolute ${isRTL ? 'left-2 md:left-4' : 'right-2 md:right-4'} top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all`}
                  >
                    <ArrowLeft size={20} className={isRTL ? '' : 'rotate-180'} />
                  </button>
                  
                  {/* Play/Pause Button - Hidden on mobile */}
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`hidden md:flex absolute top-4 ${isRTL ? 'left-4' : 'right-4'} bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-full transition-all items-center gap-2`}
                  >
                    {isAutoPlaying ? (
                      <><X size={16} /> <span className="text-sm">Pause</span></>
                    ) : (
                      <><Check size={16} /> <span className="text-sm">Auto</span></>
                    )}
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Strip - Scrollable on mobile */}
            {allImages.length > 1 && (
              <div className="bg-black/50 backdrop-blur-sm overflow-x-auto scrollbar-hide">
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4 flex gap-2 md:gap-3">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-12 md:w-24 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.Url || img}
                        alt={img.Alt || `Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-64 md:h-96 bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
            <ImageIcon size={60} className="text-white/30 md:w-20 md:h-20" />
          </div>
        )}
      </div>

      {/* Search Availability Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 border-2 border-primary-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-primary-600" />
            <span>{language === 'fr' ? 'Vérifier la disponibilité' : language === 'ar' ? 'تحقق من التوفر' : 'Check Availability'}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {language === 'fr' ? 'Arrivée' : language === 'ar' ? 'الوصول' : 'Check-in'}
              </label>
              <input
                type="date"
                value={searchCheckIn}
                onChange={(e) => setSearchCheckIn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {language === 'fr' ? 'Départ' : language === 'ar' ? 'المغادرة' : 'Check-out'}
              </label>
              <input
                type="date"
                value={searchCheckOut}
                onChange={(e) => setSearchCheckOut(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="relative md:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {language === 'fr' ? 'Voyageurs' : language === 'ar' ? 'المسافرون' : 'Guests'}
              </label>
              <button
                type="button"
                onClick={() => setShowGuestSelector(!showGuestSelector)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs sm:text-sm text-gray-700 truncate">
                  {searchRoomsConfig.reduce((sum, room) => sum + room.adults, 0)} {language === 'fr' ? 'Adulte(s)' : 'Adult(s)'} • {searchRoomsConfig.reduce((sum, room) => sum + (room.children?.length || 0), 0)} {language === 'fr' ? 'Enfant(s)' : 'Child(ren)'} • {searchRooms} {language === 'fr' ? 'Ch.' : 'Rm.'}
                </span>
                <Users size={16} className="text-gray-400 flex-shrink-0" />
              </button>
              {showGuestSelector && (
                <>
                  {/* Backdrop overlay to hide navbar and cover page */}
                  <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
                    onClick={() => setShowGuestSelector(false)}
                  />
                  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] w-full max-w-2xl px-4">
                    <GuestSelector
                      rooms={searchRooms}
                      setRooms={setSearchRooms}
                      roomsConfig={searchRoomsConfig}
                      setRoomsConfig={setSearchRoomsConfig}
                      showGuestSelector={showGuestSelector}
                      setShowGuestSelector={setShowGuestSelector}
                      onClose={() => setShowGuestSelector(false)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-1 flex items-end">
              <button
                onClick={handleSearchAvailability}
                disabled={searchLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-2 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {searchLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                {language === 'fr' ? 'Rechercher' : language === 'ar' ? 'بحث' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </div>



        {/* Main Content - Full Width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="space-y-4 md:space-y-5">

            {/* Easy Booking Wizard - Full Width Block */}
            {hotel.SearchData?.Price?.Boarding && (
              <div id="rooms-section" className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden border border-gray-200 md:border-2 md:border-primary-200 scroll-mt-20">
                {/* Wizard Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 sm:px-6 py-4 md:py-5">
                  <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 md:gap-3">
                      <Home size={24} className="md:w-7 md:h-7" />
                      {language === 'fr' ? 'Réservation Facile' : language === 'ar' ? 'حجز سهل' : 'Easy Booking'}
                    </h2>
                    {/* Booking Info */}
                    <div className="flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex-wrap text-xs sm:text-sm">
                      {searchCheckIn && searchCheckOut && (
                        <>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Calendar size={14} className="sm:w-4 sm:h-4" />
                            <span className="text-sm font-semibold">
                              {new Date(searchCheckIn).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - {new Date(searchCheckOut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <div className="h-5 w-px bg-white/40"></div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span className="text-sm font-semibold">
                          {searchRoomsConfig.reduce((sum, room) => sum + room.adults, 0)}{searchRoomsConfig.reduce((sum, room) => sum + (room.children?.length || 0), 0) > 0 && `+${searchRoomsConfig.reduce((sum, room) => sum + (room.children?.length || 0), 0)}`}
                        </span>
                      </div>
                      {minimumPrice && !selectedRoom && (
                        <>
                          <div className="h-5 w-px bg-white/40"></div>
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} />
                            <span className="text-sm font-semibold">
                              {language === 'fr' ? 'À partir de' : 'From'} {minimumPrice} {currency}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Progress Steps - Simplified to 2 steps */}
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-wrap">
                    <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full ${!selectedBoarding ? 'bg-white text-primary-700' : 'bg-primary-500 text-white'}`}>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs ${!selectedBoarding ? 'bg-primary-700 text-white' : 'bg-white text-primary-700'}`}>1</div>
                      <span className="font-semibold hidden sm:inline">{language === 'fr' ? 'Pension' : language === 'ar' ? 'نوع الإقامة' : 'Board'}</span>
                    </div>
                    <div className="h-0.5 w-4 sm:w-8 bg-white opacity-50"></div>
                    <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full ${selectedBoarding ? 'bg-white text-primary-700' : 'bg-primary-500 bg-opacity-50 text-white'}`}>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs ${selectedBoarding ? 'bg-primary-700 text-white' : 'bg-white bg-opacity-30 text-white'}`}>2</div>
                      <span className="font-semibold hidden sm:inline">{language === 'fr' ? 'Chambre' : language === 'ar' ? 'الغرفة' : 'Room'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  {/* STEP 1: Select Boarding Type */}
                  {!selectedBoarding && (
                    <div className="space-y-4">
                      <div className="mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                          {language === 'fr' ? 'Étape 1: Choisissez votre type de pension' : language === 'ar' ? 'الخطوة 1: اختر نوع الإقامة' : 'Step 1: Choose your board type'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {language === 'fr' ? 'Sélectionnez le forfait qui vous convient' : language === 'ar' ? 'اختر الباقة المناسبة لك' : 'Select the package that suits you'}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {hotel.SearchData.Price.Boarding.map((boarding) => {
                          // Calculate min price for this boarding
                          let minBoardingPrice = Infinity;
                          boarding.Pax?.forEach(pax => {
                            pax.Rooms?.forEach(room => {
                              const price = parseFloat(room.Price || 0);
                              if (price < minBoardingPrice) minBoardingPrice = price;
                            });
                          });
                          if (minBoardingPrice === Infinity) minBoardingPrice = null;

                          return (
                            <button
                              key={boarding.Id}
                              onClick={() => {
                                setSelectedBoarding(boarding);
                                setSelectedRoom(null);
                              }}
                              className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl hover:border-primary-400 transition-all text-left group"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-primary-100 group-hover:bg-primary-600 text-primary-600 group-hover:text-white p-3 rounded-lg transition-all">
                                  <Utensils size={24} />
                                </div>
                                <h3 className="font-bold text-xl text-gray-900">{boarding.Name}</h3>
                              </div>
                              {minBoardingPrice && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-600 mb-1">
                                    {language === 'fr' ? 'À partir de' : language === 'ar' ? 'ابتداءً من' : 'Starting from'}
                                  </p>
                                  <p className="text-2xl font-bold text-primary-600">
                                    {minBoardingPrice} <span className="text-sm">{currency}</span>
                                  </p>
                                </div>
                              )}
                              <div className="mt-3 flex items-center gap-2 text-primary-600 font-semibold text-sm">
                                <span>{language === 'fr' ? 'Voir les chambres' : language === 'ar' ? 'عرض الغرف' : 'View rooms'}</span>
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Select Room */}
                  {selectedBoarding && !selectedRoom && (
                    <div className="space-y-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {language === 'fr' ? 'Étape 2: Choisissez votre chambre' : language === 'ar' ? 'الخطوة 2: اختر غرفتك' : 'Step 2: Choose your room'}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Utensils size={14} />
                            <span className="font-semibold">{selectedBoarding.Name}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedBoarding(null)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                        >
                          <ArrowLeft size={16} />
                          {language === 'fr' ? 'Changer' : language === 'ar' ? 'تغيير' : 'Change'}
                        </button>
                      </div>
                      
                      {/* Info Banner */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900">
                          {language === 'fr' 
                            ? 'Après avoir sélectionné une chambre, vous serez redirigé vers la page de réservation pour finaliser.'
                            : language === 'ar' 
                            ? 'بعد اختيار الغرفة، سيتم توجيهك إلى صفحة الحجز للإكمال.'
                            : 'After selecting a room, you will be redirected to the booking page to finalize.'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedBoarding.Pax?.map((pax, paxIdx) => (
                          pax.Rooms?.map((room, roomIdx) => {
                            // Calculate nights from check-in and check-out dates
                            const nights = searchCheckIn && searchCheckOut
                              ? Math.ceil((new Date(searchCheckOut) - new Date(searchCheckIn)) / (1000 * 60 * 60 * 24))
                              : hotel.SearchData?.NumberOfNights || 1;
                            const pricePerNight = parseFloat(room.Price) / nights;
                            
                            return (
                            <button
                              key={`${paxIdx}-${roomIdx}`}
                              onClick={() => {
                                // Navigate to BookingPage with all necessary data
                                navigate('/hotel/booking', {
                                  state: {
                                    hotel,
                                    room: {
                                      ...room,
                                      Id: room.Id || room.RoomType,
                                      Name: room.Name || room.RoomType,
                                      Price: room.Price
                                    },
                                    boarding: {
                                      ...selectedBoarding,
                                      Id: selectedBoarding.Id,
                                      Name: selectedBoarding.Name,
                                      Code: selectedBoarding.Code
                                    },
                                    checkIn: searchCheckIn,
                                    checkOut: searchCheckOut,
                                    adults: searchRoomsConfig.reduce((sum, room) => sum + room.adults, 0),
                                    children: searchRoomsConfig.reduce((sum, room) => sum + room.children.length, 0),
                                    rooms: searchRooms,
                                    roomsConfig: searchRoomsConfig,
                                    nights,
                                    pricePerNight,
                                    totalPrice: room.Price
                                  }
                                });
                              }}
                              className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg hover:border-primary-400 transition-all text-left group"
                            >
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="bg-primary-100 group-hover:bg-primary-600 text-primary-600 group-hover:text-white p-2 rounded-lg transition-all">
                                    <Home size={18} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-base text-gray-900">{room.Name || room.RoomType}</p>
                                    {room.Quantity && (
                                      <p className="text-xs text-green-600 flex items-center gap-1">
                                        <Check size={10} />
                                        {room.Quantity} {language === 'fr' ? 'dispo' : language === 'ar' ? 'متاح' : 'avail'}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {room.Description && (
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{room.Description}</p>
                              )}
                              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-500">{language === 'fr' ? 'Prix total' : language === 'ar' ? 'السعر الإجمالي' : 'Total'}</p>
                                  <p className="text-xl font-bold text-primary-600">{room.Price} <span className="text-sm">{currency}</span></p>
                                  <p className="text-xs text-gray-500">{pricePerNight.toFixed(0)} × {nights} {language === 'fr' ? 'nuits' : language === 'ar' ? 'ليالي' : 'nights'}</p>
                                </div>
                                <div className="flex items-center gap-1 text-primary-600 font-semibold text-sm">
                                  <span>{language === 'fr' ? 'Réserver' : language === 'ar' ? 'احجز' : 'Book Now'}</span>
                                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                              {room.Supplement && room.Supplement.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                    <Info size={12} />
                                    {language === 'fr' ? 'Suppléments' : language === 'ar' ? 'إضافات' : 'Extras'}
                                  </p>
                                  <div className="space-y-1">
                                    {room.Supplement.map((supp, suppIdx) => (
                                      <div key={suppIdx} className="flex items-center justify-between text-xs text-gray-600">
                                        <span>• {supp.Name}</span>
                                        <span className="font-semibold">+{supp.Price} {currency}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </button>
                          )
                          })
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Final Confirmation - Simplified */}
                  {selectedRoom && bookingStep === 3 && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {language === 'fr' ? 'Étape 3: Informations des voyageurs' : language === 'ar' ? 'الخطوة 3: معلومات المسافرين' : 'Step 3: Traveler Information'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {language === 'fr' ? 'Remplissez les informations de tous les voyageurs' : language === 'ar' ? 'أدخل معلومات جميع المسافرين' : 'Fill in information for all travelers'}
                        </p>
                      </div>

                      {/* Adults Information */}
                      <div className="space-y-4">
                        {[...Array(searchRoomsConfig.reduce((sum, room) => sum + room.adults, 0))].map((_, idx) => (
                          <div key={`adult-${idx}`} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Users size={20} className="text-blue-600" />
                              {language === 'fr' ? `Adulte ${idx + 1}` : `Adult ${idx + 1}`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <input
                                  type="text"
                                  placeholder={language === 'fr' ? 'Prénom *' : 'First Name *'}
                                  value={guestInfo.adults[idx]?.firstName || ''}
                                  onChange={(e) => {
                                    const newAdults = [...guestInfo.adults];
                                    if (!newAdults[idx]) newAdults[idx] = {};
                                    newAdults[idx].firstName = e.target.value;
                                    setGuestInfo({...guestInfo, adults: newAdults});
                                  }}
                                  className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                    validationErrors[`adult${idx}FirstName`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {validationErrors[`adult${idx}FirstName`] && (
                                  <p className="text-xs text-red-600 mt-1">{validationErrors[`adult${idx}FirstName`]}</p>
                                )}
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder={language === 'fr' ? 'Nom *' : 'Last Name *'}
                                  value={guestInfo.adults[idx]?.lastName || ''}
                                  onChange={(e) => {
                                    const newAdults = [...guestInfo.adults];
                                    if (!newAdults[idx]) newAdults[idx] = {};
                                    newAdults[idx].lastName = e.target.value;
                                    setGuestInfo({...guestInfo, adults: newAdults});
                                  }}
                                  className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                    validationErrors[`adult${idx}LastName`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {validationErrors[`adult${idx}LastName`] && (
                                  <p className="text-xs text-red-600 mt-1">{validationErrors[`adult${idx}LastName`]}</p>
                                )}
                              </div>
                              <div>
                                <input
                                  type="number"
                                  placeholder={language === 'fr' ? 'Âge (18+) *' : 'Age (18+) *'}
                                  value={guestInfo.adults[idx]?.age || ''}
                                  onChange={(e) => {
                                    const newAdults = [...guestInfo.adults];
                                    if (!newAdults[idx]) newAdults[idx] = {};
                                    newAdults[idx].age = parseInt(e.target.value);
                                    setGuestInfo({...guestInfo, adults: newAdults});
                                  }}
                                  min="18"
                                  max="120"
                                  className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                    validationErrors[`adult${idx}Age`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {validationErrors[`adult${idx}Age`] && (
                                  <p className="text-xs text-red-600 mt-1">{validationErrors[`adult${idx}Age`]}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Children Information */}
                      {searchRoomsConfig.reduce((sum, room) => sum + (room.children?.length || 0), 0) > 0 && (
                        <div className="space-y-4">
                          {[...Array(searchRoomsConfig.reduce((sum, room) => sum + (room.children?.length || 0), 0))].map((_, idx) => (
                            <div key={`child-${idx}`} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Baby size={20} className="text-green-600" />
                                {language === 'fr' ? `Enfant ${idx + 1}` : `Child ${idx + 1}`}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <input
                                    type="text"
                                    placeholder={language === 'fr' ? 'Prénom *' : 'First Name *'}
                                    value={guestInfo.children[idx]?.firstName || ''}
                                    onChange={(e) => {
                                      const newChildren = [...guestInfo.children];
                                      if (!newChildren[idx]) newChildren[idx] = {};
                                      newChildren[idx].firstName = e.target.value;
                                      setGuestInfo({...guestInfo, children: newChildren});
                                    }}
                                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                      validationErrors[`child${idx}FirstName`] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                  />
                                  {validationErrors[`child${idx}FirstName`] && (
                                    <p className="text-xs text-red-600 mt-1">{validationErrors[`child${idx}FirstName`]}</p>
                                  )}
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    placeholder={language === 'fr' ? 'Nom *' : 'Last Name *'}
                                    value={guestInfo.children[idx]?.lastName || ''}
                                    onChange={(e) => {
                                      const newChildren = [...guestInfo.children];
                                      if (!newChildren[idx]) newChildren[idx] = {};
                                      newChildren[idx].lastName = e.target.value;
                                      setGuestInfo({...guestInfo, children: newChildren});
                                    }}
                                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                      validationErrors[`child${idx}LastName`] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                  />
                                  {validationErrors[`child${idx}LastName`] && (
                                    <p className="text-xs text-red-600 mt-1">{validationErrors[`child${idx}LastName`]}</p>
                                  )}
                                </div>
                                <div>
                                  <input
                                    type="number"
                                    placeholder={language === 'fr' ? 'Âge (0-17) *' : 'Age (0-17) *'}
                                    value={guestInfo.children[idx]?.age || ''}
                                    onChange={(e) => {
                                      const newChildren = [...guestInfo.children];
                                      if (!newChildren[idx]) newChildren[idx] = {};
                                      newChildren[idx].age = parseInt(e.target.value);
                                      setGuestInfo({...guestInfo, children: newChildren});
                                    }}
                                    min="0"
                                    max="17"
                                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                      validationErrors[`child${idx}Age`] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                  />
                                  {validationErrors[`child${idx}Age`] && (
                                    <p className="text-xs text-red-600 mt-1">{validationErrors[`child${idx}Age`]}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Contact Information */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Mail size={20} className="text-purple-600" />
                          {language === 'fr' ? 'Informations de contact' : language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="email"
                              placeholder="Email *"
                              value={guestInfo.email}
                              onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                              className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                validationErrors.email ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {validationErrors.email && (
                              <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
                            )}
                          </div>
                          <div>
                            <input
                              type="tel"
                              placeholder={language === 'fr' ? 'Téléphone *' : 'Phone *'}
                              value={guestInfo.phone}
                              onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                              className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {validationErrors.phone && (
                              <p className="text-xs text-red-600 mt-1">{validationErrors.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => setBookingStep(2)}
                          className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                          <ArrowLeft size={20} />
                          {language === 'fr' ? 'Retour' : language === 'ar' ? 'رجوع' : 'Back'}
                        </button>
                        <button
                          onClick={handleContinueToConfirmation}
                          className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                        >
                          {language === 'fr' ? 'Continuer' : language === 'ar' ? 'متابعة' : 'Continue'}
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Confirmation & Payment */}
                  {selectedRoom && bookingStep === 4 && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle2 size={24} className="text-green-600" />
                          {language === 'fr' ? 'Étape 4: Confirmation et paiement' : language === 'ar' ? 'الخطوة 4: التأكيد والدفع' : 'Step 4: Confirmation & Payment'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {language === 'fr' ? 'Vérifiez vos informations et choisissez votre mode de paiement' : language === 'ar' ? 'تحقق من المعلومات واختر طريقة الدفع' : 'Review your information and choose payment method'}
                        </p>
                      </div>

                      {/* Booking Summary - Simplified */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                        <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                          <CheckCircle2 size={20} />
                          {language === 'fr' ? 'Récapitulatif de réservation' : language === 'ar' ? 'ملخص الحجز' : 'Booking Summary'}
                        </h4>
                        
                        <div className="space-y-3">
                          {/* Hotel + Location */}
                          <div className="bg-white rounded-lg p-3">
                            <p className="font-bold text-gray-900 text-sm mb-1">{hotel.Name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <MapPin size={14} />
                              <span>{cityName}, {countryName}</span>
                            </div>
                          </div>

                          {/* Dates + Room in Grid */}
                          <div className="bg-white rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{language === 'fr' ? 'Arrivée' : 'Check-in'}</span>
                              <span className="font-semibold text-gray-900">
                                {searchCheckIn && new Date(searchCheckIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{language === 'fr' ? 'Départ' : 'Check-out'}</span>
                              <span className="font-semibold text-gray-900">
                                {searchCheckOut && new Date(searchCheckOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-900">{selectedRoom.room.Name}</p>
                              <p className="text-xs text-primary-700">{selectedRoom.boarding.Name}</p>
                            </div>
                          </div>

                          {/* Guests + Contact */}
                          <div className="bg-white rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-3 text-xs">
                              <Users size={14} className="text-gray-500" />
                              <span className="font-semibold">{searchRoomsConfig.reduce((sum, room) => sum + room.adults, 0)} {language === 'fr' ? 'Adulte(s)' : 'Adult(s)'}</span>
                              {searchRoomsConfig.reduce((sum, room) => sum + (room.children?.length || 0), 0) > 0 && <span className="font-semibold">• {searchRoomsConfig.reduce((sum, room) => sum + (room.children?.length || 0), 0)} {language === 'fr' ? 'Enfant(s)' : 'Child(ren)'}</span>}
                            </div>
                            <div className="pt-2 border-t border-gray-200 space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-700">
                                <Mail size={14} className="text-primary-600" />
                                <span>{guestInfo.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-700">
                                <Phone size={14} className="text-primary-600" />
                                <span>{guestInfo.phone}</span>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-3 text-white">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-xs opacity-90">{language === 'fr' ? 'Prix total' : 'Total'}</p>
                                <p className="text-xs opacity-75 mt-0.5">
                                  {selectedRoom.nights} {language === 'fr' ? (selectedRoom.nights > 1 ? 'nuits' : 'nuit') : (selectedRoom.nights > 1 ? 'nights' : 'night')}
                                </p>
                              </div>
                              <span className="text-2xl font-bold">{selectedRoom.totalPrice} {currency}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method Selection */}
                      <div>
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <DollarSign size={20} className="text-primary-600" />
                          {language === 'fr' ? 'Mode de paiement' : language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() => setPaymentMethod('agency')}
                            className={`p-5 rounded-xl border-2 transition-all text-left ${
                              paymentMethod === 'agency'
                                ? 'border-primary-600 bg-primary-50 shadow-lg'
                                : 'border-gray-200 hover:border-primary-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-3 rounded-lg ${paymentMethod === 'agency' ? 'bg-primary-600' : 'bg-gray-100'}`}>
                                <Home size={24} className={paymentMethod === 'agency' ? 'text-white' : 'text-gray-400'} />
                              </div>
                              <h5 className="font-bold text-lg">{language === 'fr' ? 'Payer à l\'agence' : language === 'ar' ? 'الدفع في الوكالة' : 'Pay at agency'}</h5>
                            </div>
                            <p className="text-sm text-gray-600">
                              {language === 'fr' ? 'Payez directement à notre agence lors de votre visite' : 'Pay directly at our agency when you visit'}
                            </p>
                            {paymentMethod === 'agency' && (
                              <div className="mt-3 flex items-center gap-2 text-green-600 font-medium">
                                <CheckCircle2 size={18} />
                                <span className="text-sm">{language === 'fr' ? 'Sélectionné' : 'Selected'}</span>
                              </div>
                            )}
                          </button>

                          <button
                            onClick={() => setPaymentMethod('online')}
                            className={`p-5 rounded-xl border-2 transition-all text-left ${
                              paymentMethod === 'online'
                                ? 'border-primary-600 bg-primary-50 shadow-lg'
                                : 'border-gray-200 hover:border-primary-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-3 rounded-lg ${paymentMethod === 'online' ? 'bg-primary-600' : 'bg-gray-100'}`}>
                                <Shield size={24} className={paymentMethod === 'online' ? 'text-white' : 'text-gray-400'} />
                              </div>
                              <h5 className="font-bold text-lg">{language === 'fr' ? 'Payer en ligne' : language === 'ar' ? 'الدفع عبر الإنترنت' : 'Pay online'}</h5>
                            </div>
                            <p className="text-sm text-gray-600">
                              {language === 'fr' ? 'Paiement sécurisé par carte bancaire' : 'Secure payment by credit card'}
                            </p>
                            {paymentMethod === 'online' && (
                              <div className="mt-3 flex items-center gap-2 text-green-600 font-medium">
                                <CheckCircle2 size={18} />
                                <span className="text-sm">{language === 'fr' ? 'Sélectionné' : 'Selected'}</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => setBookingStep(3)}
                          className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                          <ArrowLeft size={20} />
                          {language === 'fr' ? 'Retour' : language === 'ar' ? 'رجوع' : 'Back'}
                        </button>
                        <button
                          onClick={handleCompleteBooking}
                          disabled={!paymentMethod}
                          className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl ${
                            !paymentMethod 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : paymentMethod === 'online'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                          }`}
                        >
                          {paymentMethod === 'online' ? (
                            <>
                              <Shield size={24} />
                              {language === 'fr' ? 'Payer en ligne maintenant' : language === 'ar' ? 'ادفع الآن' : 'Pay Online Now'}
                            </>
                          ) : (
                            <>
                              <Check size={24} />
                              {language === 'fr' ? 'Réserver maintenant' : language === 'ar' ? 'احجز الآن' : 'Book Now'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map + Contact & Important Info - Side by Side */}
            {/* Section header */}
            <div className={`flex items-center gap-3 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="w-1 h-5 bg-primary-500 rounded-full flex-shrink-0 inline-block" />
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                {language === 'fr' ? 'Localisation & Contact' : language === 'ar' ? 'الموقع والتواصل' : 'Location & Contact'}
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Map Component */}
              {latitude && longitude ? (
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden h-[400px] lg:h-full lg:min-h-[500px] relative z-0">
                  <MapContainer
                    center={[parseFloat(longitude), parseFloat(latitude)]}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="h-full w-full z-0"
                    style={{ zIndex: 0 }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[parseFloat(longitude), parseFloat(latitude)]}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-bold text-gray-900">{hotel.Name}</p>
                            {address && <p className="text-sm text-gray-600 mt-1">{address}</p>}
                            {cityName && <p className="text-sm text-gray-600">{cityName}, {countryName}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-xl md:rounded-2xl shadow-lg p-8 h-[400px] lg:h-full lg:min-h-[500px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="text-lg">Carte non disponible</p>
                      <p className="text-sm mt-2">Coordonnées GPS manquantes</p>
                    </div>
                  </div>
                )}

              {/* Info Card — contact + timings + location in one clean card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">

                {/* Contact */}
                {(phone || email) && (
                  <div className="px-5 py-4">
                    <p className={`text-xs font-bold text-primary-600 uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}>
                      {language === 'fr' ? 'Contact' : language === 'ar' ? 'اتصل بنا' : 'Contact'}
                    </p>
                    <div className="space-y-2">
                      {phone && (
                        <a href={`tel:${phone}`} className={`flex items-center gap-3 text-gray-700 hover:text-primary-700 transition-colors group ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="bg-primary-50 group-hover:bg-primary-100 p-2 rounded-lg transition-colors">
                            <Phone size={16} className="text-primary-600" />
                          </div>
                          <span className="text-sm font-medium">{phone}</span>
                        </a>
                      )}
                      {email && (
                        <a href={`mailto:${email}`} className={`flex items-center gap-3 text-gray-700 hover:text-primary-700 transition-colors group ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="bg-primary-50 group-hover:bg-primary-100 p-2 rounded-lg transition-colors">
                            <Mail size={16} className="text-primary-600" />
                          </div>
                          <span className="text-sm font-medium">{email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Timings */}
                {(checkInTime || checkOutTime) && (
                  <div className="px-5 py-4">
                    <p className={`text-xs font-bold text-primary-600 uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}>
                      {language === 'fr' ? 'Horaires' : language === 'ar' ? 'أوقات' : 'Timings'}
                    </p>
                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {checkInTime && (
                        <div className={`flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar size={15} className="text-green-600 flex-shrink-0" />
                          <div className={isRTL ? 'text-right' : ''}>
                            <p className="text-[10px] text-green-600 font-semibold uppercase">{language === 'fr' ? 'Arrivée' : language === 'ar' ? 'وصول' : 'Check-in'}</p>
                            <p className="text-sm font-bold text-gray-900">{checkInTime}</p>
                          </div>
                        </div>
                      )}
                      {checkOutTime && (
                        <div className={`flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar size={15} className="text-red-500 flex-shrink-0" />
                          <div className={isRTL ? 'text-right' : ''}>
                            <p className="text-[10px] text-red-500 font-semibold uppercase">{language === 'fr' ? 'Départ' : language === 'ar' ? 'مغادرة' : 'Check-out'}</p>
                            <p className="text-sm font-bold text-gray-900">{checkOutTime}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {(address || cityName) && (
                  <div className="px-5 py-4">
                    <p className={`text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 ${isRTL ? 'text-right' : ''}`}>
                      {language === 'fr' ? 'Adresse' : language === 'ar' ? 'العنوان' : 'Address'}
                    </p>
                    <div className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                      <MapPin size={15} className="text-primary-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700 space-y-0.5">
                        {address && <p>{address}</p>}
                        {cityName && <p className="text-gray-500">{cityName}{countryName ? `, ${countryName}` : ''}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Hotel Information ─────────────────────────────────── */}
            {/* Section header */}
            <div className={`flex items-center gap-3 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="w-1 h-5 bg-primary-500 rounded-full flex-shrink-0 inline-block" />
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                {language === 'fr' ? "À propos de l'hôtel" : language === 'ar' ? 'عن الفندق' : 'About the hotel'}
              </h2>
            </div>
            <div className="space-y-4">

              {/* Description */}
              {longDescription && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('description')}
                    className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${expandedSections.description ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50'} ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <span className={`text-sm font-bold text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Info size={16} className="text-primary-500" />
                      {language === 'fr' ? 'Description' : language === 'ar' ? 'الوصف' : 'Description'}
                    </span>
                    {expandedSections.description
                      ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                      : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  {expandedSections.description && (
                    <div className={`px-5 pb-5 border-t border-gray-100 pt-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div
                        className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: longDescription }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Facilities */}
              {facilities.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('facilities')}
                    className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${expandedSections.facilities ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50'} ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <span className={`text-sm font-bold text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Wifi size={16} className="text-primary-500" />
                      {language === 'fr' ? 'Équipements' : language === 'ar' ? 'المرافق' : 'Facilities'}
                      <span className="text-xs font-normal text-gray-400">({facilities.length})</span>
                    </span>
                    {expandedSections.facilities
                      ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                      : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  {expandedSections.facilities && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {facilities.map((facility, index) => {
                          const facilityName = facility?.Title || facility?.Name || (typeof facility === 'string' ? facility : '');
                          if (!facilityName) return null;
                          return (
                            <div
                              key={index}
                              className={`inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                              <span className="text-blue-500">{getFacilityIcon(facilityName)}</span>
                              {facilityName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tags & Themes */}
              {(tags.length > 0 || themes.length > 0) && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  {tags.length > 0 && (
                    <div className={themes.length > 0 ? 'mb-5' : ''}>
                      <p className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}>
                        {language === 'fr' ? 'Caractéristiques' : language === 'ar' ? 'المميزات' : 'Features'}
                      </p>
                      <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {tags.map((tag, index) => (
                          <div key={index} className={`inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {tag.Image && <img src={tag.Image} alt={tag.Title} className="w-3.5 h-3.5 object-contain" />}
                            {tag.Title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {themes.length > 0 && (
                    <div>
                      {tags.length > 0 && <div className="border-t border-gray-100 mb-4" />}
                      <p className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}>
                        {language === 'fr' ? 'Thèmes' : language === 'ar' ? 'المواضيع' : 'Themes'}
                      </p>
                      <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {themes.map((theme, index) => {
                          const themeName = theme.Name || theme;
                          return (
                            <div
                              key={index}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-xs font-semibold border border-pink-100 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                              {getThemeIcon(themeName)}
                              {themeName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Important Notes — always visible amber callout */}
              {note && (
                <div className={`bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden`}>
                  <div className={`flex items-center gap-2 px-5 py-3 border-b border-amber-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                    <span className="text-sm font-bold text-amber-800">
                      {language === 'fr' ? 'Informations importantes' : language === 'ar' ? 'معلومات هامة' : 'Important Information'}
                    </span>
                  </div>
                  <div className={`px-5 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div
                      className="prose prose-sm max-w-none text-amber-900 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: note }}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* ── TripAdvisor Section ─────────────────────────────────── */}
            {taData && (
              <div className="space-y-5">

                {/* Section header — unified style */}
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="w-1 h-5 bg-primary-500 rounded-full flex-shrink-0 inline-block" />
                    <img src={tripadvisorLogo} alt="TripAdvisor" className="h-7" />
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest">TripAdvisor</h3>
                  </div>
                  {taData.webUrl && (
                    <a
                      href={taData.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#34E0A1] hover:underline font-semibold"
                    >
                      {language === 'fr' ? 'Voir sur TripAdvisor →' : language === 'ar' ? 'عرض على TripAdvisor ←' : 'View on TripAdvisor →'}
                    </a>
                  )}
                </div>

                {/* Rating card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className={`flex flex-col sm:flex-row items-center gap-6 p-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>

                    {/* Big score */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-28 h-28 rounded-full bg-[#34E0A1] flex items-center justify-center shadow-lg">
                        <span className="text-5xl font-black text-white leading-none">{taData.rating?.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-gray-400 font-medium">/ 5.0</span>
                    </div>

                    {/* Info */}
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {taData.rating && (
                        <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {[1,2,3,4,5].map(i => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-full ${i <= Math.round(taData.rating) ? 'bg-[#34E0A1]' : 'bg-gray-200'}`}
                            />
                          ))}
                        </div>
                      )}
                      {taData.numReviews && (
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          {taData.numReviews.toLocaleString()}{' '}
                          <span className="text-lg font-normal text-gray-500">
                            {language === 'fr' ? 'avis voyageurs' : language === 'ar' ? 'تقييم' : 'reviews'}
                          </span>
                        </p>
                      )}
                      {taData.rankingData?.ranking_string && (
                        <p className="text-base text-gray-600 flex items-center gap-1.5">
                          <Award size={16} className="text-[#34E0A1] flex-shrink-0" />
                          {taData.rankingData.ranking_string}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* TA Photos */}
                {taPhotos.length > 0 && (
                  <div>
                    <p className={`text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}>
                      {language === 'fr' ? 'Photos TripAdvisor' : language === 'ar' ? 'صور TripAdvisor' : 'TripAdvisor Photos'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {taPhotos.map((p, i) => {
                        const src = p.images?.original?.url || p.images?.large?.url || p.images?.medium?.url;
                        if (!src) return null;
                        return (
                          <a key={i} href={p.source?.url || taData.webUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={src}
                              alt={p.caption || `Photo ${i + 1}`}
                              className="w-full h-28 sm:h-24 object-cover rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                              loading="lazy"
                            />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TA Reviews */}
                {taReviews.length > 0 && (
                  <div>
                    <p className={`text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 ${isRTL ? 'text-right' : ''}`}>
                      {language === 'fr' ? 'Derniers avis' : language === 'ar' ? 'أحدث التقييمات' : 'Recent reviews'}
                    </p>
                    <div className="space-y-4">
                      {taReviews.slice(0, 3).map((r, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                          <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-[#34E0A1]/20 flex items-center justify-center flex-shrink-0">
                              <MessageSquare size={18} className="text-[#34E0A1]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {/* Title + rating */}
                              <div className={`flex items-start justify-between gap-2 mb-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-base font-bold text-gray-900 leading-tight">{r.title || ''}</span>
                                {r.rating && (
                                  <div className={`flex items-center gap-1 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    {[1,2,3,4,5].map(s => (
                                      <div key={s} className={`w-3 h-3 rounded-full ${s <= r.rating ? 'bg-[#34E0A1]' : 'bg-gray-200'}`} />
                                    ))}
                                    <span className="text-sm font-bold text-gray-700 ml-1">{r.rating}.0</span>
                                  </div>
                                )}
                              </div>
                              {/* Review text */}
                              <p className={`text-sm text-gray-700 leading-relaxed line-clamp-4 ${isRTL ? 'text-right' : ''}`}>{r.text}</p>
                              {/* Meta */}
                              <div className={`flex items-center gap-4 mt-3 text-xs text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {r.username && <span className="font-medium text-gray-500">{r.username}</span>}
                                {r.published_date && <span>{new Date(r.published_date).toLocaleDateString('fr-FR')}</span>}
                                {r.helpful_votes > 0 && (
                                  <span className="flex items-center gap-1">
                                    <ThumbsUp size={12} /> {r.helpful_votes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {taData.webUrl && (
                      <a
                        href={taData.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 block text-center text-sm text-[#34E0A1] hover:underline font-bold"
                      >
                        {language === 'fr' ? `Voir tous les avis sur TripAdvisor →` : language === 'ar' ? `عرض كل التقييمات →` : `View all reviews on TripAdvisor →`}
                      </a>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* Remove old sequential sections below */}
            {/* Long Description - REMOVED, now in Bento */}
            {/* Important Notes - REMOVED, now in Bento */}
            {/* Tags - REMOVED, now in Bento */}
            {/* Themes - REMOVED, now in Bento */}
          </div>
        </div>
    </div>
  );
};

export default HotelDetails;
