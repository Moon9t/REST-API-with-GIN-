import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import jwtDecode from 'jwt-decode';
import { AuthContextType, AuthState, LoginCredentials, RegisterData, User, DecodedToken } from '@/types/auth';
import * as authService from '@/services/api/auth';
import { saveToken, getToken, deleteToken, saveBiometricCredentials, deleteBiometricCredentials, getBiometricCredentials, isBiometricEnabled } from '@/services/storage/secureStorage';
import { isBiometricSupported, authenticateWithBiometric } from '@/services/biometric/biometricAuth';
import { setAuthErrorCallback } from '@/services/api/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    biometricEnabled: false,
  });

  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          const decoded: DecodedToken = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            setState(prev => ({
              ...prev,
              token,
              user: { id: decoded.user_id, email: '', name: '' },
              isAuthenticated: true,
            }));
          } else {
            await deleteToken();
          }
        }
        const biometric = await isBiometricEnabled();
        setState(prev => ({ ...prev, biometricEnabled: biometric, isLoading: false }));
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    setAuthErrorCallback(logout);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await authService.login(credentials);
      await saveToken(response.token);
      const decoded: DecodedToken = jwtDecode(response.token);
      setState(prev => ({
        ...prev,
        token: response.token,
        user: { id: decoded.user_id, email: '', name: '' },
        isAuthenticated: true,
      }));
      router.replace('/(drawer)/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      await authService.register(data);
      Alert.alert('Success', 'Account created successfully');
      router.replace('/auth/login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await deleteToken();
      await deleteBiometricCredentials();
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        biometricEnabled: false,
      });
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const enableBiometric = async (email: string, password: string): Promise<void> => {
    try {
      const supported = await isBiometricSupported();
      if (!supported) {
        throw new Error('Biometric authentication is not supported on this device');
      }
      const success = await authenticateWithBiometric('Enable biometric login');
      if (success) {
        await saveBiometricCredentials(email, password);
        setState(prev => ({ ...prev, biometricEnabled: true }));
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error: any) {
      Alert.alert('Enable Biometric Failed', error.message || 'An error occurred enabling biometric login');
    }
  };

  const disableBiometric = async (): Promise<void> => {
    try {
      await deleteBiometricCredentials();
      setState(prev => ({ ...prev, biometricEnabled: false }));
    } catch (error) {
      console.error('Error disabling biometric:', error);
    }
  };

  const authenticateWithBiometric = async (): Promise<void> => {
    try {
      const success = await authenticateWithBiometric('Unlock to login');
      if (success) {
        const creds = await getBiometricCredentials();
        if (creds) {
          await login(creds);
        } else {
          throw new Error('Biometric credentials not found');
        }
      }
    } catch (error: any) {
      Alert.alert('Biometric Authentication Failed', error.message || 'An error occurred during biometric authentication');
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};