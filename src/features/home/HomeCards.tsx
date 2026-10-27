import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip, Pill, ProgressBar } from '@/components/Elements';
import { Card, SectionHeader } from '@/components/Surfaces';
import { getSampleProduct, type StoreProduct } from '@/data/products';
import { ProductCard } from '@/features/store/ProductCard';
import { formatNumber } from '@/lib/format';
import { useTheme } from '@/theme';

export function DailyQuoteCard({
  quote,
  streak,
  hasEntryToday,
  onWrite,
  onHistory,
}: {
  quote: string;
  streak: number;
  hasEntryToday: boolean;
  onWrite: () => void;
  onHistory: () => void;
}) {
  const theme = useTheme();
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name="sparkles" size={14} color={theme.colors.gold} />
        <AppText variant="label" color="textFaint">
          TODAY’S INSPIRATION
        </AppText>
        <View style={{ flex: 1 }} />
        <Chip
          label={streak > 0 ? `${streak}-day streak` : 'Start a streak'}
          icon="flame-outline"
          size="sm"
        />
      </View>
      <AppText variant="quote">{quote}</AppText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          label={hasEntryToday ? 'Review today’s entry' : 'Write today’s reflection'}
          size="sm"
          icon={hasEntryToday ? 'checkmark-circle-outline' : 'create-outline'}
          onPress={onWrite}
        />
        <Button label="History" variant="ghost" size="sm" onPress={onHistory} />
      </View>
    </Card>
  );
}

export function MerchRail({
  onOpenStore,
  onOpenProduct,
}: {
  onOpenStore: () => void;
  onOpenProduct: (id: string) => void;
}) {
  const theme = useTheme();
  const items = ['renaissance-hoodie', 'maple-tee']
    .map((id) => getSampleProduct(id))
    .filter((product): product is StoreProduct => Boolean(product));
  return (
    <View>
      <SectionHeader title="Merch" actionLabel="Store" onAction={onOpenStore} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => onOpenProduct(product.id)}
          />
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 8 }}>
        <Ionicons name="information-circle-outline" size={13} color={theme.colors.textFaint} />
        <AppText variant="small" color="textFaint" style={{ flex: 1 }}>
          Sample catalogue for preview builds — the live shop is on overgrowthrenaissance.com.
        </AppText>
      </View>
    </View>
  );
}

export function RewardsStrip({
  points,
  lifetimePoints,
  progress,
  level,
  nextName,
  nextFloor,
  onOpen,
}: {
  points: number;
  lifetimePoints: number;
  progress: number;
  level: number;
  nextName: string | null;
  nextFloor: number | null;
  onOpen: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Rewards: ${points} points, level ${level}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Card style={{ gap: 10 }} tone="alt">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="trophy-outline" size={16} color={theme.colors.gold} />
          <AppText variant="smallMedium">Level {level}</AppText>
          <View style={{ flex: 1 }} />
          <AppText variant="smallMedium" color="accent">
            {formatNumber(points)} pts
          </AppText>
        </View>
        <ProgressBar value={progress} />
        <AppText variant="small" color="textFaint">
          {nextFloor
            ? `${formatNumber(nextFloor - lifetimePoints)} points to ${nextName}`
            : 'Top level reached — keep stacking receipts.'}
        </AppText>
      </Card>
    </Pressable>
  );
}

export function MembershipCard({
  planName,
  status,
  blurb,
  onPlans,
  onWebsite,
}: {
  planName: string;
  status: 'free' | 'preview' | 'verified';
  blurb: string;
  onPlans: () => void;
  onWebsite: () => void;
}) {
  const theme = useTheme();
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="ribbon-outline" size={16} color={theme.colors.accent} />
        <AppText variant="smallMedium">Hoser Gang membership</AppText>
        <View style={{ flex: 1 }} />
        <Pill
          text={status === 'preview' ? 'Preview' : status === 'verified' ? 'Verified' : planName}
          tone="accent"
        />
      </View>
      <AppText variant="small" color="textMuted">
        {blurb}
      </AppText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="See plans" size="sm" onPress={onPlans} />
        <Button label="Official site" size="sm" variant="ghost" onPress={onWebsite} />
      </View>
    </Card>
  );
}
