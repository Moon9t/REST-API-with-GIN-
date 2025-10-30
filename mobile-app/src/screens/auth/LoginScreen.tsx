import React from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Surface, TextInput, Button, HelperText, Text, Icon } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/spacing';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen: React.FC = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const auth = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await auth.login(data);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError(null);
    try {
      await auth.authenticateWithBiometric();
    } catch (err: any) {
      setError(err.message || 'Biometric authentication failed');
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.lg,
          backgroundColor: theme.colors.background,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Surface
          style={{
            padding: spacing.xl,
            borderRadius: theme.roundness,
            elevation: 4,
          }}
          mode="elevated"
        >
          <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              Welcome Back
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.sm }}>
              Sign in to your account
            </Text>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!errors.email}
                accessibilityLabel="Email input field"
                accessibilityHint="Enter your email address"
                style={{ marginBottom: spacing.md }}
              />
            )}
          />
          {errors.email && (
            <HelperText type="error" style={{ marginBottom: spacing.sm }}>
              {errors.email.message}
            </HelperText>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                secureTextEntry
                autoComplete="password"
                error={!!errors.password}
                accessibilityLabel="Password input field"
                accessibilityHint="Enter your password"
                style={{ marginBottom: spacing.md }}
              />
            )}
          />
          {errors.password && (
            <HelperText type="error" style={{ marginBottom: spacing.sm }}>
              {errors.password.message}
            </HelperText>
          )}

          {error && (
            <HelperText type="error" style={{ marginBottom: spacing.md }}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={{ marginBottom: spacing.md, minHeight: 44 }}
            accessibilityLabel="Login button"
            accessibilityHint="Tap to sign in with your credentials"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          {auth.biometricEnabled && (
            <Button
              mode="outlined"
              onPress={handleBiometricLogin}
              style={{ marginBottom: spacing.md, minHeight: 44 }}
              accessibilityLabel="Biometric login button"
              accessibilityHint="Tap to sign in using biometric authentication"
            >
              <Icon source="fingerprint" size={20} />
              <Text style={{ marginLeft: spacing.sm }}>Use Biometric</Text>
            </Button>
          )}

          <Button
            mode="text"
            onPress={navigateToRegister}
            style={{ minHeight: 44 }}
            accessibilityLabel="Register button"
            accessibilityHint="Tap to create a new account"
          >
            Don't have an account? Register
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;