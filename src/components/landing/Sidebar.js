import React from 'react';
import { Hotel, Plane, Mountain, Calendar, MapPin, X, Sparkles, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} 
      onClick={onClose}
    >
      <div 
        className={`fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <img src={logo} alt="Easy2Book" className="h-8" />
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1">
            <Link to="/hotels" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Hotel size={20} />
              <span className="font-medium">الفنادق</span>
            </Link>
            <Link to="/houses" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <span className="font-medium">المنازل</span>
            </Link>
            <Link to="/flights" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Plane size={20} />
              <span className="font-medium">الرحلات</span>
            </Link>
            <Link to="/trains" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm5.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-7h-5V6h5v4z"/>
              </svg>
              <span className="font-medium">القطارات</span>
            </Link>
            <Link to="/cars" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              <span className="font-medium">السيارات</span>
            </Link>
            <Link to="/attractions" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Sparkles size={20} />
              <span className="font-medium">المعالم السياحية</span>
            </Link>
            <Link to="/omra" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Mountain size={20} />
              <span className="font-medium">رحلات العمرة</span>
            </Link>
            <Link to="/packages" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Calendar size={20} />
              <span className="font-medium">الباقات السياحية</span>
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mr-auto">جديد</span>
            </Link>

            <div className="border-t border-gray-200 my-4"></div>

            <Link to="/tours" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="font-medium">جولات خاصة</span>
            </Link>
            <Link to="/planner" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <MapPin size={20} />
              <span className="font-medium">مخطط الرحلات</span>
            </Link>
          </nav>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">هل تحتاج للمساعدة؟</p>
            <a href="tel:+216XXXXXXXX" className="flex items-center gap-2 text-primary-600 font-semibold">
              <Phone size={18} />
              <span>اتصل بنا</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
