import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import LandingHeader from './landing/LandingHeader';
import Sidebar from './landing/Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAgencyPage = location.pathname.startsWith('/agency');
  const isLandingPage = location.pathname === '/';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && !isAdminPage && !isAgencyPage && <LandingHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />}
      {!isAuthPage && !isAdminPage && !isAgencyPage && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
      <main className={`flex-grow ${!isLandingPage && !isAuthPage && !isAdminPage && !isAgencyPage ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!isAuthPage && !isAdminPage && !isAgencyPage && <Footer />}
    </div>
  );
};

export default Layout;
