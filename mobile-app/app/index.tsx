import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function Index() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <LoadingScreen />;
  }

  if (auth.isAuthenticated) {
    return <Redirect href="/(drawer)/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}