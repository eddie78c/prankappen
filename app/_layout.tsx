import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { PrankProvider } from '../contexts/PrankContext';
import AnimatedSplash from '../components/AnimatedSplash';
import PinInput from '../components/PinInput';

function AuthenticatedApp() {
  const { isAuthenticated, authenticate } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showPinError, setShowPinError] = useState(false);

  const handlePinSubmit = (pin: string) => {
    const success = authenticate(pin);
    if (!success) {
      setShowPinError(true);
      setTimeout(() => setShowPinError(false), 2000);
    }
  };

  if (showSplash) {
    return (
      <AnimatedSplash 
        onAnimationComplete={() => setShowSplash(false)} 
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <PinInput
        onSubmit={handlePinSubmit}
        showError={showPinError}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <>
        <ThemeProvider>
          <LanguageProvider>
            <PrankProvider>
              <AuthProvider>
                <AuthenticatedApp />
              </AuthProvider>
            </PrankProvider>
          </LanguageProvider>
        </ThemeProvider>
        <StatusBar style="auto" />
      </>
    </GestureHandlerRootView>
  );
}