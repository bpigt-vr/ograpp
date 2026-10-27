import {
  Anton_400Regular,
} from '@expo-google-fonts/anton';
import {
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/Toast';
import { useBootstrap } from '@/features/app/useBootstrap';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useCommunityStore } from '@/features/community/useCommunityStore';
import { useJournalStore } from '@/features/journal/useJournalStore';
import { PlayerProvider } from '@/features/music/PlayerProvider';
import { useSettingsStore } from '@/features/settings/useSettingsStore';
import { ThemeProvider, useTheme } from '@/theme';

void SplashScreen.preventAutoHideAsync();

function AppShell() {
  const theme = useTheme();
  const { ready } = useBootstrap();
  const fontsLoaded = useFontsReady();
  const authHydrated = useAuthStore((state) => state.hydrated);
  const journalHydrated = useJournalStore((state) => state.hydrated);
  const communityHydrated = useCommunityStore((state) => state.hydrated);
  const hydrated = authHydrated && journalHydrated && communityHydrated;

  useEffect(() => {
    if (fontsLoaded && ready && hydrated) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, ready, hydrated]);

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="player"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="auth" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}

function useFontsReady(): boolean {
  const [loaded] = useFonts({
    Anton_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
  });
  return loaded;
}

export default function RootLayout() {
  const preference = useSettingsStore((state) => state.themePreference);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider preference={preference}>
          <ToastProvider>
            <PlayerProvider>
              <AppShell />
            </PlayerProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
