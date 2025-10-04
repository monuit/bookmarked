import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  
  // Define theme colors based on system preference
  const theme = {
    isDark: systemColorScheme === 'dark',
    colors: systemColorScheme === 'dark' ? darkColors : lightColors,
  };

  return theme;
};

// Dark mode colors following platform guidelines
const darkColors = {
  // Backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#262626',
  cardBackground: '#1A1C23',
  headerBackground: '#0D0F14',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#B8B8B8', // ~87% white
  textTertiary: '#8C8C98', // ~60% white
  textDisabled: '#545761',
  
  // Brand/Accent colors (adjusted for dark mode)
  primary: '#A18CFF', // Slightly desaturated from #8F6BFF
  primaryDark: '#8F6BFF',
  secondary: '#B075FF',
  accent: '#845CFF',
  
  // Gradient colors
  gradientStart: '#0D0F14',
  gradientEnd: '#13151B',
  primaryGradientStart: '#C4B2FF',
  primaryGradientEnd: '#8059FF',
  
  // UI Elements
  border: '#2A2D36',
  divider: '#22222C',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Status
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // Special
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Light mode colors
const lightColors = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceElevated: '#FFFFFF',
  cardBackground: '#FFFFFF',
  headerBackground: '#FFFFFF',
  
  // Text
  text: '#1D1D1D',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#CCCCCC',
  
  // Brand/Accent colors (adjusted for light mode)
  primary: '#6B46C1', // Darker version for better contrast
  primaryDark: '#5B21B6',
  secondary: '#8B5CF6',
  accent: '#7C3AED',
  
  // Gradient colors
  gradientStart: '#FFFFFF',
  gradientEnd: '#F9FAFB',
  primaryGradientStart: '#A78BFA',
  primaryGradientEnd: '#8B5CF6',
  
  // UI Elements
  border: '#E5E7EB',
  divider: '#F3F4F6',
  overlay: 'rgba(255, 255, 255, 0.9)',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Special
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export { darkColors, lightColors };