import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Bell, Menu, User, LogOut, BookOpen, UserCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../locales/translations';

const LandingHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const { language, changeLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const t = translations[language].header;
  const isRTL = language === 'ar';
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

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
    <header className={`${isLandingPage ? 'absolute bg-transparent' : 'fixed bg-primary-700 shadow-md'} top-0 left-0 right-0 z-20`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        {/* Main Header */}
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className={`flex items-center ${isLandingPage ? 'bg-white' : 'bg-white'} rounded-xl p-2 shadow-md hover:shadow-lg transition-shadow`}>
              <img 
                src={logo} 
                alt="Easy2Book" 
                className="h-8 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            {/* Language Selector */}
            <div className={`hidden md:flex items-center gap-2 text-sm ${isLandingPage ? 'text-white' : 'text-white'}`}>
              <Globe size={18} />
              <select 
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className={`bg-transparent font-medium cursor-pointer hover:text-secondary-400 transition-colors outline-none`}
              >
                <option value="fr" className="text-gray-900">Français</option>
                <option value="ar" className="text-gray-900">العربية</option>
                <option value="en" className="text-gray-900">English</option>
              </select>
            </div>

            {/* My Bookings */}
            <Link to="/bookings" className={`hidden md:block text-sm ${isLandingPage ? 'text-white hover:text-secondary-400' : 'text-white hover:text-secondary-400'} font-medium transition-colors`}>
              {t.myBookings}
            </Link>

            {/* Authentication Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:block relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 ${isLandingPage ? 'bg-white/95 text-primary-700' : 'bg-white text-primary-700'} backdrop-blur-md px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg`}
                >
                  <UserCircle size={20} />
                  <span>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || t.welcome}</span>
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
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className={`${isLandingPage ? 'text-white hover:text-secondary-300' : 'text-white hover:text-secondary-300'} font-semibold text-sm transition-colors px-4 py-2`}
                >
                  {t.login}
                </Link>
                <Link
                  to="/register"
                  className={`${isLandingPage ? 'bg-white text-primary-700 hover:bg-secondary-400 hover:text-primary-700' : 'bg-white text-primary-700 hover:bg-secondary-400'} px-6 py-2.5 rounded-lg font-bold transition-all shadow-md hover:shadow-xl`}
                >
                  {t.register}
                </Link>
              </div>
            )}
            
            {/* Mobile Menu */}
            <button
              onClick={onMenuClick}
              className={`lg:hidden ${isLandingPage ? 'text-white hover:bg-white/10' : 'text-white hover:bg-white/10'} p-2 rounded-lg transition-colors`}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
