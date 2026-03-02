import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, UserCircle, User, LogOut, BookOpen } from 'lucide-react';
import logo from '../assets/images/logo.png';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../locales/translations';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const t = translations[language].header;
  const isRTL = language === 'ar';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="group flex-shrink-0">
            <img 
              src={logo} 
              alt="Easy2Book" 
              className="h-10 w-auto object-contain transform group-hover:scale-105 transition-transform duration-300" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Language Selector */}
            <div className={`flex items-center gap-2 text-sm text-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Globe size={18} />
              <select 
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent font-medium cursor-pointer hover:text-primary-600 transition-colors outline-none border-none"
              >
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Guest Booking Lookup */}
            <Link 
              to="/guest-booking-lookup" 
              className="text-gray-700 hover:text-primary-600 font-medium text-sm transition-colors"
            >
              {language === 'fr' ? 'Suivre ma réservation' : language === 'ar' ? 'تتبع حجزي' : 'Track Booking'}
            </Link>

            {/* My Bookings */}
            <Link 
              to="/bookings" 
              className="text-gray-700 hover:text-primary-600 font-medium text-sm transition-colors"
            >
              {t.myBookings}
            </Link>

            {/* Authentication Buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <UserCircle size={20} />
                  <span>{user?.firstName || t.welcome}</span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50`}>
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <User size={18} />
                        <span>{t.profile}</span>
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setShowUserMenu(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <BookOpen size={18} />
                        <span>{t.myBookings}</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <LogOut size={18} />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-semibold text-sm transition-colors px-4 py-2"
                >
                  {t.login}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
                >
                  {t.register}
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-600 hover:text-primary-700 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-6 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              {/* Language Selector Mobile */}
              <div className={`flex items-center gap-2 px-4 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Globe size={18} className="text-gray-600" />
                <select 
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="flex-1 bg-transparent font-medium text-gray-700 outline-none border-none"
                >
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              <Link
                to="/guest-booking-lookup"
                className="text-gray-700 hover:text-primary-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                {language === 'fr' ? 'Suivre ma réservation' : language === 'ar' ? 'تتبع حجزي' : 'Track Booking'}
              </Link>

              <Link
                to="/bookings"
                className="text-gray-700 hover:text-primary-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.myBookings}
              </Link>

              {/* Mobile Auth Buttons */}
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-3 text-gray-700 hover:text-primary-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>{t.profile}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 text-red-600 hover:text-red-700 font-medium py-2 px-4 rounded-lg hover:bg-red-50 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <LogOut size={18} />
                    <span>{t.logout}</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Link
                    to="/login"
                    className="text-center text-gray-700 hover:text-primary-600 font-semibold py-2.5 px-4 rounded-lg border border-gray-300 hover:border-primary-600 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/register"
                    className="text-center bg-primary-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.register}
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
