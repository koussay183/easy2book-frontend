import React from 'react';
import { Hotel, Plane, Mountain, Calendar, X, Sparkles, Phone, User, BookOpen, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const T = {
  fr: {
    hotels: 'Hôtels', omra: 'Omra & Hajj', packages: 'Forfaits', new: 'Nouveau',
    profile: 'Mon Profil', bookings: 'Mes Réservations',
    login: 'Connexion', register: 'S\'inscrire', logout: 'Déconnexion',
    help: 'Besoin d\'aide ?', call: 'Appelez-nous',
  },
  ar: {
    hotels: 'الفنادق', omra: 'عمرة وحج', packages: 'الباقات السياحية', new: 'جديد',
    profile: 'ملفي الشخصي', bookings: 'حجوزاتي',
    login: 'تسجيل الدخول', register: 'إنشاء حساب', logout: 'تسجيل الخروج',
    help: 'هل تحتاج للمساعدة؟', call: 'اتصل بنا',
  },
  en: {
    hotels: 'Hotels', omra: 'Umrah & Hajj', packages: 'Packages', new: 'New',
    profile: 'My Profile', bookings: 'My Bookings',
    login: 'Sign In', register: 'Sign Up', logout: 'Sign Out',
    help: 'Need help?', call: 'Call us',
  }
};

const Sidebar = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const t      = T[language] || T.fr;
  const isRTL  = language === 'ar';

  // RTL: slides from left; LTR: slides from right
  const panelPos   = isRTL ? 'left-0'  : 'right-0';
  const slideHide  = isRTL ? '-translate-x-full' : 'translate-x-full';

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/');
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed ${panelPos} top-0 bottom-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : slideHide
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b border-gray-100`}>
          <img src={logo} alt="Easy2Book" className="h-7" />
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* User info or login/register */}
        {isAuthenticated && user ? (
          <div className={`px-4 py-3 border-b border-gray-100 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-9 h-9 bg-primary-700 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
            </div>
            <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : ''}`}>
              <p className="text-sm font-bold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 border-b border-gray-100 flex gap-2">
            <Link to="/login" onClick={onClose}
              className="flex-1 text-center py-2 text-sm font-semibold text-primary-700 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors">
              {t.login}
            </Link>
            <Link to="/register" onClick={onClose}
              className="flex-1 text-center py-2 text-sm font-bold text-white bg-primary-700 rounded-xl hover:bg-primary-800 transition-colors">
              {t.register}
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <NavLink to="/hotels" icon={Hotel} label={t.hotels} onClick={onClose} isRTL={isRTL} />
          <NavLink to="/omra"   icon={Mountain} label={t.omra} onClick={onClose} isRTL={isRTL} />
          <NavLink to="/packages" icon={Calendar} label={t.packages} onClick={onClose} isRTL={isRTL}
            badge={t.new} />
          <NavLink to="/flights"  icon={Plane}  label={isRTL ? 'الرحلات الجوية' : language === 'en' ? 'Flights' : 'Vols'} onClick={onClose} isRTL={isRTL} />
          <NavLink to="/attractions" icon={Sparkles}
            label={isRTL ? 'المعالم السياحية' : language === 'en' ? 'Attractions' : 'Attractions'}
            onClick={onClose} isRTL={isRTL} />

          <div className="border-t border-gray-100 my-2" />

          {isAuthenticated && (
            <>
              <NavLink to="/profile"  icon={User}     label={t.profile}   onClick={onClose} isRTL={isRTL} />
              <NavLink to="/bookings" icon={BookOpen}  label={t.bookings}  onClick={onClose} isRTL={isRTL} />
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className={`flex items-center gap-2 p-3 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Phone size={16} className="text-primary-600 flex-shrink-0" />
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-xs text-gray-500">{t.help}</p>
              <a href="tel:+21600000000" className="text-sm font-bold text-primary-700">{t.call}</a>
            </div>
          </div>

          {isAuthenticated && (
            <button onClick={handleLogout}
              className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
              <LogOut size={16} />
              {t.logout}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const NavLink = ({ to, icon: Icon, label, onClick, isRTL, badge }) => (
  <Link to={to} onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group ${isRTL ? 'flex-row-reverse' : ''}`}>
    <Icon size={18} className="text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
    <span className="font-medium text-sm">{label}</span>
    {badge && (
      <span className={`${isRTL ? 'mr-auto' : 'ml-auto'} text-xs font-bold bg-primary-700 text-white px-2 py-0.5 rounded-full`}>
        {badge}
      </span>
    )}
  </Link>
);

export default Sidebar;
