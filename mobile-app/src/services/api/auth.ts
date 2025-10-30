import apiClient from './client';
import { LoginCredentials, RegisterData, LoginResponse, User, DecodedToken } from '@/types/auth';
import jwtDecode from 'jwt-decode';

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response;
  } catch (error: any) {
    if (error.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.status === 400) {
      throw new Error('Invalid request data');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Unable to connect to server');
    }
  }
};

export const register = async (data: RegisterData): Promise<void> => {
  try {
    await apiClient.post('/auth/register', data);
  } catch (error: any) {
    if (error.status === 409) {
      throw new Error('Email already registered');
    } else if (error.status === 400) {
      throw new Error('Invalid request data');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Unable to connect to server');
    }
  }
};

export const getCurrentUser = async (userId: number): Promise<User> => {
  // Since backend doesn't expose a user detail endpoint, return minimal user data
  // In a real app, this would fetch from an API endpoint
  // For now, return a minimal User object with the provided userId
  return Promise.resolve({
    id: userId,
    email: '',
    name: '',
    role: '',
  });
};