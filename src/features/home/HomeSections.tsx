import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Artwork } from '@/components/Artwork';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { Card, SectionHeader } from '@/components/Surfaces';
import type { Album, Track } from '@/data/tracks';
import type { CommunityPost } from '@/features/community/types';
import { TrackRow } from '@/features/music/TrackRow';
import { useTheme } from '@/theme';

export function ContinueListening({
  tracks,
  onOpenLibrary,
}: {
  tracks: Track[];
  onOpenLibrary: () => void;
}) {
  if (tracks.length === 0) return null;
  return (
    <View>
      <SectionHeader
        title="Pick up where you left off"
        actionLabel="Library"
        onAction={onOpenLibrary}
      />
      <Card padded={false} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
        {tracks.map((track) => (
          <TrackRow key={track.id} track={track} queue={tracks} />
        ))}
      </Card>
    </View>
  );
}

export function ReleaseHighlight({
  album,
  onOpen,
  onPlay,
}: {
  album: Album;
  onOpen: () => void;
  onPlay: () => void;
}) {
  return (
    <View>
      <SectionHeader title="New release" />
      <Card padded={false} style={{ overflow: 'hidden' }}>
        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={`${album.title} — open album`}
          style={({ pressed }) => [{ flexDirection: 'row', opacity: pressed ? 0.85 : 1 }]}
        >
          <Artwork gradient={album.gradient} size={128} radius={0} showTitle={false} />
          <View style={{ flex: 1, padding: 14, gap: 6, justifyContent: 'center' }}>
            <AppText variant="label" color="accent">
              {album.kind.toUpperCase()} · {album.tracks.length} TRACKS
            </AppText>
            <AppText variant="heading" numberOfLines={2}>
              {album.title}
            </AppText>
            <AppText variant="small" color="textMuted" numberOfLines={3}>
              {album.description}
            </AppText>
          </View>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8, padding: 12, paddingTop: 0, alignItems: 'center' }}>
          <Button label="Play album" size="sm" icon="play" onPress={onPlay} />
          <Button label="Details" size="sm" variant="ghost" onPress={onOpen} />
          <View style={{ flex: 1 }} />
          {album.isPreview ? (
            <Chip label="Preview audio" icon="information-circle-outline" size="sm" tone="gold" />
          ) : null}
        </View>
      </Card>
    </View>
  );
}

export function AnnouncementHighlight({
  post,
  onOpenCommunity,
}: {
  post: CommunityPost;
  onOpenCommunity: () => void;
}) {
  return (
    <View>
      <SectionHeader title="From the artist" actionLabel="Community" onAction={onOpenCommunity} />
      <Card style={{ gap: 6 }}>
        <AppText variant="label" color="textFaint">
          ANNOUNCEMENT
        </AppText>
        <AppText variant="subheading">{post.title}</AppText>
        <AppText variant="small" color="textMuted" numberOfLines={4}>
          {post.body}
        </AppText>
      </Card>
    </View>
  );
}

export function PollHighlight({ post, onOpen }: { post: CommunityPost; onOpen: () => void }) {
  const theme = useTheme();
  if (!post.poll) return null;
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Poll: ${post.poll.question}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Card style={{ gap: 8 }} tone="accent">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="stats-chart" size={14} color={theme.colors.accent} />
          <AppText variant="label" color="accent">
            COMMUNITY POLL
          </AppText>
        </View>
        <AppText variant="subheading">{post.poll.question}</AppText>
        <AppText variant="small" color="textMuted">
          Vote in the community tab · earn 10 points.
        </AppText>
      </Card>
    </Pressable>
  );
}
