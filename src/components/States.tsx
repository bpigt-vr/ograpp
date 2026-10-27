import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View, type DimensionValue } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Surfaces';

type IconName = keyof typeof Ionicons.glyphMap;

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={stateStyles.center}>
      <ActivityIndicator color={theme.colors.accent} />
      <AppText variant="small" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: {
  icon?: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const theme = useTheme();
  return (
    <Card style={{ alignItems: 'center', gap: 10, paddingVertical: theme.spacing.xxl }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: theme.colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={24} color={theme.colors.accent} />
      </View>
      <AppText variant="subheading" align="center">
        {title}
      </AppText>
      <AppText variant="small" color="textMuted" align="center" style={{ maxWidth: 320 }}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} size="sm" style={{ marginTop: 4 }} />
      ) : null}
      {secondaryLabel && onSecondary ? (
        <Button label={secondaryLabel} onPress={onSecondary} variant="ghost" size="sm" />
      ) : null}
    </Card>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const theme = useTheme();
  return (
    <Card style={{ gap: 8 }} tone="alt">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="alert-circle-outline" size={20} color={theme.colors.danger} />
        <AppText variant="subheading" style={{ color: theme.colors.danger }}>
          {title}
        </AppText>
      </View>
      <AppText variant="small" color="textMuted">
        {message}
      </AppText>
      {onRetry ? (
        <Button
          label={retryLabel}
          onPress={onRetry}
          variant="secondary"
          size="sm"
          icon="refresh"
          style={{ marginTop: 4 }}
        />
      ) : null}
    </Card>
  );
}

export function Skeleton({ height = 16, width = '100%' as DimensionValue, radius = 8 }) {
  const theme = useTheme();
  return (
    <View
      style={{
        height,
        width,
        borderRadius: radius,
        backgroundColor: theme.colors.surfaceAlt,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <Card style={{ gap: 10 }}>
      <SkelRow />
      <Skeleton height={14} width="70%" />
      <Skeleton height={12} width="45%" />
    </Card>
  );
}

function SkelRow() {
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      <Skeleton height={44} width={44} radius={22} />
      <Skeleton height={14} width="40%" />
    </View>
  );
}

export const stateStyles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 32 },
});
