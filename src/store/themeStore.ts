import { create } from 'zustand';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  border: string;
  canvas: string;
  canvasText: string;
  success: string;
  error: string;
  warning: string;
}

export interface ThemeState {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  getColors: () => ThemeColors;
}

const LIGHT_COLORS: ThemeColors = {
  background: '#ffffff',
  surface: '#f5f5f5',
  surfaceLight: '#efefef',
  text: '#1a1a1a',
  textSecondary: '#666666',
  primary: '#6366f1',
  primaryLight: '#818cf8',
  secondary: '#ec4899',
  border: '#e5e7eb',
  canvas: '#ffffff',
  canvasText: '#000000',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

const DARK_COLORS: ThemeColors = {
  background: '#0f0f1e',
  surface: '#1a1a2e',
  surfaceLight: '#252541',
  text: '#ffffff',
  textSecondary: '#a0aec0',
  primary: '#818cf8',
  primaryLight: '#a5b4fc',
  secondary: '#f472b6',
  border: '#404060',
  canvas: '#0a0a1a',
  canvasText: '#ffffff',
  success: '#34d399',
  error: '#f87171',
  warning: '#fbbf24',
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  colors: DARK_COLORS,

  setTheme: (theme) => {
    const colors = theme === 'light' ? LIGHT_COLORS : DARK_COLORS;
    set({ theme, colors });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      const newColors = newTheme === 'light' ? LIGHT_COLORS : DARK_COLORS;
      return { theme: newTheme, colors: newColors };
    });
  },

  getColors: function () {
    return this.colors;
  },
}));
