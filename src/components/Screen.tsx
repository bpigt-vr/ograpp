import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { AppText } from './AppText';
import { IconButton } from './Button';

export function ScreenHeader({
  title,
  eyebrow,
  subtitle,
  back,
  onBack,
  right,
}: {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  if (!title && !eyebrow && !right && !back) return null;
  return (
    <View style={styles.header}>
      {back ? (
        <IconButton
          icon="chevron-back"
          label="Go back"
          onPress={() => (onBack ? onBack() : router.back())}
        />
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        {eyebrow ? (
          <AppText variant="label" color="accent">
            {eyebrow.toUpperCase()}
          </AppText>
        ) : null}
        {title ? <AppText variant="title">{title}</AppText> : null}
        {subtitle ? (
          <AppText variant="small" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Screen({
  children,
  title,
  eyebrow,
  subtitle,
  right,
  back,
  onBack,
  scroll = true,
  padded = true,
  contentStyle,
  footer,
  refreshControl,
  bottomInset = 120,
}: {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  right?: React.ReactNode;
  back?: boolean;
  onBack?: () => void;
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: ViewStyle;
  footer?: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  bottomInset?: number;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const header = (
    <ScreenHeader
      title={title}
      eyebrow={eyebrow}
      subtitle={subtitle}
      back={back}
      onBack={onBack}
      right={right}
    />
  );
  const inner = (
    <>
      {header}
      {children}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View style={{ flex: 1 }}>
          {scroll ? (
            <ScrollView
              contentContainerStyle={[
                {
                  paddingHorizontal: padded ? theme.spacing.lg : 0,
                  paddingBottom: bottomInset + insets.bottom,
                  gap: theme.spacing.lg,
                  maxWidth: theme.limits.contentMaxWidth,
                  width: '100%',
                  alignSelf: 'center',
                },
                contentStyle,
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              refreshControl={refreshControl}
            >
              {inner}
            </ScrollView>
          ) : (
            <View
              style={[
                {
                  flex: 1,
                  paddingHorizontal: padded ? theme.spacing.lg : 0,
                  paddingBottom: bottomInset,
                  maxWidth: theme.limits.contentMaxWidth,
                  width: '100%',
                  alignSelf: 'center',
                  gap: theme.spacing.lg,
                },
                contentStyle,
              ]}
            >
              {inner}
            </View>
          )}
        </View>
        {footer}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 18,
    paddingBottom: 4,
  },
});
