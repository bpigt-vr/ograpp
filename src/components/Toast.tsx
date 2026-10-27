import * as Haptics from 'expo-haptics';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

export type ToastTone = 'default' | 'success' | 'error' | 'reward';

type ToastMessage = { id: number; text: string; tone: ToastTone };

type ToastContextValue = {
  show: (text: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const haptics = useSettingsStore((state) => state.hapticsEnabled);
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(16));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, tone: ToastTone = 'default') => {
    setMessage({ id: Date.now(), text, tone });
  }, []);

  useEffect(() => {
    if (!message) return;
    if (timer.current) clearTimeout(timer.current);
    opacity.setValue(0);
    translateY.setValue(16);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    if (haptics && message.tone === 'reward') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    timer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 12, duration: 200, useNativeDriver: true }),
      ]).start(() => setMessage(null));
    }, 2_600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [message, opacity, translateY, haptics]);

  const value = useMemo(() => ({ show }), [show]);

  const borderColor =
    message?.tone === 'error'
      ? theme.colors.danger
      : message?.tone === 'success' || message?.tone === 'reward'
        ? theme.colors.success
        : theme.colors.border;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,
            {
              bottom: insets.bottom + 108,
              backgroundColor: theme.colors.surfaceHi,
              borderColor,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: borderColor }]} />
          <AppText variant="smallMedium" style={{ flexShrink: 1 }}>
            {message.text}
          </AppText>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
