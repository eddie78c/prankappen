import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePrank } from './PrankContext';

interface AuthContextType {
  isAuthenticated: boolean;
  authenticate: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock PIN - in real app this would be encrypted and stored securely
const MOCK_PIN = '1234';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { settings } = usePrank();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedTimestamp = await AsyncStorage.getItem('auth_timestamp');
        if (storedTimestamp) {
          const timestamp = parseInt(storedTimestamp);
          const now = Date.now();
          const tenMinutes = 10 * 60 * 1000;
          if (now - timestamp < tenMinutes) {
            setIsAuthenticated(true);
          } else {
            await AsyncStorage.removeItem('auth_timestamp');
          }
        }
      } catch (error) {
        console.log('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  const authenticate = async (pin: string): Promise<boolean> => {
    if (!settings.pin) {
      // No PIN set, authenticate automatically
      setIsAuthenticated(true);
      try {
        await AsyncStorage.setItem('auth_timestamp', Date.now().toString());
      } catch (error) {
        console.log('Error storing auth timestamp:', error);
      }
      return true;
    }
    if (pin === settings.pin) {
      setIsAuthenticated(true);
      try {
        await AsyncStorage.setItem('auth_timestamp', Date.now().toString());
      } catch (error) {
        console.log('Error storing auth timestamp:', error);
      }
      return true;
    }
    return false;
  };

  const logout = async () => {
    setIsAuthenticated(false);
    try {
      await AsyncStorage.removeItem('auth_timestamp');
    } catch (error) {
      console.log('Error removing auth timestamp:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      authenticate,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}