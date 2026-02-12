import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';
import { Eye, EyeOff, Compass, ChevronLeft, ChevronRight, MapPin, Mountain, Tent, Building2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t.auth.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.auth.emailInvalid;
    }

    if (!formData.password) {
      newErrors.password = t.auth.passwordRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setMessage({ type: 'success', text: t.auth.loginSuccess });
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setMessage({ type: 'error', text: result.message || t.auth.loginError });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.auth.serverError });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="h-screen flex overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50 relative">
        {/* Back Button - Absolute positioned */}
        <Link to="/" className={`absolute ${isRTL ? 'right-6 sm:right-8' : 'left-6 sm:left-8'} top-6 sm:top-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <span>{language === 'fr' ? 'Menu' : language === 'ar' ? 'القائمة' : 'Menu'}</span>
        </Link>

        {/* Scrollable Form Container - Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <div className="w-full mt-12 sm:mt-16">
          {/* Logo/Header */}
          <div className={`mb-4 sm:mb-5 ${isRTL ? 'text-right flex flex-col items-end' : 'text-left flex flex-col items-start'}`}>
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-700 rounded-xl">
                <Compass className="text-white" size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {language === 'fr' ? 'Rejoindre Explore' : language === 'ar' ? 'انضم إلى Explore' : 'Join Explore'}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-500">
              {language === 'fr' ? 'C\'est le début de quelque chose de bon.' : language === 'ar' ? 'هذه بداية شيء جيد.' : 'This is the start of something good.'}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4 sm:mb-5">
            <button className="flex-1 bg-primary-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all">
              {t.auth.loginButton}
            </button>
            <Link to="/register" className="flex-1 bg-white text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-100 transition-all text-center">
              {language === 'fr' ? 'Inscription' : language === 'ar' ? 'تسجيل' : 'Register'}
            </Link>
          </div>

          {/* Social Login */}
          <div className="mb-4 sm:mb-5">
            <div className="flex items-center gap-3 sm:gap-4 justify-center mb-4 sm:mb-5">
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-all shadow-sm">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-all shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000"/>
                </svg>
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-all shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">{language === 'fr' ? 'ou' : language === 'ar' ? 'أو' : 'or'}</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div>
          {/* Message Alert */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Email */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.auth.email}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t.auth.emailPlaceholder}
                className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-3 sm:px-4 py-2.5 text-sm sm:text-base border ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent transition-all`}
              />
              {errors.email && (
                <p className={`mt-2 text-xs text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t.auth.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.auth.passwordPlaceholder}
                  className={`w-full ${isRTL ? 'text-right pr-3 sm:pr-4 pl-10 sm:pl-12' : 'text-left pl-3 sm:pl-4 pr-10 sm:pr-12'} py-2.5 text-sm sm:text-base border ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className={`mt-2 text-xs text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className={`w-4 h-4 text-primary-700 border-gray-300 rounded focus:ring-primary-700 ${isRTL ? 'ml-2' : 'mr-2'}`}
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700 select-none cursor-pointer">
                {t.auth.rememberMe}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-700 text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-primary-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {language === 'fr' ? 'Chargement...' : language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </span>
              ) : (
                language === 'fr' ? 'Commencer votre aventure' : language === 'ar' ? 'ابدأ مغامرتك' : 'Start your adventure'
              )}
            </button>
          </form>
          </div>
          </div>
        </div>
      </div>

      {/* Right Side - Beautiful Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-primary-800/30 to-primary-700/40"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col items-center justify-center text-white px-12 z-10">
          {/* Destination Badge */}
          <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-semibold text-gray-700">
                {language === 'fr' ? 'Destination Tendance' : language === 'ar' ? 'وجهة رائجة' : 'Trending Destination'}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {language === 'fr' ? 'Parcs Nationaux' : language === 'ar' ? 'المتنزهات الوطنية' : 'National Parks'}
            </p>
            <p className="text-xs text-gray-600">
              {language === 'fr' ? 'Île de Vancouver, C.-B.' : language === 'ar' ? 'جزيرة فانكوفر' : 'Vancouver Island, BC'}
            </p>
          </div>

          {/* Main Text */}
          <div className={`text-center max-w-2xl ${isRTL ? 'rtl' : 'ltr'}`}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              {language === 'fr' ? (
                <>Votre prochaine aventure commence <span className="italic font-serif">ici</span></>
              ) : language === 'ar' ? (
                <>مغامرتك القادمة تبدأ <span className="italic font-serif">هنا</span></>
              ) : (
                <>Your next adventure starts <span className="italic font-serif">here</span></>
              )}
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-8 sm:mb-12">
              {language === 'fr' 
                ? 'Découvrez les meilleurs hôtels, vols et voyages pour vos prochaines vacances.' 
                : language === 'ar' 
                ? 'اكتشف أفضل الفنادق والرحلات والسفر لعطلتك القادمة.' 
                : 'Discover the best hotels, flights and travel for your next vacation.'}
            </p>

            {/* Destination Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium border border-white/20 flex items-center gap-2">
                <MapPin size={16} />
                {language === 'fr' ? 'Plages' : language === 'ar' ? 'الشواطئ' : 'Beaches'}
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium border border-white/20 flex items-center gap-2">
                <Mountain size={16} />
                {language === 'fr' ? 'Montagnes' : language === 'ar' ? 'الجبال' : 'Mountains'}
              </span>
              <span className="px-4 py-2 bg-primary-600 backdrop-blur-md rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                <Tent size={16} />
                {language === 'fr' ? 'Camping' : language === 'ar' ? 'التخييم' : 'Camping'}
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium border border-white/20 flex items-center gap-2">
                <Building2 size={16} />
                {language === 'fr' ? 'Villes' : language === 'ar' ? 'المدن' : 'Cities'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
