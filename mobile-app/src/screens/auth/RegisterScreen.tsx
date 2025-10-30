import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Surface, TextInput, Button, HelperText, Text, ActivityIndicator } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { registerSchema } from '@/utils/validation';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

const RegisterScreen: React.FC = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const { register: authRegister } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm: '',
    },
  });

  const password = watch('password');

  const getPasswordStrength = (password: string): { level: number; label: string } => {
    if (password.length < 8) return { level: 0, label: 'Weak' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) {
      return { level: 2, label: 'Strong' };
    }
    return { level: 1, label: 'Medium' };
  };

  const passwordStrength = getPasswordStrength(password || '');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await authRegister(data);
    } catch (error: any) {
      // Error handling is done in AuthContext, but we can add additional UI feedback if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.l,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Surface
          style={{
            padding: spacing.l,
            elevation: 4,
            borderRadius: 8,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Text
            variant="headlineMedium"
            style={{
              textAlign: 'center',
              marginBottom: spacing.xl,
              color: theme.colors.onSurface,
            }}
          >
            Create Account
          </Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Name"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                autoComplete="name"
                autoCapitalize="words"
                error={!!errors.name}
                style={{ marginBottom: spacing.s }}
                accessibilityLabel="Name input field"
                accessibilityHint="Enter your full name"
              />
            )}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name?.message}
          </HelperText>

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
                style={{ marginBottom: spacing.s }}
                accessibilityLabel="Email input field"
                accessibilityHint="Enter your email address"
              />
            )}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email?.message}
          </HelperText>

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
                autoComplete="password-new"
                error={!!errors.password}
                style={{ marginBottom: spacing.s }}
                accessibilityLabel="Password input field"
                accessibilityHint="Enter a secure password with at least 8 characters"
              />
            )}
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password?.message}
          </HelperText>
          {password && (
            <View style={{ marginBottom: spacing.s }}>
              <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                Password strength: {passwordStrength.label}
              </Text>
              <View
                style={{
                  height: 4,
                  backgroundColor: theme.colors.outline,
                  borderRadius: 2,
                  marginTop: 4,
                }}
              >
                <View
                  style={{
                    height: 4,
                    width: `${(passwordStrength.level + 1) * 33}%`,
                    backgroundColor:
                      passwordStrength.level === 0
                        ? theme.colors.error
                        : passwordStrength.level === 1
                        ? theme.colors.tertiary
                        : theme.colors.primary,
                    borderRadius: 2,
                  }}
                />
              </View>
            </View>
          )}

          <Controller
            control={control}
            name="confirm"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                secureTextEntry
                error={!!errors.confirm}
                style={{ marginBottom: spacing.s }}
                accessibilityLabel="Confirm password input field"
                accessibilityHint="Re-enter your password to confirm"
              />
            )}
          />
          <HelperText type="error" visible={!!errors.confirm}>
            {errors.confirm?.message}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            style={{ marginTop: spacing.m, marginBottom: spacing.m }}
            accessibilityLabel="Register button"
            accessibilityHint="Tap to create your account"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>

          <Button
            mode="text"
            onPress={() => router.push('/auth/login')}
            style={{ marginTop: spacing.s }}
            accessibilityLabel="Login link"
            accessibilityHint="Navigate to login screen if you already have an account"
          >
            Already have an account? Login
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;