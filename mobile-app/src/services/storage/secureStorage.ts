import * as SecureStore from 'expo-secure-store';

export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync('auth_token', token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('auth_token');
  } catch (error) {
    console.error('Error deleting token:', error);
  }
};

export const saveBiometricCredentials = async (email: string, password: string): Promise<void> => {
  try {
    const credentials = JSON.stringify({ email, password });
    await SecureStore.setItemAsync('biometric_credentials', credentials);
  } catch (error) {
    console.error('Error saving biometric credentials:', error);
  }
};

export const getBiometricCredentials = async (): Promise<{ email: string; password: string } | null> => {
  try {
    const credentials = await SecureStore.getItemAsync('biometric_credentials');
    if (credentials) {
      return JSON.parse(credentials);
    }
    return null;
  } catch (error) {
    console.error('Error getting biometric credentials:', error);
    return null;
  }
};

export const deleteBiometricCredentials = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('biometric_credentials');
  } catch (error) {
    console.error('Error deleting biometric credentials:', error);
  }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const credentials = await SecureStore.getItemAsync('biometric_credentials');
    return credentials !== null;
  } catch (error) {
    console.error('Error checking biometric enabled:', error);
    return false;
  }
};