import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContract, ThemeMode, ColorScheme, themes } from '@yombri/design-tokens';
import { storage, STORAGE_KEYS } from './storage';

interface ThemeContextType {
  theme: ThemeContract;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isReady: boolean; // Exposed for splash screen handling
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setModeState] = useState<ThemeMode>('auto');
  const [isReady, setIsReady] = useState(false);

  // --- INITIAL LOAD (Parallel) ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedMode = await storage.getString(STORAGE_KEYS.THEME_MODE);
        if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto')) {
          setModeState(savedMode as ThemeMode);
        }
      } catch (e) {
        console.warn('Failed to load theme settings:', e);
      } finally {
        setIsReady(true);
      }
    };
    loadSettings();
  }, []);

  // --- DERIVED STATE ---
  const colorScheme: ColorScheme = useMemo(() => {
    if (themeMode === 'auto') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemScheme]);

  // --- ACTIONS ---
  const setThemeMode = async (mode: ThemeMode) => {
    setModeState(mode);
    await storage.setString(STORAGE_KEYS.THEME_MODE, mode);
  };

  const toggleTheme = () => {
    setThemeMode(colorScheme === 'light' ? 'dark' : 'light');
  };

  const value = useMemo(() => ({
    theme: themes[colorScheme],
    themeMode,
    colorScheme,
    setThemeMode,
    toggleTheme,
    isDark: colorScheme === 'dark',
    isReady,
  }), [colorScheme, themeMode, isReady]);

  // --- UI GATING ---
  // We return null until storage is read to prevent "Flash of Wrong Theme"
  if (!isReady) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
