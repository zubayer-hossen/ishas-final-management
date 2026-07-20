import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { baseApi } from '../api/baseApi';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL !== undefined
  ? import.meta.env.VITE_SOCKET_URL
  : 'http://localhost:5000';

/**
 * Maintains a Socket.IO connection on the default namespace for the
 * lifetime of an authenticated session, and reacts to `notification`
 * events by toasting them and invalidating the notification list cache
 * so the bell dropdown refetches automatically.
 */
const useNotificationSocket = () => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return undefined;

    const socket = io(SOCKET_URL || undefined, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('notification', (notification) => {
      toast(notification.title, { icon: '🔔' });
      dispatch(baseApi.util.invalidateTags([{ type: 'Notification', id: 'LIST' }]));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, dispatch]);

  return socketRef;
};

export default useNotificationSocket;
