export const lightTheme = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  success: '#059669',
  successLight: '#ECFDF5',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
};

export const darkTheme: typeof lightTheme = {
  background: '#111827',
  surface: '#1F2937',
  surfaceSecondary: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  border: '#374151',
  primary: '#6366F1',
  primaryLight: '#1E1B4B',
  success: '#10B981',
  successLight: '#064E3B',
  danger: '#F87171',
  dangerLight: '#7F1D1D',
  warning: '#FBBF24',
  warningLight: '#78350F',
};

export type Theme = typeof lightTheme;
