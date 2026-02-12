import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import logo from '../assets/images/logo.png';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <footer className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-400 via-white to-secondary-400"></div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-6 inline-block group">
              <img 
                src={logo} 
                alt="Easy2Book" 
                className="w-48 h-auto object-contain transform group-hover:scale-105 transition-transform duration-300 bg-white p-3 rounded-lg shadow-md" 
              />
            </Link>
            <p className="text-sm text-white/90 leading-relaxed mt-4">
              {t.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg flex items-center">
              <span className={`w-1 h-6 bg-white ${isRTL ? 'ml-2' : 'mr-2'}`}></span>
              {t.footer.quickLinks.title}
            </h3>
            <div className="flex flex-col gap-2">
              <Link 
                to="/" 
                className={`text-white/80 hover:text-white transition-colors ${isRTL ? 'hover:translate-x-1' : 'hover:-translate-x-1'} transform duration-200 inline-block`}
              >
                {t.footer.quickLinks.home}
              </Link>
              <Link 
                to="/hotels" 
                className={`text-white/80 hover:text-white transition-colors ${isRTL ? 'hover:translate-x-1' : 'hover:-translate-x-1'} transform duration-200 inline-block`}
              >
                {t.footer.quickLinks.hotels}
              </Link>
              <Link 
                to="/omra" 
                className={`text-white/80 hover:text-white transition-colors ${isRTL ? 'hover:translate-x-1' : 'hover:-translate-x-1'} transform duration-200 inline-block`}
              >
                {t.footer.quickLinks.omra}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg flex items-center">
              <span className={`w-1 h-6 bg-white ${isRTL ? 'ml-2' : 'mr-2'}`}></span>
              {t.footer.contact.title}
            </h3>
            <div className="flex flex-col gap-3">
              <a 
                href="tel:+216XXXXXXXX" 
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
              >
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Phone size={18} className="text-white" />
                </div>
                <span>+216 XX XXX XXX</span>
              </a>
              <a 
                href="mailto:info@easy2book.tn" 
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
              >
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Mail size={18} className="text-white" />
                </div>
                <span>info@easy2book.tn</span>
              </a>
              <div className="flex items-center gap-3 text-white/80">
                <div className="bg-white/20 p-2 rounded-lg">
                  <MapPin size={18} className="text-white" />
                </div>
                <span>{t.footer.contact.location}</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg flex items-center">
              <span className={`w-1 h-6 bg-white ${isRTL ? 'ml-2' : 'mr-2'}`}></span>
              {t.footer.social.title}
            </h3>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="bg-white/20 text-white p-3 rounded-lg hover:bg-white hover:text-primary-600 hover:scale-110 transition-all duration-300 group"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="bg-white/20 text-white p-3 rounded-lg hover:bg-white hover:text-primary-600 hover:scale-110 transition-all duration-300 group"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="bg-white/20 text-white p-3 rounded-lg hover:bg-white hover:text-primary-600 hover:scale-110 transition-all duration-300 group"
              >
                <Linkedin size={20} />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-sm text-white/90 mb-2">{t.footer.newsletter.title}</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder={t.footer.newsletter.placeholder} 
                  className={`flex-1 px-3 py-2 rounded-lg bg-white/90 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}
                />
                <button className="bg-white text-primary-600 hover:bg-white/90 px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                  {t.footer.newsletter.button}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-10 pt-6 text-center">
          <p className="text-sm text-white/90">
            &copy; 2025 <span className="text-white font-semibold">Easy2Book</span>. {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
