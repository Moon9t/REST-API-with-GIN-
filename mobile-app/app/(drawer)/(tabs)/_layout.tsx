import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Tabs } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function TabLayout() {
  const auth = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const theme = useAppTheme();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [auth.isAuthenticated, auth.isLoading, router]);

  if (auth.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      {/* Add other tab screens as needed */}
    </Tabs>
  );
}