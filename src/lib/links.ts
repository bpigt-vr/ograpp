import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';

/**
 * Opens the artist's website in the in-app browser (keeps fans inside the
 * brand) and falls back to the system browser when that is unavailable.
 */
export async function openExternal(url: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await Linking.openURL(url);
      return;
    }
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      toolbarColor: '#0B0A09',
      controlsColor: '#F2610C',
      enableBarCollapsing: true,
      showTitle: true,
    });
  } catch {
    try {
      await Linking.openURL(url);
    } catch {
      // Nothing else we can do — callers surface their own error state.
    }
  }
}

export async function openEmail(address: string, subject?: string): Promise<void> {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  await Linking.openURL(`mailto:${address}${query}`).catch(() => undefined);
}
