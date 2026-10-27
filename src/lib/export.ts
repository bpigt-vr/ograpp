import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Writes a JSON snapshot to the cache and opens the system share sheet, so users
 * can keep or delete their data outside the app.
 */
export async function shareJSON(
  filename: string,
  data: unknown,
  dialogTitle = 'Export Overgrowth Renaissance data'
): Promise<{ ok: boolean; error?: string }> {
  if (Platform.OS === 'web') {
    return { ok: false, error: 'Exports are available in the iOS and Android app.' };
  }
  try {
    const dir = new Directory(Paths.cache, 'ogr-export');
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const file = new File(dir, filename);
    if (file.exists) file.delete();
    file.create();
    await file.write(JSON.stringify(data, null, 2));
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle });
      return { ok: true };
    }
    return { ok: false, error: 'Sharing is not available on this device.' };
  } catch {
    return { ok: false, error: 'The export could not be created. Try again.' };
  }
}
