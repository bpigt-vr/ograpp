import { Asset as MediaAsset, Album, requestPermissionsAsync } from 'expo-media-library';
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

import type { Wallpaper } from '@/data/wallpapers';

export type SaveResult = { ok: boolean; error?: string };

const ALBUM_NAME = 'Overgrowth Renaissance';

async function resolveLocalUri(wallpaper: Wallpaper): Promise<string | null> {
  const asset = Asset.fromModule(wallpaper.full);
  await asset.downloadAsync();
  return asset.localUri ?? asset.uri ?? null;
}

/**
 * Saves a reward wallpaper into the phone's photo library, inside an
 * "Overgrowth Renaissance" album. iOS and Android do not allow third-party apps
 * to change the lock screen directly, so the app hands the image over and the
 * UI explains the two-tap system flow.
 *
 * Uses the SDK 58 media-library API (`Asset.create`) because the legacy
 * `saveToLibraryAsync` throws at runtime in this SDK.
 */
export async function saveWallpaper(wallpaper: Wallpaper): Promise<SaveResult> {
  if (Platform.OS === 'web') {
    return { ok: false, error: 'Open the app on your phone to save wallpapers.' };
  }
  try {
    const uri = await resolveLocalUri(wallpaper);
    if (!uri) return { ok: false, error: 'The wallpaper file could not be prepared.' };

    const permission = await requestPermissionsAsync();
    if (!permission.granted) {
      return {
        ok: false,
        error: 'Photo access is needed to save the wallpaper. Enable it in system settings.',
      };
    }

    const asset = await MediaAsset.create(uri);
    try {
      const existing = await Album.get(ALBUM_NAME);
      if (existing) {
        await existing.add(asset);
      } else {
        await Album.create(ALBUM_NAME, [asset]);
      }
    } catch {
      // The image is already saved; album filing is a nicety.
    }
    return { ok: true };
  } catch {
    try {
      const uri = await resolveLocalUri(wallpaper);
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Save this wallpaper to your photos',
        });
        return { ok: true };
      }
    } catch {
      // Fall through to the error below.
    }
    return { ok: false, error: 'The wallpaper could not be saved. Try again in a moment.' };
  }
}
