import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Surface, Text, Button, Icon, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { isBiometricSupported, getBiometricType } from '@/services/biometric/biometricAuth';
import { spacing } from '@/theme/spacing';

const BiometricSetupScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { email, password } = useLocalSearchParams<{ email: string; password: string }>();
  const auth = useAuth();

  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | 'iris' | 'none'>('none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBiometric = async () => {
      const supported = await isBiometricSupported();
      setBiometricSupported(supported);
      if (supported) {
        const type = await getBiometricType();
        setBiometricType(type);
      }
    };
    checkBiometric();
  }, []);

  const handleEnableBiometric = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Credentials not available. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      await auth.enableBiometric(email, password);
      Alert.alert('Success', 'Biometric login enabled!');
      router.replace('/(drawer)/(tabs)');
    } catch (error) {
      // Error already handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(drawer)/(tabs)');
  };

  const getIconName = () => {
    switch (biometricType) {
      case 'fingerprint':
        return 'fingerprint';
      case 'facial':
        return 'face-recognition';
      case 'iris':
        return 'eye';
      default:
        return 'lock';
    }
  };

  const getBiometricName = () => {
    switch (biometricType) {
      case 'fingerprint':
        return 'Touch ID';
      case 'facial':
        return 'Face ID';
      case 'iris':
        return 'Iris';
      default:
        return 'Biometric';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.surface} elevation={4}>
        <View style={styles.content}>
          <Icon
            source={getIconName()}
            size={80}
            color={theme.colors.primary}
            accessibilityLabel={`${getBiometricName()} icon`}
          />
          <Text variant="headlineMedium" style={styles.headline}>
            Enable {getBiometricName()} Login
          </Text>
          <Text variant="bodyMedium" style={styles.body}>
            Your credentials will be securely stored.{'\n'}
            Use {getBiometricName()} to login quickly.{'\n'}
            You can disable this anytime in settings.
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleEnableBiometric}
              loading={loading}
              disabled={!biometricSupported}
              style={styles.button}
              accessibilityLabel={`Enable ${getBiometricName()} login`}
              accessibilityHint="This will store your credentials securely and allow quick login with biometric authentication"
            >
              Enable {getBiometricName()} Login
            </Button>
            <Button
              mode="text"
              onPress={handleSkip}
              style={styles.button}
              accessibilityLabel="Skip biometric setup"
              accessibilityHint="Continue to the app without enabling biometric login"
            >
              Skip for now
            </Button>
          </View>
          {!biometricSupported && (
            <Text variant="bodySmall" style={styles.unsupportedText}>
              Biometric authentication is not supported on this device.
            </Text>
          )}
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  surface: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  headline: {
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  body: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    marginVertical: spacing.xs,
  },
  unsupportedText: {
    textAlign: 'center',
    marginTop: spacing.md,
    color: 'red',
  },
});

export default BiometricSetupScreen;