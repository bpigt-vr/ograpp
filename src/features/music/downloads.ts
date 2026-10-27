import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';

import type { Track } from '@/data/tracks';

const FOLDER = 'ogr-audio';

function audioDir(): Directory {
  const dir = new Directory(Paths.document, FOLDER);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

function extensionFor(track: Track): string {
  const uri = typeof track.source === 'number' ? '' : track.source.uri;
  const match = uri.match(/\.(wav|mp3|m4a|aac|ogg)(\?|$)/i);
  return match ? match[1].toLowerCase() : 'wav';
}

/**
 * Downloads a track into the app's document directory so it plays offline.
 * Bundled preview assets are copied out of the bundle; remote masters are
 * streamed straight to disk.
 */
export async function downloadTrackAudio(
  track: Track
): Promise<{ uri: string; bytes: number }> {
  const dir = audioDir();
  const destination = new File(dir, `${track.id}.${extensionFor(track)}`);
  if (destination.exists) {
    return { uri: destination.uri, bytes: destination.size ?? 0 };
  }

  let sourceUri: string | null = null;
  if (typeof track.source === 'number') {
    const asset = Asset.fromModule(track.source);
    await asset.downloadAsync();
    sourceUri = asset.localUri ?? asset.uri;
  } else {
    sourceUri = track.source.uri;
  }

  if (!sourceUri) {
    throw new Error('This track has no playable source yet.');
  }

  if (sourceUri.startsWith('file://') || sourceUri.startsWith('/')) {
    const source = new File(sourceUri);
    if (!source.exists) throw new Error('The audio file could not be found on this device.');
    await source.copy(destination, { overwrite: true });
  } else {
    await File.downloadFileAsync(sourceUri, destination, { idempotent: true });
  }

  return { uri: destination.uri, bytes: destination.size ?? 0 };
}

export async function deleteDownloadedAudio(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Nothing to clean up.
  }
}

export function downloadedAudioUri(trackId: string, downloads: Record<string, { uri: string }>) {
  return downloads[trackId]?.uri ?? null;
}
