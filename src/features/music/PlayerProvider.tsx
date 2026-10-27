import {
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
  type AudioPlayer,
} from 'expo-audio';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getAlbum, type Track } from '@/data/tracks';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { getPlan, tierAtLeast } from '@/features/membership/plans';
import { useRewardGrant } from '@/features/rewards/useRewardGrant';
import { toDayKey } from '@/lib/date';
import { useLibraryStore } from './useLibraryStore';

type PlayResult = { ok: boolean; error?: string };

export type PlayerState = {
  current: Track | null;
  queue: Track[];
  index: number;
  isPlaying: boolean;
  isBuffering: boolean;
  isLoaded: boolean;
  positionSec: number;
  durationSec: number;
  error: string | null;
  canSkipNext: boolean;
  canSkipPrevious: boolean;
  play: (track: Track, queue?: Track[]) => Promise<PlayResult>;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => void;
  volume: number;
  clearError: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

/** Kept outside React so navigation never tears down the audio session. */
let sharedPlayer: AudioPlayer | null = null;
function playerInstance(): AudioPlayer {
  if (!sharedPlayer) {
    sharedPlayer = createAudioPlayer(null, { updateInterval: 500 });
  }
  return sharedPlayer;
}

function applyVolume(volume: number) {
  if (!sharedPlayer) return;
  try {
    sharedPlayer.volume = volume;
  } catch {
    // Volume is best-effort on some platforms.
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const player = useMemo(() => playerInstance(), []);
  const status = useAudioPlayerStatus(player);
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(-1);
  const [localError, setLocalError] = useState<string | null>(null);
  const error = localError ?? status.error ?? null;
  const finishHandled = useRef(false);

  const volume = useLibraryStore((state) => state.volume);
  const setStoredVolume = useLibraryStore((state) => state.setVolume);
  const recordPlay = useLibraryStore((state) => state.recordPlay);
  const recordCompletion = useLibraryStore((state) => state.recordCompletion);
  const downloads = useLibraryStore((state) => state.downloads);
  const grant = useRewardGrant();

  const current = index >= 0 ? (queue[index] ?? null) : null;

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    applyVolume(volume);
  }, [volume]);

  const loadAndPlay = useCallback(
    (track: Track, list: Track[], nextIndex: number): Promise<PlayResult> => {
      const membership = useAuthStore.getState().membership.tier;
      if (!tierAtLeast(membership, track.requiresTier)) {
        return Promise.resolve({
          ok: false,
          error: `This release is part of the ${getPlan(track.requiresTier).name} plan.`,
        });
      }
      const localUri = downloads[track.id]?.uri;
      try {
        player.replace(localUri ? { uri: localUri } : track.source);
        player.play();
        try {
          player.setActiveForLockScreen(true, {
            title: track.title,
            artist: track.artist,
            albumTitle: getAlbum(track.albumId)?.title,
          });
        } catch {
          // Lock screen controls are optional (unsupported on web).
        }
      } catch {
        setLocalError('This track could not be loaded. Check your connection and try again.');
        return Promise.resolve({ ok: false, error: 'Playback failed to start.' });
      }
      setQueue(list);
      setIndex(nextIndex);
      setLocalError(null);
      finishHandled.current = false;
      recordPlay(track.id);
      return Promise.resolve({ ok: true });
    },
    [downloads, player, recordPlay]
  );

  const play = useCallback(
    (track: Track, list?: Track[]) => {
      const nextQueue = list && list.length > 0 ? list : [track];
      const nextIndex = Math.max(
        0,
        nextQueue.findIndex((item) => item.id === track.id)
      );
      return loadAndPlay(track, nextQueue, nextIndex);
    },
    [loadAndPlay]
  );

  const next = useCallback(() => {
    if (queue.length === 0) return;
    const nextIndex = (index + 1) % queue.length;
    void loadAndPlay(queue[nextIndex], queue, nextIndex);
  }, [index, loadAndPlay, queue]);

  const previous = useCallback(() => {
    if (queue.length === 0) return;
    const nextIndex = (index - 1 + queue.length) % queue.length;
    void loadAndPlay(queue[nextIndex], queue, nextIndex);
  }, [index, loadAndPlay, queue]);

  const toggle = useCallback(() => {
    if (!current) return;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [current, player, status.playing]);

  const seek = useCallback(
    async (seconds: number) => {
      try {
        await player.seekTo(Math.max(0, seconds));
      } catch {
        setLocalError('Seeking is not available for this track.');
      }
    },
    [player]
  );

  // Count a completed listen once per track load (75% threshold, keyed per day).
  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (nextStatus) => {
      if (!nextStatus.didJustFinish || finishHandled.current) return;
      const track = current;
      if (!track) return;
      finishHandled.current = true;
      const duration = nextStatus.duration || track.durationSec;
      const reached = duration > 0 ? nextStatus.currentTime / duration >= 0.75 : true;
      if (reached) {
        recordCompletion(track.id);
        grant('listen', { key: `${track.id}:${toDayKey()}`, note: track.title });
      }
      if (queue.length > 1) {
        const nextIndex = (index + 1) % queue.length;
        void loadAndPlay(queue[nextIndex], queue, nextIndex);
      }
    });
    return () => subscription.remove();
  }, [player, current, queue, index, loadAndPlay, recordCompletion, grant]);

  const setVolume = useCallback(
    (value: number) => {
      setStoredVolume(Math.min(1, Math.max(0, value)));
    },
    [setStoredVolume]
  );

  const value = useMemo<PlayerState>(
    () => ({
      current,
      queue,
      index,
      isPlaying: status.playing,
      isBuffering: status.isBuffering,
      isLoaded: status.isLoaded,
      positionSec: status.currentTime ?? 0,
      durationSec: status.duration || current?.durationSec || 0,
      error,
      canSkipNext: queue.length > 1,
      canSkipPrevious: queue.length > 1,
      play,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      volume,
      clearError: () => setLocalError(null),
    }),
    [
      current,
      error,
      index,
      next,
      play,
      previous,
      queue,
      seek,
      setVolume,
      status.currentTime,
      status.duration,
      status.isBuffering,
      status.isLoaded,
      status.playing,
      toggle,
      volume,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerState {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return context;
}
