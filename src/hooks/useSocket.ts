import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/auth/AuthContext';
import { getAccessToken } from '@/api/axios';
import type { SocketNotification } from '@/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect socket if user is not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection with auth token
    const accessToken = getAccessToken();
    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Listen for transaction notifications
    socketInstance.on('transaction:new', (notification: SocketNotification) => {
      console.log('New transaction:', notification);
      
      // Show toast notification
      if (user?.role === 'admin') {
        toast(`New ${notification.data.type} transaction`, {
          icon: '🔔',
        });
      }

      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    });

    socketInstance.on('transaction:assigned', (notification: SocketNotification) => {
      console.log('Transaction assigned:', notification);

      if (user?.role === 'agent') {
        toast('New task assigned to you', {
          icon: '📋',
        });
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['agent', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
    });

    socketInstance.on('transaction:update', (notification: SocketNotification) => {
      console.log('Transaction updated:', notification);

      toast(`Transaction #${notification.data.id} updated to ${notification.data.status}`, {
        icon: '✅',
      });

      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['agent', 'tasks'] });
    });

    // Admin-specific notifications
    if (user?.role === 'admin') {
      socketInstance.on('admin_notification', (data) => {
        console.log('Admin notification:', data);
        toast(data.message || 'Admin notification', {
          icon: '⚠️',
        });
      });
    }

    // Agent-specific notifications
    if (user?.role === 'agent') {
      socketInstance.on('agent_notification', (data) => {
        console.log('Agent notification:', data);
        toast(data.message || 'Agent notification', {
          icon: '📢',
        });
      });
    }

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user?.role, queryClient]);

  return {
    socket,
    isConnected,
  };
};

