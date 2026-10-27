import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Elements';
import { Card } from '@/components/Surfaces';
import { useState } from 'react';
import type { ReportReason } from './types';
import { useTheme } from '@/theme';

const REASONS: { id: ReportReason; label: string }[] = [
  { id: 'harassment', label: 'Harassment' },
  { id: 'hate', label: 'Hate speech' },
  { id: 'spam', label: 'Spam or scam' },
  { id: 'sexual', label: 'Sexual content' },
  { id: 'self-harm', label: 'Self-harm' },
  { id: 'other', label: 'Something else' },
];

export function ReportDialog({
  visible,
  onClose,
  onSubmit,
  targetLabel,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, note?: string) => void;
  targetLabel: string;
}) {
  const theme = useTheme();
  const [reason, setReason] = useState<ReportReason>('harassment');
  const [note, setNote] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close report dialog">
        <Pressable style={{ width: '100%' }} onPress={() => undefined}>
          <Card style={{ gap: 12 }}>
            <View style={{ gap: 2 }}>
              <AppText variant="subheading">Report {targetLabel}</AppText>
              <AppText variant="small" color="textFaint">
                Reports go to the moderator queue. The author is not told who reported them.
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {REASONS.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  size="sm"
                  selected={reason === item.id}
                  onPress={() => setReason(item.id)}
                />
              ))}
            </View>
            <TextInput
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="Anything the moderator should know? (optional)"
              placeholderTextColor={theme.colors.textFaint}
              style={{
                minHeight: 72,
                borderRadius: 12,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceAlt,
                color: theme.colors.text,
                padding: 10,
                fontFamily: theme.fonts.body,
                fontSize: 14,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
              <Button label="Cancel" variant="ghost" size="sm" onPress={onClose} />
              <Button
                label="Send report"
                size="sm"
                icon="flag"
                onPress={() => {
                  onSubmit(reason, note.trim() || undefined);
                  setNote('');
                  onClose();
                }}
              />
            </View>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,5,4,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
