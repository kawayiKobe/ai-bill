import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUiStore } from '../stores/uiStore';

const ICON_MAP = {
  success: 'checkmark-circle' as const,
  error: 'close-circle' as const,
  info: 'information-circle' as const,
};

const COLOR_MAP = {
  success: '#059669',
  error: '#EF4444',
  info: '#4F46E5',
};

export default function Toast() {
  const toast = useUiStore((s) => s.toast);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
        ]).start();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Ionicons name={ICON_MAP[toast.type]} size={20} color={COLOR_MAP[toast.type]} />
      <Text style={styles.text}>{toast.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 9999,
  },
  text: { fontSize: 14, fontWeight: '500', color: '#111827', flex: 1 },
});
