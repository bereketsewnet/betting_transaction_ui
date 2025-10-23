import React, { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useSocket();

  useEffect(() => {
    if (isConnected) {
      console.log('Real-time notifications enabled');
    }
  }, [isConnected]);

  return <>{children}</>;
};

