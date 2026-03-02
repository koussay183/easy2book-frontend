import React from 'react';
import logo from '../assets/images/logo.png';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <img
          src={logo}
          alt="Easy2Book"
          className="w-28 h-auto object-contain mb-6"
        />
        <div className="flex items-end gap-1.5">
          <span
            className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '0.7s' }}
          />
          <span
            className="w-2.5 h-2.5 bg-secondary-500 rounded-full animate-bounce"
            style={{ animationDelay: '120ms', animationDuration: '0.7s' }}
          />
          <span
            className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce"
            style={{ animationDelay: '240ms', animationDuration: '0.7s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Loader;
