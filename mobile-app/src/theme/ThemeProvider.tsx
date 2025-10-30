import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing } from './spacing';
import { typography } from './typography';

type ThemePreference = 'system' | 'light' | 'dark';

type AppTheme = typeof MD3LightTheme & {
  spacing: typeof spacing;
  typography: typeof typography;
};

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = (): AppTheme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context.theme;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const colorScheme = useColorScheme();
  const { theme: material3Theme } = useMaterial3Theme();

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem('themePreference');
        if (storedPreference && ['system', 'light', 'dark'].includes(storedPreference)) {
          setThemePreferenceState(storedPreference as ThemePreference);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  const saveThemePreference = async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem('themePreference', preference);
      setThemePreferenceState(preference);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const isDark = themePreference === 'system' ? colorScheme === 'dark' : themePreference === 'dark';

  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  const theme: AppTheme = {
    ...baseTheme,
    colors: material3Theme.colors,
    spacing,
    typography,
  };

  const toggleTheme = () => {
    const newPreference: ThemePreference = isDark ? 'light' : 'dark';
    saveThemePreference(newPreference);
  };

  const setThemePreference = (preference: ThemePreference) => {
    saveThemePreference(preference);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};