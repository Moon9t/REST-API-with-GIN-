import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <PaperProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}