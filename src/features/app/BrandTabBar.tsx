import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { MiniPlayer } from '@/features/music/MiniPlayer';
import { useTheme } from '@/theme';

const TABS: {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'music', label: 'Music', icon: 'musical-notes-outline', iconActive: 'musical-notes' },
  { name: 'journal', label: 'Journal', icon: 'book-outline', iconActive: 'book' },
  { name: 'store', label: 'Store', icon: 'bag-handle-outline', iconActive: 'bag-handle' },
  { name: 'community', label: 'Community', icon: 'people-outline', iconActive: 'people' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

/**
 * Custom bottom bar: compact icon + label tabs with the persistent mini player
 * stacked above them so music controls are always one tap away.
 */
export function BrandTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 6) }}>
      <MiniPlayer />
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.mode === 'dark' ? 'rgba(18,16,15,0.98)' : 'rgba(255,253,248,0.98)',
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        {TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
          const focused = routeIndex === state.index && routeIndex !== -1;
          const isProfile = tab.name === 'profile';
          return (
            <Pressable
              key={tab.name}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => {
                if (routeIndex === -1 || focused) return;
                navigateToTab(state.routes[routeIndex].key);
              }}
              onLongPress={() => {
                if (isProfile) router.push('/rewards');
              }}
              style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.65 : 1 }]}
            >
              <View
                style={[
                  styles.iconWrap,
                  focused ? { backgroundColor: theme.colors.accentSoft } : null,
                ]}
              >
                <Ionicons
                  name={focused ? tab.iconActive : tab.icon}
                  size={isProfile ? 20 : 19}
                  color={focused ? theme.colors.accent : theme.colors.textFaint}
                />
              </View>
              <AppText
                variant="label"
                numberOfLines={1}
                style={{
                  color: focused ? theme.colors.accent : theme.colors.textFaint,
                  fontSize: 9.5,
                  letterSpacing: 0.2,
                }}
              >
                {tab.label.toUpperCase()}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  iconWrap: {
    width: 40,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
