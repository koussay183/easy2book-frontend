import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

const MAX_NOTIFICATIONS = 30;

const EVENT_META = {
  new_booking:            { label: 'Nouvelle réservation', color: 'emerald' },
  booking_confirmed:      { label: 'Réservation confirmée', color: 'primary' },
  booking_status_changed: { label: 'Statut modifié',        color: 'amber'  },
  user_login:             { label: 'Connexion',             color: 'sky'    }
};

/**
 * useAdminSocket — manages a Socket.IO connection for the admin dashboard.
 *
 * Returns:
 *   notifications    – array of recent events (newest first, all types)
 *   unreadCount      – number of notifications not yet seen
 *   isConnected      – whether the socket is live
 *   activeVisitors   – { count, visitors[] } real-time visitor state
 *   markAllRead      – set unreadCount to 0
 *   clearAll         – empty the notifications list
 */
const useAdminSocket = () => {
  const socketRef = useRef(null);
  const [notifications,  setNotifications]  = useState([]);
  const [unreadCount,    setUnreadCount]     = useState(0);
  const [isConnected,    setIsConnected]     = useState(false);
  const [activeVisitors, setActiveVisitors]  = useState({ count: 0, visitors: [] });

  const addNotification = useCallback((event, data) => {
    const meta = EVENT_META[event] || { label: event, color: 'gray' };
    const notification = {
      id: `${Date.now()}-${Math.random()}`,
      event,
      label: meta.label,
      color: meta.color,
      data,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
    setUnreadCount(c => c + 1);
  }, []);

  useEffect(() => {
    const socket = io(API_BASE_URL, {
      transports: ['polling'],   // WebSocket not supported on Vercel serverless
      upgrade: false,            // prevent upgrade attempt to WS
      reconnectionDelay: 3000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_admin');
    });

    socket.on('disconnect', () => setIsConnected(false));

    // Booking events
    socket.on('new_booking',            (data) => addNotification('new_booking', data));
    socket.on('booking_confirmed',      (data) => addNotification('booking_confirmed', data));
    socket.on('booking_status_changed', (data) => addNotification('booking_status_changed', data));

    // Auth events
    socket.on('user_login', (data) => addNotification('user_login', data));

    // Visitor tracking
    socket.on('visitor_count_updated', ({ count, visitors }) => {
      setActiveVisitors({ count: count || 0, visitors: visitors || [] });
    });

    return () => {
      socket.disconnect();
    };
  }, [addNotification]);

  const markAllRead = useCallback(() => setUnreadCount(0), []);
  const clearAll    = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, isConnected, activeVisitors, markAllRead, clearAll };
};

export default useAdminSocket;
