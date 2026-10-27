import { useCallback, useState } from 'react';

import { useToast } from '@/components/Toast';
import type { Track } from '@/data/tracks';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { getPlan, tierAtLeast } from '@/features/membership/plans';
import { downloadTrackAudio } from './downloads';
import { useLibraryStore } from './useLibraryStore';

export function useTrackDownloads() {
  const tier = useAuthStore((state) => state.membership.tier);
  const downloads = useLibraryStore((state) => state.downloads);
  const saveDownload = useLibraryStore((state) => state.saveDownload);
  const removeDownload = useLibraryStore((state) => state.removeDownload);
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const canDownload = useCallback(
    (track: Track) => tierAtLeast(tier, track.downloadRequiresTier),
    [tier]
  );

  const download = useCallback(
    async (track: Track): Promise<{ ok: boolean; error?: string }> => {
      if (downloads[track.id]) return { ok: true };
      if (!tierAtLeast(tier, track.downloadRequiresTier)) {
        const plan = getPlan(track.downloadRequiresTier);
        return {
          ok: false,
          error: `Offline downloads are included with the ${plan.name} plan.`,
        };
      }
      setBusyId(track.id);
      try {
        const file = await downloadTrackAudio(track);
        saveDownload({
          trackId: track.id,
          uri: file.uri,
          bytes: file.bytes,
          downloadedAt: Date.now(),
        });
        toast.show(`${track.title} saved offline`, 'success');
        return { ok: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'The download could not be completed.';
        toast.show(message, 'error');
        return { ok: false, error: message };
      } finally {
        setBusyId(null);
      }
    },
    [downloads, saveDownload, tier, toast]
  );

  return {
    download,
    busyId,
    downloads,
    removeDownload,
    canDownload,
    tier,
    isDownloaded: (trackId: string) => Boolean(downloads[trackId]),
  };
}
