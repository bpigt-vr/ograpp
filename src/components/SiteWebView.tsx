import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Surfaces';
import { openExternal } from '@/lib/links';
import { useTheme } from '@/theme';

/**
 * Wix only serves the music player and store as web pages, so the app embeds
 * them in a real WebView (top-level navigation, so X-Frame-Options does not
 * apply). Native features — background audio, mini player, offline downloads,
 * cart — run on the in-app catalogue and are documented as such in the UI.
 */
export function SiteWebView({
  url,
  title,
  note,
  height = 520,
  fill = false,
}: {
  url: string;
  title: string;
  note?: string;
  height?: number;
  fill?: boolean;
}) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  if (Platform.OS === 'web') {
    return (
      <Card style={{ gap: 10 }}>
        <AppText variant="subheading">{title}</AppText>
        <AppText variant="small" color="textMuted">
          {note ?? 'Open the official page in your browser.'}
        </AppText>
        <AppText variant="small" color="textFaint">
          Embedded pages are disabled on the web preview because the site cannot be framed in a
          browser tab. On iOS and Android this screen loads the live page.
        </AppText>
        <Button
          label="Open on the website"
          icon="open-outline"
          size="sm"
          onPress={() => void openExternal(url)}
        />
      </Card>
    );
  }

  return (
    <View
      style={[
        styles.shell,
        {
          flex: fill ? 1 : undefined,
          height: fill ? undefined : height,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      <View style={[styles.bar, { borderBottomColor: theme.colors.border }]}>
        <Ionicons name="globe-outline" size={15} color={theme.colors.textMuted} />
        <AppText variant="smallMedium" numberOfLines={1} style={{ flex: 1 }}>
          {title}
        </AppText>
        <Button
          label="Browser"
          size="sm"
          variant="ghost"
          icon="open-outline"
          onPress={() => void openExternal(url)}
        />
      </View>
      <View style={{ flex: 1 }}>
        {failed ? (
          <View style={styles.fallback}>
            <AppText variant="subheading">The page did not load</AppText>
            <AppText variant="small" color="textMuted" align="center">
              Check your connection, then retry or continue in your browser.
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                label="Retry"
                size="sm"
                icon="refresh"
                onPress={() => {
                  setFailed(false);
                  setLoading(true);
                  setReloadKey((key) => key + 1);
                }}
              />
              <Button
                label="Open in browser"
                size="sm"
                variant="ghost"
                onPress={() => void openExternal(url)}
              />
            </View>
          </View>
        ) : (
          <WebView
            key={reloadKey}
            source={{ uri: url }}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setFailed(true);
            }}
            startInLoadingState
            renderLoading={() => (
              <View style={[styles.fallback, { backgroundColor: theme.colors.surface }]}>
                <ActivityIndicator color={theme.colors.accent} />
                <AppText variant="small" color="textMuted">
                  Loading the official page…
                </AppText>
              </View>
            )}
            style={{ flex: 1, backgroundColor: theme.colors.surface, opacity: loading ? 0 : 1 }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        )}
      </View>
      {note ? (
        <View style={[styles.note, { borderTopColor: theme.colors.border }]}>
          <Ionicons name="information-circle-outline" size={14} color={theme.colors.gold} />
          <AppText variant="small" color="textFaint" style={{ flex: 1 }}>
            {note}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fallback: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  note: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
