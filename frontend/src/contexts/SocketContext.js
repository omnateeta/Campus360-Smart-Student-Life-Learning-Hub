import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        // Join user room for personalized notifications
        newSocket.emit('join-user-room', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      // Listen for real-time events
      newSocket.on('task-completed', (data) => {
        toast.success(`Task completed! +${data.pointsAwarded} points`);
        if (data.levelUp) {
          toast.success(`🎉 Level up! You're now level ${data.newLevel}!`, {
            duration: 5000,
          });
        }
        if (data.badges && data.badges.length > 0) {
          data.badges.forEach(badge => {
            toast.success(`🏆 New badge: ${badge.name}!`, {
              duration: 5000,
            });
          });
        }
      });

      newSocket.on('timer-started', (data) => {
        toast.success('Timer started!');
      });

      newSocket.on('timer-completed', (data) => {
        toast.success(`Pomodoro completed! +${data.pointsAwarded} points`);
      });

      newSocket.on('study-reminder', (data) => {
        toast(`📚 ${data.message}`, {
          icon: '⏰',
          duration: 6000,
        });
      });

      newSocket.on('break-reminder', (data) => {
        toast(`☕ ${data.message}`, {
          icon: '💤',
          duration: 6000,
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
