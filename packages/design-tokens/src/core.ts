import { ThemeContract, ThemeColors } from './theme-contract';
import { glassTokens } from './glass';

// 1. PRIMITIVE PALETTE (Based on your provided snippets)
export const coreTokens = {
  coral: {
    500: '#FF6B6B',  // This is your primary brand color
    dusk: '#FF7A7A',
  },
  gold: {
    500: '#F9A826',
    dusk: '#FBBF24',
  },
  slate: { 
    700: '#344966',
    900: '#111827' // Added for dusk background consistency
  },
  surface: {
    day: '#FFFFFF',
    dusk: '#111827', // Dark mode background
  },
  text: {
    day: {
      primary: '#111827',
      secondary: '#4B5563',
    },
    dusk: {
      primary: '#E5E7EB',
      secondary: '#9CA3AF',
    },
  },
} as const;

// 2. THEME RESOLVERS
// These map the raw tokens above to the semantic names your UI components expect.

const lightColors: ThemeColors = {
  onPrimary: '#ffffff',
  primary: coreTokens.coral[500], // Should be #FF6B6B
  surface: coreTokens.surface.day, // Card backgrounds
  background: coreTokens.surface.day, // Screen background
  text: {
    primary: coreTokens.text.day.primary,
    secondary: coreTokens.text.day.secondary,
  }
};

const darkColors: ThemeColors = {
  onPrimary: '#ffffff',
  primary: coreTokens.coral.dusk,
  surface: coreTokens.surface.dusk,
  background: coreTokens.surface.dusk,
  text: {
    primary: coreTokens.text.dusk.primary,
    secondary: coreTokens.text.dusk.secondary,
  }
};

// 3. EXPORT THEMES
// This is the object your _layout.tsx is trying to read (themes.light)
export const themes: Record<'light' | 'dark', ThemeContract> = {
  light: {
    mode: 'light',
    colors: lightColors,
    glass: glassTokens.light,
  },
  dark: {
    mode: 'dark',
    colors: darkColors,
    glass: glassTokens.dark,
  },
};
