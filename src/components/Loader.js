import React from 'react';
import logo from '../assets/images/logo.png';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Cute Logo with Bounce Animation */}
        <div className="mb-6 animate-bounce">
          <img 
            src={logo}
            alt="Easy2Book" 
            className="w-32 h-auto object-contain mx-auto"
          />
        </div>

        {/* Cute Bouncing Dots */}
        <div className="flex justify-center items-end gap-2 mb-4 h-8">
          <div 
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '0.6s' }}
          ></div>
          <div 
            className="w-3 h-3 bg-secondary-500 rounded-full animate-bounce"
            style={{ animationDelay: '100ms', animationDuration: '0.6s' }}
          ></div>
          <div 
            className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"
            style={{ animationDelay: '200ms', animationDuration: '0.6s' }}
          ></div>
        </div>
        
        {/* Cute Loading Text */}
        <p className="text-primary-600 text-sm font-medium animate-pulse">
          جاري التحميل... ✨
        </p>
      </div>
    </div>
  );
};

export default Loader;
