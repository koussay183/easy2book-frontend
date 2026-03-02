import React from 'react';
import { Star, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const HotelCard = ({ 
  id,
  image, 
  name, 
  location, 
  rating = 0, 
  reviewCount = 0, 
  price, 
  originalPrice 
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  // Fallback image if none provided
  const hotelImage = image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
  
  return (
    <Link 
      to={`/hotel/${id}`} 
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative overflow-hidden">
        <img 
          src={hotelImage} 
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
          }}
        />
        <button 
          className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors`}
          onClick={(e) => {
            e.preventDefault();
            // Add to favorites logic here
          }}
        >
          <Heart size={18} className="text-gray-600" />
        </button>
        {reviewCount > 0 && (
          <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg`}>
            <span className="text-xs font-bold text-gray-700">⭐ {rating}.0</span>
          </div>
        )}
      </div>
      <div className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h3 className="font-bold text-gray-900 mb-1.5 text-base line-clamp-1">{name}</h3>
        <div className={`flex items-center gap-1.5 text-sm text-gray-500 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <MapPin size={14} className="flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>
        
        {rating > 0 && (
          <div className={`flex items-center gap-1 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={13} 
                className={i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
              />
            ))}
            {reviewCount > 0 && (
              <span className={`text-sm text-gray-500 ${isRTL ? 'mr-1' : 'ml-1'}`}>({reviewCount})</span>
            )}
          </div>
        )}
        
        {price > 0 && (
          <div className={`flex items-baseline gap-2 pt-2 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {originalPrice} {language === 'fr' ? 'TND' : language === 'ar' ? 'دينار' : 'TND'}
              </span>
            )}
            <div className={`flex items-baseline gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-xl font-bold text-primary-600">
                {parseFloat(price).toFixed(0)}
              </span>
              <span className="text-sm text-gray-500">
                {language === 'fr' ? 'TND / nuit' : language === 'ar' ? 'دينار / ليلة' : 'TND / night'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default HotelCard;
