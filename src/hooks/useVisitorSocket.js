import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

/**
 * useVisitorSocket — lightweight hook for public pages.
 * Connects to Socket.IO and announces page presence so the admin
 * dashboard can show the active visitor count in real-time.
 * Does NOT track any personal data.
 */
const useVisitorSocket = () => {
  const socketRef = useRef(null);
  const location  = useLocation();

  useEffect(() => {
    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 3000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('visitor_announce', { page: window.location.pathname });
    });

    return () => {
      socket.disconnect();
    };
  }, []); // connect once

  // Emit page change on route navigation
  useEffect(() => {
    const s = socketRef.current;
    if (s?.connected) {
      s.emit('visitor_page_change', { page: location.pathname });
    }
  }, [location.pathname]);
};

export default useVisitorSocket;
