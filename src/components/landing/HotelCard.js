import React from 'react';
import { Star, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const HotelCard = ({ 
  id,
  image, 
  name, 
  location, 
  rating, 
  reviewCount, 
  price, 
  originalPrice 
}) => {
  return (
    <Link to={`/hotel/${id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <button className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
          <Heart size={18} className="text-gray-600" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              className={i < rating ? "fill-secondary-500 text-secondary-500" : "text-gray-300"} 
            />
          ))}
          <span className="text-xs text-gray-600 mr-1">({reviewCount})</span>
        </div>
        <h3 className="font-bold text-gray-900 mb-1 text-sm">{name}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin size={12} />
          <span>{location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through mr-2">
                {originalPrice} د.ت
              </span>
            )}
            <span className="text-lg font-bold text-primary-600">{price} د.ت</span>
            <span className="text-xs text-gray-500"> / ليلة</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
